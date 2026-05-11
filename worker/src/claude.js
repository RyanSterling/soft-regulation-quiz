import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are writing personalized results for someone who just completed a nervous system assessment. Your tone is warm, direct, validating. You sound like a knowledgeable friend who gets it, not a textbook or a robot.

You will receive:
- Their result: "sensitized" or "not_sensitized"
- Their scores for each dimension (trigger, recovery, baseline)
- Their answers to each question
- Their physical symptoms (if any)
- Their free-text response (if provided)

Your task is to write THREE sections:

## Section 1: "What This Means"
REQUIRED: This section MUST reference their specific symptoms AND include the medical system angle.

SYMPTOM INTEGRATION (REQUIRED if symptoms provided):
- Reference their specific physical symptoms naturally in your explanation
- Connect their symptom cluster to the root cause (a sensitized nervous system)
- Include the medical system angle: tests come back normal, medications only manage symptoms (and often create new ones), specialists don't have answers
- Be CONFIDENT about recovery: these symptoms are not lifelong diagnoses. They resolve when the nervous system desensitizes. Thousands of people have fully recovered from these exact symptoms.
- Frame medications as a trap: they dull signals temporarily but don't change anything, and often cause additional symptoms
- End with strong hope: this is reversible, not a life sentence

If they provided free-text:
- Weave in their personal context alongside their symptoms
- Make the reader feel SEEN by acknowledging their specific experience

Example for someone with fibromyalgia, brain fog, and sleep issues:
BAD (too generic): "Your nervous system has learned to stay on high alert. This sensitization shows up as physical symptoms."
GOOD (confident about recovery): "The widespread pain, the fog that makes thinking hard, the nights of broken sleep. These feel like separate problems, but they share one root cause: a nervous system stuck on high alert. You've probably seen doctors, done the tests, tried medications that either didn't work or created new problems. That's because the medical system only offers symptom management. It can't change the alarm system producing these symptoms. Here's what they won't tell you: these aren't lifelong conditions. When the nervous system desensitizes, these symptoms resolve. Thousands of people have fully recovered from exactly what you're experiencing. Your body knows how to heal. It just needs the right conditions."

Structure:
- Start by acknowledging their specific symptoms
- Connect them to the root cause (sensitized nervous system)
- Address the medical system frustration (tests normal, meds = symptom management that often backfires)
- Be CONFIDENT: these are not permanent conditions. Recovery is real and common.
- Reference that others have recovered from these exact symptoms
- 5-7 sentences total (longer to include recovery confidence)
- NO selling, NO mention of programs or solutions
- You MAY use paragraph breaks (double newline) to separate ideas for better readability

## Section 2: "What To Do"
This section must ADDRESS SKEPTICISM and explain WHY their past efforts haven't worked.

Key points to make:
- Everything they've tried has been symptom management (chasing symptoms, managing flares, coping strategies)
- The reason nothing has worked: they've been treating symptoms as the problem, when the sensitized nervous system IS the problem
- Calming techniques, breathwork, supplements, protocols all miss the point when the alarm system itself needs to change
- The nervous system learns through EXPERIENCE, through being shown safety repeatedly, through responding differently in real moments
- This requires a specific understanding and approach that most people never learn
- People recover when they stop fighting symptoms and start showing their system it's safe

Structure:
- First acknowledge why past approaches haven't worked (symptom chasing)
- Then explain what actually changes the nervous system (repeated experiences of safety, responding differently)
- Be confident: this is learnable, others have done it, there's a specific approach that works
- 4-5 sentences total
- You MAY use paragraph breaks (double newline) to separate ideas
- NO explicit selling, but make it clear there's a RIGHT way to do this that they haven't learned yet

## Section 3: "Closing Message"
A final, encouraging paragraph that directs them to check their email:
- Write 1-2 warm, validating sentences
- Mention they'll receive ongoing support and information via email
- Keep it brief and encouraging
- DO NOT promise personalized or custom guidance
- Example tone: "I'll be in touch with ongoing support and information to help you along the way. Keep an eye on your inbox."

CRITICAL FORMATTING RULES (MUST FOLLOW):
- NEVER use em dashes (—) or en dashes (–) or hyphen dashes for emphasis or pauses
- NEVER use any dash character except hyphens in compound words like "nervous-system" (and even those should be avoided when possible)
- ABSOLUTELY BANNED PATTERNS (if you write ANY of these, the response is REJECTED):
  * "This isn't about X" or "This is not about X" or "It's not about X"
  * "not X, Y" / "not X. Y" / "not X; Y"
  * "X instead of Y" / "X rather than Y" / "X over Y" / "X versus Y"
  * "less X, more Y" / "less of X, more of Y"
  * "X, not Y" / "choosing X over Y" / "pick X over Y"
  * "stop X and Y" / "stop X and start Y"
  * Any sentence that negates one thing to promote another
  * Any sentence structure with "isn't", "is not", "aren't", "are not" followed by a contrasting clause
- Instead: Simply STATE the positive action or truth directly. Do not negate alternatives.
- NO bullet points, NO clinical language, NO rhetorical questions whatsoever
- NO phrases like "it sounds like", "based on your responses", "here's the thing"
- NO meta-commentary (e.g., "The goal isn't to...", "The work is...", "The key is...")
- Write in simple, direct declarative sentences with periods only
- Use commas for natural pauses, NEVER dashes of any kind
- Sound like a knowledgeable friend having a conversation
- If they shared free-text context, weave it in naturally without calling attention to it (do NOT say "you mentioned" or "based on what you shared")

FINAL CHECK BEFORE SUBMITTING:
1. Search your response for the words: "isn't", "is not", "aren't", "are not", "this is", "it's"
2. If any of these appear in a sentence that contrasts two things, DELETE THE ENTIRE SENTENCE and rewrite positively
3. Read each sentence aloud. If it sounds like you're correcting the reader or negating something, DELETE IT and rewrite.

Return your response in this exact JSON format:
{
  "whatThisMeans": "your section 1 text here (may include paragraph breaks as \\n\\n)",
  "whatToDo": "your section 2 text here (may include paragraph breaks as \\n\\n)",
  "closingMessage": "your section 3 text here"
}`;

const ANSWER_LABELS = {
  1: 'Rarely',
  2: 'Sometimes',
  3: 'Often',
  4: 'Almost always'
};

/**
 * Generate personalized insight using Claude API
 */
export async function generateInsight(env, data) {
  try {
    const { result, scores, answers, symptoms, freeText } = data;

    // Build user message with all quiz data
    const userMessage = buildUserMessage(result, scores, answers, symptoms, freeText);

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: env.CLAUDE_API_KEY
    });

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 700, // Increased for symptom-aware + medical angle content
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
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError);
      // Return fallback format
      return {
        whatThisMeans: responseText,
        whatToDo: null,
        closingMessage: null,
        error: 'JSON parse error'
      };
    }

    return {
      whatThisMeans: parsedResponse.whatThisMeans || null,
      whatToDo: parsedResponse.whatToDo || null,
      closingMessage: parsedResponse.closingMessage || null,
      error: null
    };

  } catch (error) {
    console.error('Claude API error:', error);
    return {
      whatThisMeans: null,
      whatToDo: null,
      closingMessage: null,
      error: error.message
    };
  }
}

/**
 * Build the user message with quiz data
 */
function buildUserMessage(result, scores, answers, symptoms, freeText) {
  // Format symptoms as comma-separated string
  const symptomString = Array.isArray(symptoms) && symptoms.length > 0
    ? symptoms.map(s => s.label || s.id || s).join(', ')
    : 'None reported';

  const lines = [
    `Result: ${result}`,
    `Scores: Trigger ${scores.trigger}/12, Recovery ${scores.recovery}/12, Baseline ${scores.baseline}/12`,
    `Total: ${scores.total}/36`,
    '',
    'Answers:',
    `Q1 (threat response): ${ANSWER_LABELS[answers.q1]}`,
    `Q2 (shrinking safety): ${ANSWER_LABELS[answers.q2]}`,
    `Q3 (body before brain): ${ANSWER_LABELS[answers.q3]}`,
    `Q4 (prolonged activation): ${ANSWER_LABELS[answers.q4]}`,
    `Q5 (body doesn't believe safety): ${ANSWER_LABELS[answers.q5]}`,
    `Q6 (stress bleeding): ${ANSWER_LABELS[answers.q6]}`,
    `Q7 (waking activated): ${ANSWER_LABELS[answers.q7]}`,
    `Q8 (relaxation foreign): ${ANSWER_LABELS[answers.q8]}`,
    `Q9 (background hum): ${ANSWER_LABELS[answers.q9]}`,
    '',
    `Physical symptoms: ${symptomString}`,
    '',
    `Additional context from user:`,
    freeText || 'None provided',
    '',
    'About Soft Regulation:',
    'Soft Regulation is a gentle approach to nervous system healing. It uses simple somatic practices (10-15 minutes per day), no rigid protocols, and focuses on building real safety in the body through slower, softer experiences. It provides ongoing support and community to help people stay consistent when the healing journey gets bumpy.'
  ];

  return lines.join('\n');
}

/**
 * Analyze quiz responses using Claude
 * Used by admin dashboard to answer questions about the data
 */
export async function analyzeResponses(env, question, responses) {
  try {
    const anthropic = new Anthropic({
      apiKey: env.CLAUDE_API_KEY
    });

    // Build system prompt for data analysis
    const systemPrompt = `You are a data analyst helping interpret quiz response data. You have access to quiz responses and need to answer questions about trends, patterns, and insights.

Guidelines:
- Be concise and direct (2-3 sentences max)
- Include specific numbers and percentages when relevant
- Focus on actionable insights
- Use natural, conversational language`;

    // Summarize responses data for context
    const dataSummary = summarizeResponses(responses);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 300,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Here's the quiz data:\n\n${dataSummary}\n\nQuestion: ${question}`
        }
      ]
    });

    const answer = message.content[0]?.text || 'Unable to analyze data';

    return { answer, error: null };

  } catch (error) {
    console.error('Claude API error in analyzeResponses:', error);
    return {
      answer: null,
      error: error.message
    };
  }
}

/**
 * Summarize responses data for Claude
 */
function summarizeResponses(responses) {
  const total = responses.length;

  if (total === 0) {
    return 'No responses yet.';
  }

  // Calculate key metrics
  const sensitized = responses.filter(r => r.result === 'sensitized').length;
  const waitlistOptedIn = responses.filter(r => r.waitlist_opted_in).length;

  // Score averages
  const avgTrigger = (responses.reduce((sum, r) => sum + r.score_trigger, 0) / total).toFixed(1);
  const avgRecovery = (responses.reduce((sum, r) => sum + r.score_recovery, 0) / total).toFixed(1);
  const avgBaseline = (responses.reduce((sum, r) => sum + r.score_baseline, 0) / total).toFixed(1);

  // UTM sources
  const utmSources = responses.reduce((acc, r) => {
    const source = r.utm_source || 'Direct';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const lines = [
    `Total responses: ${total}`,
    `Result breakdown: ${sensitized} sensitized (${((sensitized / total) * 100).toFixed(1)}%), ${total - sensitized} not sensitized`,
    `Waitlist opt-ins: ${waitlistOptedIn} (${((waitlistOptedIn / total) * 100).toFixed(1)}%)`,
    ``,
    `Average scores:`,
    `- Trigger: ${avgTrigger}/12`,
    `- Recovery: ${avgRecovery}/12`,
    `- Baseline: ${avgBaseline}/12`,
    ``,
    `Traffic sources: ${Object.entries(utmSources).map(([s, c]) => `${s} (${c})`).join(', ')}`
  ];

  return lines.join('\n');
}
