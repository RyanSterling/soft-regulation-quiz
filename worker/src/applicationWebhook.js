/**
 * Send 1:1 coaching application data to n8n webhook
 * Triggers email notification to Maggie with full application details
 */
export async function sendApplicationWebhook(env, data) {
  try {
    const {
      name,
      email,
      location,
      timezone,
      answers,
      revenueRange,
      utmSource,
      utmCampaign,
      utmContent,
      utmTerm
    } = data;

    const webhookUrl = env.N8N_APPLICATION_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('N8N_APPLICATION_WEBHOOK_URL not configured');
      return { success: false, error: 'Webhook URL not configured' };
    }

    // Build payload with all application data
    // Flatten answers for easy access in n8n email template
    const payload = {
      // Contact info
      name,
      email,
      location: location || null,
      timezone: timezone || null,

      // Answers (flattened from JSONB)
      business_description: answers.business_description || null,
      business_links: answers.business_links || null,
      symptoms: answers.symptoms || null,
      already_tried: answers.already_tried || null,
      why_now: answers.why_now || null,
      clear_yes: answers.clear_yes || null,
      anything_else: answers.anything_else || null,

      // Revenue
      revenue_range: revenueRange,

      // UTM tracking
      utm_source: utmSource || null,
      utm_campaign: utmCampaign || null,
      utm_content: utmContent || null,
      utm_term: utmTerm || null,

      // Metadata
      form_type: '1on1_coaching_application',
      timestamp: new Date().toISOString()
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Application webhook failed:', response.status);
      return { success: false, error: `Webhook failed: ${response.status}` };
    }

    console.log('Application webhook: success');
    return { success: true, error: null };

  } catch (error) {
    console.error('Application webhook error:', error);
    return { success: false, error: error.message };
  }
}
