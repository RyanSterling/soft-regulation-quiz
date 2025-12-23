# Nervous System Sensitization Quiz

A self-hosted quiz application that helps people determine if their nervous system is sensitized, with AI-powered personalized insights and smart CTA routing.

## Features

- ✅ 11-question assessment with conditional logic (Q11 only shows if chronic pain = yes)
- ✅ AI-generated personalized insights using Claude API
- ✅ Three CTA variations based on medical clearance status
- ✅ Configurable waitlist/live program mode
- ✅ UTM parameter tracking (source + campaign)
- ✅ Rate limiting (email + IP based)
- ✅ Quiz abandonment tracking
- ✅ n8n webhook integration for ConvertKit tagging
- ⏳ Admin dashboard (Phase 2)

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **API Layer**: Cloudflare Workers + Hono
- **AI**: Claude 3.5 Sonnet (via Anthropic API)
- **Hosting**: Vercel/Netlify (frontend) + Cloudflare Workers (API)
- **Integrations**: n8n → ConvertKit

## Project Structure

```
/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── data/           # Questions and CTA content
│   │   ├── lib/            # Utilities (API, Supabase, scoring, UTM)
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
├── worker/                 # Cloudflare Worker
│   ├── src/
│   │   ├── index.js        # Main Hono app
│   │   ├── claude.js       # Claude API integration
│   │   ├── webhook.js      # n8n webhook
│   │   └── rateLimit.js    # Rate limiting logic
│   ├── wrangler.toml
│   └── package.json
├── supabase-setup.sql      # Database schema
├── CLAUDE.md               # Project documentation
├── SETUP.md                # Setup instructions
└── README.md               # This file
```

## Quick Start

See [SETUP.md](SETUP.md) for detailed setup instructions.

### 1. Database
```bash
# Run supabase-setup.sql in your Supabase SQL Editor
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env
# Fill in your environment variables
npm install
npm run dev
```

### 3. Worker
```bash
cd worker
npm install
npx wrangler login
# Set secrets (see SETUP.md)
npm run deploy
```

## How It Works

### Quiz Flow

1. **Welcome Screen** → User starts quiz
2. **Questions 1-9** → Core nervous system assessment (1-4 scale)
3. **Question 10** → Chronic pain screening (yes/no)
4. **Question 11** → Medical clearance (conditional - only if Q10 = yes)
5. **Free Text** → Optional context
6. **Email Capture** → Required for results
7. **Results Screen** → Shows result + AI insight + appropriate CTA

### Scoring Logic

```javascript
trigger_score = Q1 + Q2 + Q3 (range: 3-12)
recovery_score = Q4 + Q5 + Q6 (range: 3-12)
baseline_score = Q7 + Q8 + Q9 (range: 3-12)
total_score = trigger + recovery + baseline (range: 9-36)

result = baseline >= 9 OR total >= 27 ? "sensitized" : "not_sensitized"
```

### CTA Logic

| Pain? | Medical Clearance | CTA Type | Button Action |
|-------|------------------|----------|---------------|
| No | N/A | Default | Waitlist or Live Program |
| Yes | Yes, confident | Default | Waitlist or Live Program |
| Yes | Seen but unsure | Trust | Always Waitlist |
| Yes | Not evaluated | Evaluation | Always Waitlist |

### UTM Tracking

Only tracks 2 parameters (keeping it simple):
- `utm_source`: instagram, tiktok, youtube, email, etc.
- `utm_campaign`: specific video/campaign identifier

Example URLs:
- Instagram: `yoursite.com/?utm_source=instagram`
- YouTube video: `yoursite.com/?utm_source=youtube&utm_campaign=triggers_video`
- Email: `yoursite.com/?utm_source=email&utm_campaign=weekly_newsletter`

## Security

- ✅ Claude API key never exposed to frontend
- ✅ All AI calls go through Cloudflare Worker
- ✅ Row Level Security (RLS) enabled on all Supabase tables
- ✅ Rate limiting: 3 submissions per email per 24h + 1 per IP per hour
- ✅ Email validation
- ✅ Input sanitization

## Environment Variables

### Frontend
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_WORKER_URL=
VITE_ADMIN_PASSWORD=
```

### Worker (Cloudflare Secrets)
```
CLAUDE_API_KEY=
N8N_WEBHOOK_URL=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

## Development

### Frontend
```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Worker
```bash
cd worker
npm run dev          # Start local worker
npm run deploy       # Deploy to Cloudflare
npx wrangler tail    # View logs
```

## Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Worker (Cloudflare)
```bash
cd worker
npm run deploy
```

## Switching Modes

### Waitlist Mode (Default)
All CTAs direct to waitlist signup flow.

### Live Mode
Default CTA directs to live program URL. Trust/Evaluation CTAs still go to waitlist.

Update in Supabase:
```sql
UPDATE settings
SET value = jsonb_set(value, '{mode}', '"live"')
WHERE key = 'cta_config';

UPDATE settings
SET value = jsonb_set(value, '{live,buttonUrl}', '"https://your-program-url.com"')
WHERE key = 'cta_config';
```

## Support

For questions or issues:
1. Check [SETUP.md](SETUP.md) troubleshooting section
2. Review [CLAUDE.md](CLAUDE.md) for architecture details
3. Check browser console and Worker logs for errors

## License

Private project - All rights reserved

## Credits

Built with:
- React + Vite
- Tailwind CSS
- Supabase
- Cloudflare Workers
- Anthropic Claude API
- Hono framework
