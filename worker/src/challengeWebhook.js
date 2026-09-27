/**
 * Send 30-day challenge waitlist signup to n8n webhook
 */
export async function sendChallengeWebhook(env, data) {
  try {
    const {
      email,
      source,
      utmSource,
      utmCampaign,
      utmContent,
      utmTerm
    } = data;

    const webhookUrl = env.N8N_CHALLENGE_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('N8N_CHALLENGE_WEBHOOK_URL not configured');
      return { success: false, error: 'Webhook URL not configured' };
    }

    const payload = {
      email,
      source: source || '30-day-challenge-waitlist',
      utm_source: utmSource || null,
      utm_campaign: utmCampaign || null,
      utm_content: utmContent || null,
      utm_term: utmTerm || null,
      timestamp: new Date().toISOString()
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Challenge webhook failed:', response.status);
      return { success: false, error: `Webhook failed: ${response.status}` };
    }

    console.log('Challenge webhook: success');
    return { success: true, error: null };

  } catch (error) {
    console.error('Challenge webhook error:', error);
    return { success: false, error: error.message };
  }
}
