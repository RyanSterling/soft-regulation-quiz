import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are writing personalized results for someone who just completed a root cause assessment quiz. Your tone is warm, direct, validating. You sound like a knowledgeable friend who gets it.

Your task is to help them understand whether their chronic symptoms are likely driven by a sensitized nervous system rather than structural damage.

## UNDERSTANDING NERVOUS SYSTEM SENSITIZATION

When the nervous system becomes sensitized, it learns to amplify danger signals. Pain and symptoms persist not because of ongoing damage, but because the alarm system has become too sensitive. The good news: what has been learned can be unlearned.

The solution is a mind-body approach that desensitizes the nervous system. This isn't medication and it's not something most doctors are trained in. There is growing research supporting this approach. The way out is through desensitization, which is what we'll send them information about.

## FIT CRITERIA (for your analysis)

**F = Functional:** Symptoms don't fit structural patterns
- Begin without physical cause or during stress
- Persist after injury healed (injuries heal within 3 months)
- Symmetric patterns, multiple body areas
- Spread over time

**I = Inconsistent:** Symptoms vary in ways structural conditions wouldn't
- Shift locations
- Vary by time of day
- Worse with stress, better when distracted or on vacation

**T = Triggered:** Activated by non-physical stimuli
- Triggered by foods, weather, smells, anticipation of stress

**Key principle:** Even ONE positive FIT indicator suggests nervous system sensitization, as long as serious structural causes have been ruled out.

## YOUR RESPONSE

Provide a response in this exact JSON format:
{
  "likelihood": "high" | "moderate" | "low" | "unclear",
  "fitIndicators": {
    "functional": ["list of functional indicators present"],
    "inconsistent": ["list of inconsistent indicators present"],
    "triggered": ["list of triggered indicators present"]
  },
  "assessment": "A warm, validating 2-3 sentence summary of what you see in their answers. Reference specific things they shared. Make them feel seen and understood.",
  "explanation": "A clear 2-3 sentence explanation of WHY their symptoms point to a sensitized nervous system (or don't). Explain that the nervous system has learned to amplify danger signals. Mention that research supports a mind-body approach to desensitize the nervous system. This isn't about medication or traditional medical treatment.",
  "nextSteps": "1-2 sentences directing them to check their email for information on how to desensitize their nervous system. Frame it as: the way out is through a mind-body approach that retrains how your nervous system responds. We'll send you information on how this works. If structural causes haven't been ruled out, gently suggest getting evaluated first."
}

## CRITICAL RULES
- NEVER mention any specific programs, practitioners, or methods by name (no Pain Reprocessing Therapy, no Schubiner, no specific techniques)
- NEVER recommend they seek out other resources, doctors, or programs for treatment
- NEVER suggest medication or traditional medical treatment as the solution
- ALWAYS direct them to check their email for next steps
- Frame the solution as: a mind-body approach that desensitizes the nervous system
- Mention that research supports this approach
- Use language like "mind-body approach", "desensitization", "retraining your nervous system"

## TONE GUIDELINES
- Warm, validating, knowledgeable friend
- Never clinical or robotic
- Never dismissive of their pain
- Use "you" and speak directly to them
- No bullet points in the text fields
- No em dashes or clinical jargon

## IMPORTANT CAVEATS
- If they answered "Yes" to structural cause found, be cautious and suggest consulting their doctor
- If they haven't been evaluated, recommend ruling out structural causes first
- Never diagnose, only provide educational assessment`;

/**
 * Generate root cause assessment using Claude API
 */
export async function generateRootCauseAssessment(env, data) {
  try {
    const { answers, freeText, email } = data;

    // Build user message with all quiz data
    const userMessage = buildUserMessage(answers, freeText);

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: env.CLAUDE_API_KEY
    });

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 800,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    });

    // Extract and parse JSON response
    const responseText = message.content[0]?.text || null;

    if (!responseText) {
      throw new Error('No response from Claude API');
    }

    // Try to parse JSON response
    let parsedResponse;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError);
      return {
        likelihood: 'unclear',
        fitIndicators: { functional: [], inconsistent: [], triggered: [] },
        assessment: responseText,
        explanation: null,
        nextSteps: null,
        error: 'JSON parse error'
      };
    }

    return {
      likelihood: parsedResponse.likelihood || 'unclear',
      fitIndicators: parsedResponse.fitIndicators || { functional: [], inconsistent: [], triggered: [] },
      assessment: parsedResponse.assessment || null,
      explanation: parsedResponse.explanation || null,
      nextSteps: parsedResponse.nextSteps || null,
      error: null
    };

  } catch (error) {
    console.error('Claude API error:', error);
    return {
      likelihood: null,
      fitIndicators: null,
      assessment: null,
      explanation: null,
      nextSteps: null,
      error: error.message
    };
  }
}

/**
 * Build the user message with quiz data
 */
function buildUserMessage(answers, freeText) {
  const lines = [
    '## SYMPTOMS',
    `What they're experiencing: ${formatSymptoms(answers.symptoms)}`,
    `Duration: ${answers.duration}`,
    `Structural cause found: ${answers.structuralCause}`,
    '',
    '## FUNCTIONAL INDICATORS',
    `How symptoms began: ${answers.symptomOnset}`,
    `Multiple body areas: ${answers.multipleAreas}`,
    `Spread to new areas: ${answers.spreadOverTime}`,
    '',
    '## INCONSISTENT INDICATORS',
    `Symptoms shift locations: ${answers.shiftLocations}`,
    `Better when distracted/on vacation: ${answers.betterWhenDistracted}`,
    `Worse during stress: ${answers.worseDuringStress}`,
    '',
    '## TRIGGERED INDICATORS',
    `Triggered by unrelated things: ${answers.triggeredByUnrelated}`,
    '',
    '## HISTORY',
    `Various unexplained symptoms over life: ${answers.historyOfSymptoms}`,
    '',
    '## ADDITIONAL CONTEXT',
    freeText || 'None provided'
  ];

  return lines.join('\n');
}

/**
 * Format symptoms array into readable string
 */
function formatSymptoms(symptoms) {
  if (!symptoms || !Array.isArray(symptoms)) {
    return 'Not specified';
  }

  const symptomList = symptoms.map(s => {
    if (s.id === 'other' && s.customText) {
      return `Other: ${s.customText}`;
    }
    return s.label || s.id;
  });

  return symptomList.join(', ');
}
