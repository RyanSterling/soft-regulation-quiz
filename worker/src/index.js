import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { generateInsight } from './claude.js';
import { sendWebhook } from './webhook.js';
import { checkRateLimit } from './rateLimit.js';

const app = new Hono();

// Enable CORS for all routes
app.use('/*', cors({
  origin: '*', // In production, restrict this to your domain
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}));

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'Nervous System Quiz API',
    version: '1.0.0'
  });
});

// Generate personalized insight from Claude API
app.post('/generate-insight', async (c) => {
  try {
    const body = await c.req.json();
    const { email, result, scores, answers, hasPain, medicalClearance, freeText } = body;

    // Validate required fields
    if (!email || !result || !scores || !answers) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Check rate limits (both email and IP)
    const clientIP = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(c.env, email, clientIP);

    if (!rateLimitResult.allowed) {
      return c.json({
        error: rateLimitResult.reason,
        type: rateLimitResult.type
      }, 429);
    }

    // Generate AI insight using Claude
    const aiResult = await generateInsight(c.env, {
      result,
      scores,
      answers,
      hasPain,
      medicalClearance,
      freeText
    });

    if (aiResult.error) {
      console.error('Claude API error:', aiResult.error);
      // Return null on error - frontend will show static content only
      return c.json({
        whatThisMeans: null,
        whatToDo: null,
        closingMessage: null,
        error: 'AI service unavailable'
      }, 200);
    }

    return c.json({
      whatThisMeans: aiResult.whatThisMeans,
      whatToDo: aiResult.whatToDo,
      closingMessage: aiResult.closingMessage
    });

  } catch (error) {
    console.error('Error in generate-insight:', error);
    return c.json({ error: 'Internal server error', insight: null }, 200);
  }
});

// Send webhook to n8n (for ConvertKit tagging)
app.post('/webhook', async (c) => {
  try {
    const body = await c.req.json();
    const { email, result, hasPain, medicalClearance, waitlistOptedIn, tag, utmSource, utmCampaign } = body;

    // Validate required fields
    if (!email || !result) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Send to n8n webhook
    const webhookResult = await sendWebhook(c.env, {
      email,
      result,
      hasPain,
      medicalClearance,
      waitlistOptedIn,
      tag,
      utmSource,
      utmCampaign
    });

    if (webhookResult.error) {
      console.error('Webhook error:', webhookResult.error);
      return c.json({ error: 'Webhook failed', success: false }, 200);
    }

    return c.json({ success: true });

  } catch (error) {
    console.error('Error in webhook:', error);
    return c.json({ error: 'Internal server error', success: false }, 200);
  }
});

export default app;
