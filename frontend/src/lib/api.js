/**
 * API Client for Cloudflare Worker
 */

const WORKER_URL = import.meta.env.VITE_WORKER_URL;

if (!WORKER_URL) {
  console.warn('VITE_WORKER_URL not configured - AI features will not work');
}

/**
 * Generate personalized insight from Claude API (via Cloudflare Worker)
 */
export async function generateInsight(quizData) {
  try {
    const { result, scores, answers, hasPain, medicalClearance, freeText, email } = quizData;

    const bypassKey = new URLSearchParams(window.location.search).get('bypass');
    const headers = { 'Content-Type': 'application/json' };
    if (bypassKey) headers['x-bypass-key'] = bypassKey;

    const response = await fetch(`${WORKER_URL}/generate-insight`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        result,
        scores: {
          trigger: scores.score_trigger,
          recovery: scores.score_recovery,
          baseline: scores.score_baseline,
          total: scores.score_total
        },
        answers: {
          q1: answers.q1_answer,
          q2: answers.q2_answer,
          q3: answers.q3_answer,
          q4: answers.q4_answer,
          q5: answers.q5_answer,
          q6: answers.q6_answer,
          q7: answers.q7_answer,
          q8: answers.q8_answer,
          q9: answers.q9_answer
        },
        hasPain: hasPain,
        medicalClearance: medicalClearance,
        freeText: freeText
      })
    });

    const data = await response.json();

    // Handle rate limit errors (429)
    if (response.status === 429) {
      return {
        whatThisMeans: null,
        whatToDo: null,
        closingMessage: null,
        error: data.error || 'Rate limit exceeded',
        rateLimited: true,
        rateLimitType: data.type
      };
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return {
      whatThisMeans: data.whatThisMeans,
      whatToDo: data.whatToDo,
      closingMessage: data.closingMessage,
      error: null,
      rateLimited: false
    };

  } catch (error) {
    console.error('Error generating insight:', error);
    return {
      whatThisMeans: null,
      whatToDo: null,
      closingMessage: null,
      error: error.message,
      rateLimited: false
    };
  }
}

/**
 * Send webhook to n8n (via Cloudflare Worker)
 */
export async function sendWebhook(webhookData) {
  try {
    const { email, result, hasPain, medicalClearance, waitlistOptedIn, tag, utmSource, utmCampaign } = webhookData;

    const response = await fetch(`${WORKER_URL}/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        result,
        hasPain,
        medicalClearance,
        waitlistOptedIn,
        tag,
        utmSource,
        utmCampaign
      })
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status}`);
    }

    const data = await response.json();
    return { success: data.success, error: null };

  } catch (error) {
    console.error('Error sending webhook:', error);
    return { success: false, error: error.message };
  }
}
