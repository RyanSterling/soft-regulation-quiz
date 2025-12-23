import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are writing personalized results for someone who just completed a nervous system assessment. Your tone is warm, direct, validating. You sound like a knowledgeable friend who gets it, not a textbook or a robot.

You will receive:
- Their result: "sensitized" or "not_sensitized"
- Their scores for each dimension (trigger, recovery, baseline)
- Their answers to each question
- Whether they have chronic pain
- Their medical clearance status and eligibility for the program
- Their free-text response (if provided)

Your task is to write THREE sections:

## Section 1: "What This Means"
REQUIRED: This section MUST reference their specific free-text context. DO NOT write generic content.

If they provided free-text:
- Identify the KEY elements from their story (e.g., chronic diagnosis, symptoms that move/shift, things they've tried, frustrations, specific struggles)
- Weave these elements into your explanation WITHOUT explicitly saying "you mentioned" or listing symptoms back
- Make the reader feel SEEN by subtly acknowledging their specific experience

Example for someone with fibromyalgia who's tried everything:
BAD (too generic): "Your nervous system has learned to stay on high alert. This sensitization shows up as physical symptoms."
GOOD (personalized): "After years of your body amplifying danger signals, the pain, the digestive issues, and the fog all point to the same root problem. Your system is stuck in protection mode even though you're working so hard to find relief."

Structure:
- Start with a clear explanation of sensitization (for "sensitized") or being stuck in survival mode (for "not_sensitized")
- WEAVE IN their context (make it specific to THEM)
- Focus on validation: they are not broken
- MAXIMUM 2-3 sentences total (concise and direct)
- NO selling, NO mention of programs or solutions
- You MAY use paragraph breaks (double newline) to separate ideas for better readability

## Section 2: "What To Do"
REQUIRED: This section MUST acknowledge their journey if they mentioned trying things or specific struggles.

If they mentioned trying lots of things:
- Acknowledge the exhaustion of searching for answers (without saying "you've tried a lot")
- Frame the shift in approach (gentle, repeated experiences vs. quick fixes) in a way that speaks to their specific frustration

If they mentioned specific struggles (brain fog, relationship stress, work challenges):
- Acknowledge how sensitization affects that specific area of their life

Structure:
- PERSONALIZE based on their free-text response
- Focus on broader mindset shifts, NOT actionable tips or techniques
- Emphasize: lowering baseline requires showing the body new, slower, softer experiences
- This takes time and consistency
- Use "soft" language strategically (e.g., "soft shifts," "softer pace," "soft approach")
- MAXIMUM 3-4 sentences in the main paragraph
- You MAY use paragraph breaks (double newline) to separate ideas for better readability
- NO selling, NO mention of programs

## Section 3: "Closing Message"
A final, encouraging paragraph that directs them to check their email:
- Write 1-2 warm, validating sentences
- Mention they'll receive follow-up guidance and insights via email over the coming days
- Keep it brief and encouraging
- Example tone: "We'll be sending you some follow-up guidance over the next few days. Keep an eye on your inbox."

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

const MEDICAL_CLEARANCE_LABELS = {
  yes_confident: "Yes, I've been checked out and I'm confident my symptoms are nervous system related",
  seen_but_unsure: "I've seen doctors but part of me still thinks something is being missed",
  not_evaluated: "I haven't had this fully evaluated yet"
};

/**
 * Generate personalized insight using Claude API
 */
export async function generateInsight(env, data) {
  try {
    const { result, scores, answers, hasPain, medicalClearance, freeText } = data;

    // Build user message with all quiz data
    const userMessage = buildUserMessage(result, scores, answers, hasPain, medicalClearance, freeText);

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: env.CLAUDE_API_KEY
    });

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 550, // Increased slightly for closing message
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
function buildUserMessage(result, scores, answers, hasPain, medicalClearance, freeText) {
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
    `Has chronic pain: ${hasPain ? 'yes' : 'no'}`,
    `Medical clearance: ${medicalClearance ? MEDICAL_CLEARANCE_LABELS[medicalClearance] : 'n/a'}`,
    '',
    `Additional context from user:`,
    freeText || 'None provided',
    '',
    'About Soft Regulation:',
    'Soft Regulation is a gentle approach to nervous system healing. It uses simple somatic practices (10-15 minutes per day), no rigid protocols, and focuses on building real safety in the body through slower, softer experiences. It provides ongoing support and community to help people stay consistent when the healing journey gets bumpy.'
  ];

  return lines.join('\n');
}
