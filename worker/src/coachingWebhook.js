import { QUESTIONS } from '../../frontend/src/data/coachingQuestions.js';

/**
 * Send coaching pre-screening data to n8n webhook
 * Only called for PASS and REVIEW outcomes (not FAIL)
 *
 * PASS: Tags in ConvertKit as 'coaching-pass'
 * REVIEW: Tags in ConvertKit as 'coaching-review' and sends full submission for manual review
 */
export async function sendCoachingWebhook(env, data) {
  try {
    const { email, outcome, score, answers, freeText, utmSource, utmCampaign } = data;

    const webhookUrl = env.N8N_COACHING_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('N8N_COACHING_WEBHOOK_URL not configured');
      return { success: false, error: 'Webhook URL not configured' };
    }

    // Build base payload
    const payload = {
      email,
      outcome,
      quiz_type: 'coaching_screening',
      tag: outcome === 'PASS' ? 'coaching-pass' : 'coaching-review',
      utm_source: utmSource || null,
      utm_campaign: utmCampaign || null,
      timestamp: new Date().toISOString()
    };

    // For REVIEW, include full submission data for manual review
    if (outcome === 'REVIEW') {
      payload.score = score;
      payload.full_submission = formatSubmissionForReview(answers, freeText);
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Coaching webhook failed:', response.status);
      return { success: false, error: `Webhook failed: ${response.status}` };
    }

    console.log('Coaching webhook: success', outcome);
    return { success: true, error: null };

  } catch (error) {
    console.error('Coaching webhook error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Format submission data for the review email
 * Includes full question text with answers
 */
function formatSubmissionForReview(answers, freeText) {
  const formattedAnswers = [];

  // Format Q1-Q11 and Q13 answers (Q12 is free text)
  const questionData = [
    { id: 'q1', num: 1, text: 'In a typical day, how many hours do you spend researching your symptoms, reading recovery stories, watching recovery content, or consuming nervous system / health content?', options: ['0–30 minutes', '30 minutes to 1 hour', '1–3 hours', '3+ hours'] },
    { id: 'q2', num: 2, text: 'In the last 7 days, how often did you check your body for symptoms — checking your pulse, scanning for sensations, testing whether something was still there, looking in the mirror, etc.?', options: ['Not at all', 'A few times total', 'Daily', 'Many times a day'] },
    { id: 'q3', num: 3, text: "A new physical sensation shows up that you've never felt before. What's the most honest description of what you usually do in the next hour?", options: ['Notice it and keep doing what I was doing', 'Look it up online or in an app', 'Text or call someone about it', 'Get pulled into a spiral that takes over the rest of my day'] },
    { id: 'q4', num: 4, text: "You've just started a new approach to your recovery. How long before you start evaluating whether it's \"working\"?", options: ['I give things weeks or months before I evaluate', 'I check in after a few days', "I'm usually evaluating within 24 hours", "I'm basically evaluating constantly"] },
    { id: 'q5', num: 5, text: 'In the last 30 days, how often did you do something enjoyable without first checking whether your body could handle it?', options: ['Regularly', 'Sometimes', 'Rarely', "I can't remember the last time"] },
    { id: 'q6', num: 6, text: 'Over the last month, roughly how many days did your symptoms dictate your schedule?', options: ['0–5 days', '5–15 days', '15–25 days', 'Most days'] },
    { id: 'q7', num: 7, text: 'If someone asked you to describe yourself without mentioning your health, symptoms, or nervous system, how would that feel?', options: ['Easy', 'Takes a minute but doable', 'Hard', "I don't really know who I am outside of this right now"] },
    { id: 'q8', num: 8, text: 'Which statement is most honest for you right now?', options: ["I know what I need to do, I just don't always do it", "I understand all of this intellectually but I can't seem to apply it", "I've tried everything and nothing works for me", "I'm not sure I believe nervous system work applies to my situation"] },
    { id: 'q9', num: 9, text: "When someone tells you that you have to stop checking and reassurance-seeking, what's your gut reaction?", options: ["I agree and I've been working on it", "I agree but I don't know how to actually stop", 'I agree, but my situation is different', 'That sounds impossible right now'] },
    { id: 'q10', num: 10, text: "When you read or hear about people who recovered, what's closest to your internal response?", options: ["I feel hopeful and use it as evidence it's possible", 'I study their timeline to see how long it took', 'I look for differences between their case and mine', 'I feel worse because my case feels different or more severe'] },
    { id: 'q11', num: 11, text: 'When you see content telling people with chronic symptoms to "get out and live your life," what\'s your honest first reaction?', options: ["I'm already living my life — this isn't the part I'm working on", "That resonates — that's the direction I want to move in", "I agree in principle but I'm not there yet", "That advice doesn't account for conditions like mine", 'That advice can be harmful for people with real physical limitations like mine'] },
    { id: 'q13', num: 13, text: 'Are you 100% certain that the symptoms or condition you\'re dealing with are nervous system related?', options: ["Yes, I'm 100% certain", "I'm mostly sure but still have some doubt", "I think so but I'm not certain", "No, I'm still trying to figure out what's wrong"] }
  ];

  for (const q of questionData) {
    const answerValue = answers[q.id];
    let answerText = 'N/A';

    if (answerValue !== undefined) {
      if (typeof answerValue === 'number' && q.options[answerValue]) {
        answerText = q.options[answerValue];
      } else if (typeof answerValue === 'string') {
        // Q13 uses string values
        const q13Map = {
          'yes_certain': "Yes, I'm 100% certain",
          'mostly_sure': "I'm mostly sure but still have some doubt",
          'unsure': "I think so but I'm not certain",
          'no': "No, I'm still trying to figure out what's wrong"
        };
        answerText = q13Map[answerValue] || answerValue;
      }
    }

    formattedAnswers.push({
      question_number: q.num,
      question_text: q.text,
      answer: answerText
    });
  }

  // Add Q12 free text
  formattedAnswers.push({
    question_number: 12,
    question_text: 'What would you want to get out of this coaching program?',
    answer: freeText || 'N/A'
  });

  // Sort by question number
  formattedAnswers.sort((a, b) => a.question_number - b.question_number);

  return formattedAnswers;
}
