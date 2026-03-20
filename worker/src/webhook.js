/**
 * Send data to n8n webhook for ConvertKit tagging
 * Supports dual webhooks for testing (primary + secondary)
 */
export async function sendWebhook(env, data) {
  try {
    const { email, result, hasPain, medicalClearance, waitlistOptedIn, tag, utmSource, utmCampaign, utmContent, utmTerm } = data;

    const primaryUrl = env.N8N_WEBHOOK_URL;
    const secondaryUrl = env.N8N_WEBHOOK_URL_SECONDARY; // Optional: for testing self-hosted

    if (!primaryUrl && !secondaryUrl) {
      console.error('No webhook URLs configured');
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
      utm_content: utmContent || null,
      utm_term: utmTerm || null,
      timestamp: new Date().toISOString()
    };

    const jsonBody = JSON.stringify(payload);

    // Send to both webhooks in parallel (if both configured)
    const webhookPromises = [];

    if (primaryUrl) {
      webhookPromises.push(
        fetch(primaryUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonBody
        }).then(res => ({ url: 'primary', ok: res.ok, status: res.status }))
          .catch(err => ({ url: 'primary', ok: false, error: err.message }))
      );
    }

    if (secondaryUrl) {
      webhookPromises.push(
        fetch(secondaryUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonBody
        }).then(res => ({ url: 'secondary', ok: res.ok, status: res.status }))
          .catch(err => ({ url: 'secondary', ok: false, error: err.message }))
      );
    }

    const results = await Promise.all(webhookPromises);

    // Log results for each webhook
    results.forEach(r => {
      if (r.ok) {
        console.log(`Webhook ${r.url}: success`);
      } else {
        console.error(`Webhook ${r.url}: failed`, r.error || `status ${r.status}`);
      }
    });

    // Consider success if at least one webhook succeeded
    const anySuccess = results.some(r => r.ok);

    if (!anySuccess) {
      return { success: false, error: 'All webhooks failed' };
    }

    return { success: true, error: null, results };

  } catch (error) {
    console.error('Webhook error:', error);
    return { success: false, error: error.message };
  }
}
