# Setup Instructions

## Prerequisites

- Node.js 18+ installed
- Supabase account and project created
- Cloudflare account (for Workers)
- n8n webhook URL (for ConvertKit integration)
- Anthropic API key (for Claude)

## Step 1: Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the entire `supabase-setup.sql` file
4. Verify that all 4 tables were created:
   - responses
   - settings
   - quiz_starts
   - ip_rate_limits

## Step 2: Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Create a `.env` file from the template:
```bash
cp .env.example .env
```

3. Fill in your environment variables in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_WORKER_URL=https://your-worker.workers.dev
VITE_ADMIN_PASSWORD=your-secure-admin-password
```

Get your Supabase keys from: Project Settings → API

4. Install dependencies:
```bash
npm install
```

5. Start the development server:
```bash
npm run dev
```

The app should now be running at http://localhost:5173

## Step 3: Cloudflare Worker Setup

1. Navigate to the worker directory:
```bash
cd worker
```

2. Install dependencies:
```bash
npm install
```

3. Login to Cloudflare:
```bash
npx wrangler login
```

4. Set up secrets (these are NOT in wrangler.toml for security):
```bash
npx wrangler secret put CLAUDE_API_KEY
# Paste your Claude API key when prompted

npx wrangler secret put N8N_WEBHOOK_URL
# Paste your n8n webhook URL when prompted

npx wrangler secret put SUPABASE_URL
# Paste your Supabase project URL

npx wrangler secret put SUPABASE_SERVICE_KEY
# Paste your Supabase service role key (NOT anon key!)
```

Get your Supabase service role key from: Project Settings → API → service_role key

5. Deploy the worker:
```bash
npm run deploy
```

6. Copy the deployed worker URL and update your frontend `.env` file:
```env
VITE_WORKER_URL=https://nervous-system-quiz-api.your-subdomain.workers.dev
```

## Step 4: n8n Webhook Setup

1. Create a new workflow in n8n
2. Add a Webhook trigger node
3. Set it to POST method
4. Copy the webhook URL
5. Add it as a secret to your Cloudflare Worker (done in Step 3)

Expected webhook payload:
```json
{
  "email": "user@example.com",
  "result": "sensitized",
  "has_chronic_pain": true,
  "medical_clearance": "yes_confident",
  "waitlist_opted_in": true,
  "tag": "waitlist-ready",
  "utm_source": "instagram",
  "utm_campaign": null,
  "timestamp": "2025-01-01T12:00:00Z"
}
```

6. Connect to ConvertKit and tag users based on the `tag` field

## Step 5: Test the Application

1. Make sure both frontend and worker are running
2. Visit http://localhost:5173
3. Complete the quiz end-to-end
4. Verify:
   - Data is saved in Supabase `responses` table
   - AI insight is generated (check Results screen)
   - Webhook is sent to n8n
   - Email is tagged in ConvertKit

## Step 6: Deploy Frontend

### Option A: Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy from frontend directory:
```bash
cd frontend
vercel
```

3. Set environment variables in Vercel dashboard:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_WORKER_URL
   - VITE_ADMIN_PASSWORD

### Option B: Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Deploy from frontend directory:
```bash
cd frontend
netlify deploy --prod
```

3. Set environment variables in Netlify dashboard

## Troubleshooting

### Quiz won't submit
- Check browser console for errors
- Verify Supabase URL and anon key are correct
- Check that Cloudflare Worker is deployed and accessible

### AI insight not showing
- Check that CLAUDE_API_KEY is set correctly in Worker secrets
- Check Worker logs: `cd worker && npx wrangler tail`
- AI insight failure is non-blocking - quiz will still work with static content only

### Webhook not firing
- Verify N8N_WEBHOOK_URL is set in Worker secrets
- Test webhook URL manually with curl:
```bash
curl -X POST your-webhook-url \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Rate limiting issues during testing
- Clear old rate limit records from Supabase:
```sql
DELETE FROM ip_rate_limits WHERE created_at < NOW() - INTERVAL '1 hour';
```

## Next Steps

1. Update CTA configuration in Supabase when ready to launch:
```sql
UPDATE settings
SET value = jsonb_set(value, '{mode}', '"live"')
WHERE key = 'cta_config';

UPDATE settings
SET value = jsonb_set(value, '{live,buttonUrl}', '"https://your-program-url.com"')
WHERE key = 'cta_config';
```

2. Build admin dashboard (coming in Phase 2)

3. Set up custom domain in Vercel/Netlify

4. Configure UTM links in your link-in-bio pages
