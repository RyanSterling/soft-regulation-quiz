# Nervous System Sensitization Quiz - Project Documentation

## Project Overview

A self-hosted quiz application that helps people determine if their nervous system is sensitized. The quiz captures email, generates personalized AI insights using Claude, and directs users to appropriate CTAs based on their responses.

**Live URL**: TBD
**Admin Dashboard**: /admin (password protected)

---

## Architecture

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Hosting**: Vercel or Netlify
- **State Management**: React hooks (useState, useEffect)

### Backend/API Layer
- **API**: Cloudflare Workers + Hono framework
  - Handles Claude API calls (keeps API key secure)
  - Processes n8n webhook calls
  - Implements rate limiting
- **Database**: Supabase (PostgreSQL)
  - Stores quiz responses
  - Stores app settings (CTA config)
  - Tracks quiz starts (abandonment)

### External Integrations
- **Claude API**: Generates personalized insights based on quiz responses
- **n8n Webhooks**: Tags users in ConvertKit based on results and actions
- **Supabase**: Data persistence and analytics

---

## Key Features

### 1. Quiz Flow
- Welcome screen
- 11 questions (Q1-Q9 core, Q10 chronic pain screening, Q11 conditional)
- Q11 only appears if Q10 = "Yes"
- Free-text field (optional context)
- Email capture (required)
- Results screen with personalized AI insight

### 2. Scoring System
- **Trigger Score**: Q1 + Q2 + Q3 (range: 3-12)
- **Recovery Score**: Q4 + Q5 + Q6 (range: 3-12)
- **Baseline Score**: Q7 + Q8 + Q9 (range: 3-12)
- **Total Score**: Sum of all three (range: 9-36)

**Result Logic**:
- If `baseline_score >= 9` OR `total_score >= 27`: "sensitized"
- Else: "not_sensitized"

### 3. Medical Clearance Paths & Eligibility

Based on Q10 (chronic pain) and Q11 (medical clearance) answers:

**Path 1: No Chronic Pain** → **ELIGIBLE**
- Show full results with personalized "What This Means" and "What To Do"
- "What To Do" includes natural CTA to join Soft Regulation waitlist
- Webhook fired to add to ConvertKit
- Tag: `waitlist-ready` (or `program-joined` in live mode)

**Path 2: Chronic Pain + "yes_confident" clearance** → **ELIGIBLE**
- Same as Path 1
- User is confident symptoms are nervous system related
- Webhook fired to add to ConvertKit

**Path 3: Chronic Pain + "seen_but_unsure" clearance** → **NOT ELIGIBLE**
- Show full results with personalized "What This Means" and "What To Do"
- "What To Do" explains: nervous system work requires full confidence in medical clearance
- NO CTA, NO waitlist link
- NO webhook (not added to ConvertKit)
- Still saved to Supabase for analytics

**Path 4: Chronic Pain + "not_evaluated" clearance** → **NOT ELIGIBLE**
- Same as Path 3
- User has not ruled out medical causes yet
- Encouraged to get medical evaluation first
- NO CTA, NO webhook
- Still saved to Supabase for analytics

### 4. Configurable Modes

Stored in Supabase `settings` table:
- **Waitlist Mode**: All CTAs direct to waitlist signup
- **Live Mode**: Default CTA directs to program URL; soft CTAs still go to waitlist

### 5. Admin Dashboard

Four tabs:
1. **Responses**: Sortable table with filters, search, CSV export
2. **Analytics**: Charts and stats (submissions, conversions, score distributions)
3. **AI Analyzer**: Chat interface to query response data using Claude
4. **Settings**: Toggle waitlist/live mode, configure program URL

#### Analytics Requirements - Medical Clearance Tracking

The admin dashboard must show detailed medical clearance breakdown:

**Overall Metrics:**
- Total quiz completions (all 4 paths)
- Total eligible users (paths 1 & 2)
- Total not eligible users (paths 3 & 4)
- Conversion rate (eligible users who joined waitlist)

**Chronic Pain Breakdown:**
- Total users with chronic pain (Q10 = yes)
- Total users without chronic pain (Q10 = no)

**Of Users WITH Chronic Pain:**
- Count with "yes_confident" clearance (eligible - path 2)
- Count with "seen_but_unsure" clearance (not eligible - path 3)
- Count with "not_evaluated" clearance (not eligible - path 4)
- Percentage distribution of each clearance status

**Conversion by Path:**
- Path 1 conversion rate (no pain → joined waitlist)
- Path 2 conversion rate (pain + confident → joined waitlist)
- Path 3 & 4: Show count but no conversion metric (not eligible)

**Important Notes:**
- All 4 paths save to Supabase `responses` table
- Only paths 1 & 2 trigger webhooks to ConvertKit
- Paths 3 & 4 are tracked for analytics but not marketed to
- Filter/segment capability to exclude paths 3 & 4 from conversion metrics

---

## UTM Tracking Strategy

### What We Track

Only two UTM parameters:
- `utm_source`: Where the traffic came from (required for tracking)
- `utm_campaign`: Specific campaign/video identifier (optional, mainly for YouTube)

We intentionally skip `utm_medium`, `utm_content`, and `utm_term` to keep things simple.

### Link Structure by Platform

#### Instagram
Users visit: `vibewithmaggie.com/link-in-bio/instagram`
Quiz button links to: `quiz-url.com/?utm_source=instagram`

#### TikTok
Users visit: `vibewithmaggie.com/link-in-bio/tiktok`
Quiz button links to: `quiz-url.com/?utm_source=tiktok`

#### YouTube
Each video description gets a unique link with campaign identifier:
- Triggers video: `quiz-url.com/?utm_source=youtube&utm_campaign=triggers_video`
- Recovery video: `quiz-url.com/?utm_source=youtube&utm_campaign=recovery_video`
- Baseline video: `quiz-url.com/?utm_source=youtube&utm_campaign=baseline_video`

#### Email Newsletter
`quiz-url.com/?utm_source=email&utm_campaign=weekly_newsletter`

#### Direct/Organic
No UTM parameters - stored as null in database

### Implementation Details

- UTM parameters captured from URL on quiz start
- Stored in `quiz_starts` table when quiz begins
- Copied to `responses` table on quiz completion
- Visible in admin analytics to track conversion by source

### Admin Dashboard Insights

With this tracking, you'll see:
- "45 completions from Instagram"
- "30 completions from TikTok"
- "60 completions from YouTube"
  - "20 from triggers_video"
  - "15 from recovery_video"
  - "25 from baseline_video"
- "40 completions from email"

---

## Security & Rate Limiting

### API Key Security
- Claude API key is NEVER exposed to the frontend
- All Claude API calls go through Cloudflare Worker
- Worker URL is public, but requires valid request format
- API key stored as Cloudflare Worker secret

### Rate Limiting (Dual Protection)

**Option C** - Both limits enforced:

1. **Email-based**: Max 3 submissions per email per 24 hours
   - Prevents spam with the same email
   - Checked in Cloudflare Worker before processing

2. **IP-based**: Max 1 submission per IP address per hour
   - Catches VPN abuse and bot traffic
   - Checked in Cloudflare Worker before processing

If either limit is exceeded, return error with helpful message.

### Data Privacy
- Only storing necessary data
- Email required for results delivery
- Free-text responses optional
- No PII beyond email

---

## Database Schema

### Table: `responses`
Stores completed quiz submissions.

```sql
create table responses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  email text not null,
  result text not null, -- 'sensitized' or 'not_sensitized'
  score_total integer not null,
  score_trigger integer not null,
  score_recovery integer not null,
  score_baseline integer not null,
  q1_answer integer not null,
  q2_answer integer not null,
  q3_answer integer not null,
  q4_answer integer not null,
  q5_answer integer not null,
  q6_answer integer not null,
  q7_answer integer not null,
  q8_answer integer not null,
  q9_answer integer not null,
  has_chronic_pain boolean not null,
  medical_clearance text, -- 'yes_confident', 'seen_but_unsure', 'not_evaluated', or null
  free_text_response text,
  ai_insight text, -- Generated by Claude API
  waitlist_opted_in boolean default false,
  cta_type text, -- 'default', 'trust', 'evaluation'
  utm_source text,
  utm_campaign text
);
```

### Table: `settings`
Stores app configuration.

```sql
create table settings (
  key text primary key,
  value jsonb not null
);

-- Default CTA configuration
insert into settings (key, value) values (
  'cta_config',
  '{
    "mode": "waitlist",
    "waitlist": {
      "buttonText": "Join the Waitlist",
      "softButtonText": "Join the Waitlist for When You Are Ready"
    },
    "live": {
      "buttonText": "Join Soft Regulation",
      "buttonUrl": "",
      "softButtonText": "Join the Waitlist for When You Are Ready"
    }
  }'
);
```

### Table: `quiz_starts`
Tracks quiz abandonment.

```sql
create table quiz_starts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  session_id text not null,
  utm_source text,
  utm_campaign text,
  completed boolean default false,
  completed_at timestamp with time zone
);
```

---

## Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_WORKER_URL=your-cloudflare-worker-url
VITE_ADMIN_PASSWORD=your-admin-password
```

### Cloudflare Worker (Secrets)
```
CLAUDE_API_KEY=your-claude-api-key
N8N_WEBHOOK_URL=your-n8n-webhook-url
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
```

---

## API Endpoints (Cloudflare Worker)

### POST /generate-insight
Generates personalized AI content (two sections) from Claude API.

**Request Body**:
```json
{
  "email": "user@example.com",
  "result": "sensitized",
  "scores": {
    "trigger": 10,
    "recovery": 9,
    "baseline": 11,
    "total": 30
  },
  "answers": {
    "q1": 3, "q2": 4, "q3": 3,
    "q4": 3, "q5": 3, "q6": 3,
    "q7": 4, "q8": 3, "q9": 4
  },
  "hasPain": true,
  "medicalClearance": "yes_confident",
  "freeText": "Optional context..."
}
```

**Response**:
```json
{
  "whatThisMeans": "Your alarm system has become too touchy...",
  "whatToDo": "Lowering your baseline requires showing your body new, slower experiences. This is what we work on in Soft Regulation...",
  "includesCta": true
}
```

**Error Response**:
```json
{
  "whatThisMeans": null,
  "whatToDo": null,
  "includesCta": false,
  "error": "AI service unavailable"
}
```

### POST /webhook
Sends data to n8n webhook for ConvertKit tagging.

**Request Body**:
```json
{
  "email": "user@example.com",
  "result": "sensitized",
  "hasPain": true,
  "medicalClearance": "yes_confident",
  "waitlistOptedIn": true,
  "tag": "waitlist-ready",
  "utmSource": "instagram",
  "utmCampaign": null
}
```

**Note**: Webhook only fires for eligible users (paths 1 & 2). Not eligible users (paths 3 & 4) do NOT trigger webhooks.

---

## Results Screen Design

### UI Specifications

**Background Color**: `#EFEDEC`

**Typography**:
- **Headlines**: Libre Baskerville Bold, `#101827`, tight letter spacing (`-0.02em`)
- **Body Text**: Inter Regular, `#6D6B6B`, tight letter spacing (`-0.01em`), `1.0625rem` (17px)
- **Accent Color** (links/CTA): `#4D1E22`

### Structure

**1. Result Badge**
- White card with rounded corners
- Small header: "Your nervous system state"
- Badge showing "Sensitized" or "Not Sensitized" with colored background
  - Sensitized: Light red background (`#FEE2E2`), dark red text (`#991B1B`)
  - Not Sensitized: Light blue background (`#E0E7FF`), dark blue text (`#3730A3`)

**2. "What This Means" Section**
- White card with rounded corners
- Book icon (📖) next to headline
- Headline: "What this means"
- Content: AI-generated text with subtle personalization
- Fallback: Static text if AI fails

**3. "What To Do" Section**
- White card with rounded corners
- Lightbulb icon (💡) next to headline
- Headline: "What to do"
- Content: AI-generated text with broader mindset guidance
- **For eligible users**: Includes "Soft Regulation" as clickable link
- **For not eligible users**: Explains need for medical clarity, no CTA
- Fallback: Static text if AI fails

**4. Inline CTA (Eligible Users Only)**
- "Soft Regulation" text in "What To Do" section is clickable
- Styled as link with accent color (`#4D1E22`)
- On click: Shows modal confirmation

**5. Waitlist Modal**
- Overlay with centered white card
- Success checkmark icon
- "You're on the waitlist!" headline
- "Check your email for next steps" message
- "Got it" button to close
- Behind the scenes: Updates Supabase + sends webhook

### Behavior

**Eligible Users (Paths 1 & 2)**:
1. See both sections with AI content
2. "Soft Regulation" link appears naturally in "What To Do"
3. Click link → Modal appears → Waitlist status updated → Webhook sent
4. Confirmation message: "We'll send you some tips that can help in the meantime."

**Not Eligible Users (Paths 3 & 4)**:
1. See both sections with AI content
2. NO "Soft Regulation" link in "What To Do"
3. Content explains need for medical clarity
4. NO modal, NO webhook, NO confirmation message

---

## File Structure

```
/
├── src/
│   ├── components/
│   │   ├── Quiz.jsx              # Main quiz container
│   │   ├── Welcome.jsx           # Welcome screen
│   │   ├── Question.jsx          # Question display component
│   │   ├── ProgressBar.jsx       # Progress indicator
│   │   ├── FreeTextInput.jsx     # Optional context field
│   │   ├── EmailCapture.jsx      # Email input with validation
│   │   ├── Results.jsx           # Results screen with AI content
│   │   └── WaitlistModal.jsx     # Confirmation modal for waitlist signup
│   ├── admin/
│   │   ├── AdminLayout.jsx       # Admin wrapper with auth
│   │   ├── ResponsesTable.jsx    # Tab 1: Responses table
│   │   ├── Analytics.jsx         # Tab 2: Charts and stats
│   │   ├── AIAnalyzer.jsx        # Tab 3: Chat interface
│   │   └── Settings.jsx          # Tab 4: Config management
│   ├── lib/
│   │   ├── supabase.js           # Supabase client
│   │   ├── api.js                # Cloudflare Worker API calls
│   │   ├── scoring.js            # Quiz scoring logic
│   │   └── utm.js                # UTM parameter extraction
│   ├── data/
│   │   ├── questions.js          # All quiz questions
│   │   └── ctaContent.js         # CTA copy for 3 variations
│   ├── App.jsx                   # Main app component
│   └── main.jsx                  # App entry point
├── worker/
│   ├── src/
│   │   ├── index.js              # Hono app entry
│   │   ├── claude.js             # Claude API integration
│   │   ├── rateLimit.js          # Rate limiting logic
│   │   └── webhook.js            # n8n webhook calls
│   └── wrangler.toml             # Cloudflare Worker config
├── public/
├── .env                          # Frontend environment variables
├── package.json
├── vite.config.js
├── tailwind.config.js
├── nervous-system-quiz-prompt.md # Original specification
└── CLAUDE.md                     # This file
```

---

## Development Workflow

### Local Development

1. **Install dependencies**:
```bash
npm install
```

2. **Start frontend dev server**:
```bash
npm run dev
```

3. **Start Cloudflare Worker locally**:
```bash
cd worker
npm run dev
```

4. **Access app**:
   - Frontend: http://localhost:5173
   - Worker: http://localhost:8787
   - Admin: http://localhost:5173/admin

### Deployment

1. **Deploy frontend to Vercel**:
```bash
vercel --prod
```

2. **Deploy Cloudflare Worker**:
```bash
cd worker
wrangler publish
```

3. **Update environment variables** in both platforms

---

## Maintenance & Updates

### Editing Quiz Questions
All questions stored in: `src/data/questions.js`

### Editing CTA Copy
All CTA variations stored in: `src/data/ctaContent.js`

### Switching to Live Mode
1. Go to /admin
2. Navigate to Settings tab
3. Toggle mode to "Live"
4. Enter program URL
5. Save

### Updating Claude API Prompts
System prompt for insights: `worker/src/claude.js`

---

## Testing Checklist

- [ ] Q11 only shows when Q10 = "Yes"
- [ ] Progress bar adjusts for conditional Q11
- [ ] Scoring logic produces correct results
- [ ] All three CTA variations display correctly
- [ ] Waitlist mode works
- [ ] Live mode works (default CTA only)
- [ ] UTM parameters captured and stored
- [ ] Rate limiting blocks excess requests
- [ ] Claude API failure shows static content only
- [ ] Admin password protection works
- [ ] Analytics charts display correctly
- [ ] AI Analyzer can query responses
- [ ] Mobile responsive on all screens
- [ ] Email validation works
- [ ] n8n webhook receives correct tags

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **Hono Framework**: https://hono.dev/
- **Claude API Docs**: https://docs.anthropic.com/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vite**: https://vitejs.dev/

---

## Future Enhancements (Optional)

- A/B testing different welcome copy
- Additional UTM parameters if needed
- Email automation for follow-up sequences
- More detailed analytics (cohort analysis, retention)
- Export individual responses as PDF
- Multi-language support
- Integration with other email platforms

---

**Last Updated**: 2025-12-19
**Version**: 1.0.0
