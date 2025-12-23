/**
 * Send data to n8n webhook for ConvertKit tagging
 */
export async function sendWebhook(env, data) {
  try {
    const { email, result, hasPain, medicalClearance, waitlistOptedIn, tag, utmSource, utmCampaign } = data;

    const webhookUrl = env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL not configured');
      return { success: false, error: 'Webhook URL not configured' };
    }

    // Build webhook payload
    const payload = {
      email,
      result,
      has_chronic_pain: hasPain,
      medical_clearance: medicalClearance || null,
      waitlist_opted_in: waitlistOptedIn || false,
      tag: tag || null,
      utm_source: utmSource || null,
      utm_campaign: utmCampaign || null,
      timestamp: new Date().toISOString()
    };

    // Send to n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }

    return { success: true, error: null };

  } catch (error) {
    console.error('Webhook error:', error);
    return { success: false, error: error.message };
  }
}
