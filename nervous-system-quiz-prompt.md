# Project: Nervous System Quiz for Soft Regulation™

## Overview
Build a self-hosted quiz that helps people determine if their nervous system is sensitized. The quiz captures email, generates a personalized AI insight based on their answers, and CTAs to a program waitlist (or live program when launched). Data is stored in Supabase with an admin dashboard for analytics.

## Tech Stack
- Frontend: React + Tailwind UI
- Hosting: Vercel or Netlify (static)
- Database: Supabase
- AI: Claude API (for personalized insights + dashboard analyzer)
- Integrations: n8n webhook (for ConvertKit tagging)

---

## Quiz Flow

### Structure
1. Welcome screen with start button
2. Q1-9: Core assessment (one question per screen)
3. Q10: Chronic pain screening (yes/no)
4. Q11: Medical clearance + trust (conditional—only shows if Q10 = Yes)
5. Free-text field (optional)
6. Email capture (required)
7. Results screen with personalized AI insight + CTA (CTA varies based on Q11 answer)
8. Progress bar at top throughout entire quiz

### Welcome Screen

**Title:** "Is Your Nervous System Sensitized?"

**Subhead:** "Most people think they just need to relax more or find the right tool. But if your nervous system has become sensitized, that's why nothing has worked. Take this 2-minute quiz to find out."

**Button:** "Take the Quiz"

---

## Questions

All Q1-9 use the same response scale:
- Rarely (score: 1)
- Sometimes (score: 2)
- Often (score: 3)
- Almost always (score: 4)

### Trigger Threshold (Q1-3)

**Q1:** "My body reacts to things that aren't actually dangerous—a text notification, someone's tone, a weird sensation—like they're real threats."

**Q2:** "Things that didn't used to bother me now set me off. My world of 'safe' keeps shrinking."
- Helper text below question: "Example: Places you used to go, sounds you used to tolerate, situations you used to handle"

**Q3:** "My body reacts before my brain catches up—I'm already in panic or shutdown before I even know what triggered it."
- Helper text: "Example: Heart racing before you've consciously registered what's wrong"

### Recovery Time (Q4-6)

**Q4:** "After something stressful, I stay activated for hours or days—even when the situation is completely over."

**Q5:** "Even when I know I'm safe, my body doesn't believe me. The racing heart, the tension, the dread—it just keeps going."

**Q6:** "Stress from one area of my life bleeds into everything else. I can't contain it."
- Helper text: "Example: A hard morning at work ruins your entire evening, or one bad interaction affects your whole week"

### Baseline State (Q7-9)

**Q7:** "I wake up already activated—anxious, bracing, or exhausted—before the day has even started."

**Q8:** "Real relaxation feels foreign. I can distract myself or collapse from exhaustion, but actually feeling calm and safe in my body is rare."

**Q9:** "Even in objectively calm moments, there's a hum underneath—a low-grade anxiety, unease, or like I'm waiting for something bad to happen."
- Helper text: "Example: You're on vacation or having a good day, but your body still feels 'on'"

### Chronic Pain Screening (Q10)

**Q10:** "Are you dealing with chronic pain or persistent physical symptoms—things like back pain, nerve pain, headaches, fibromyalgia, or other pain that hasn't gone away?"
- Yes
- No

### Medical Clearance + Trust (Q11 - conditional, only if Q10 = Yes)

**Q11:** "Have you ruled out structural damage, disease, or other medical causes for your pain—and do you trust that nothing major is being missed?"

Options:
- "Yes, I've been checked out and I'm confident my symptoms are nervous system related"
- "I've seen doctors but part of me still thinks something is being missed"
- "I haven't had this fully evaluated yet"

### Free-Text Field

**Label:** "The more context you share, the more specific your results will be. What's been going on for you?"

**Placeholder:** "Example: I've had anxiety for 10 years but the physical symptoms started after a stressful job change..."

- Optional field
- Textarea, 3-4 rows

### Email Capture

**Label:** "Where should we send your results and follow-up tips?"
- Required field
- Email validation

---

## Scoring Logic

### Calculate subscores:
- trigger_score = Q1 + Q2 + Q3 (range: 3-12)
- recovery_score = Q4 + Q5 + Q6 (range: 3-12)
- baseline_score = Q7 + Q8 + Q9 (range: 3-12)
- total_score = trigger_score + recovery_score + baseline_score (range: 9-36)

### Determine result:
- If baseline_score >= 9 OR total_score >= 27: result = "sensitized"
- Else: result = "not_sensitized"

(High baseline scores are the strongest indicator of sensitization, but very high overall scores also indicate sensitization even if baseline is moderate)

---

## Results Screen

### Structure:
1. Result headline
2. Brief explanation (static, based on result type)
3. AI-generated personalized insight (2-4 sentences)
4. CTA section (varies based on Q11 answer if applicable)
5. Confirmation message: "We'll send you some tips that can help in the meantime."

### Result Headlines:
- Sensitized: "Yes, your nervous system is likely sensitized."
- Not Sensitized: "Your nervous system isn't fully sensitized yet."

### Static explanation for Sensitized:
"Your alarm system has become too touchy. It's going off for things that aren't actually dangerous because you've spent so long in survival mode that your body now interprets almost everything as a threat. Sensations, sounds, situations that used to be fine now set you off. And the tools you've tried probably haven't worked because your body is using them to fight against what's happening instead of actually creating safety."

### Static explanation for Not Sensitized:
"Your nervous system is spending a lot of time stuck in survival mode. You're getting locked into fight, flight, or freeze and having a hard time coming back down after stress. Your system still has the capacity to regulate. It's getting stuck, not broken. But if you stay in this state long enough, sensitization is where it leads."

---

## AI-Generated Personalized Insight

Call Claude API with the following system prompt:

```
You are writing a personalized insight for someone who just completed a nervous system assessment. Your tone is warm, direct, validating. You sound like a knowledgeable friend who gets it, not a textbook or a robot.

You will receive:
- Their result: "sensitized" or "not_sensitized"
- Their scores for each dimension (trigger, recovery, baseline)
- Their answers to each question
- Whether they have chronic pain
- Their medical clearance status (if applicable)
- Their free-text response (if provided)

Your task:
1. Reflect back 1-2 specific patterns from their answers that stood out (reference their actual responses, don't be generic)
2. Connect those patterns to what's happening in their nervous system
3. Land on the core insight: this pattern doesn't shift with more tools or tips, it requires building real safety in the body

Keep it to 2-4 sentences. No bullet points. No clinical language. No dashes for rhetorical contrast. No rhetorical questions. Sound like a human.

Do NOT:
- List symptoms back at them
- Sound like a diagnosis
- Use phrases like "it sounds like" or "based on your responses"
- Use contrasting dash statements like "That's not X—that's Y"
- Be preachy or prescriptive
- Mention the program or sell anything (the CTA comes after)

DO:
- Be specific to what they shared
- Validate that this isn't their fault and they're not broken
- Sound human and warm
- If they shared free-text context, weave it in naturally

Example outputs for sensitized result:

High baseline scores:
"You're waking up already activated before anything has even happened. Even on good days, your body doesn't settle. Your system has learned that staying on high alert is the safest option, and no amount of breathing exercises or morning routines is going to override that. This needs a different approach."

High trigger scores:
"Things that used to be fine now set you off. Your world of safe keeps getting smaller. Your body is reading threat everywhere because the alarm has gotten too sensitive. More tools aren't going to fix this. Your system needs to learn that it's actually okay to stand down."

Example outputs for not_sensitized result:

High recovery scores:
"You can handle things in the moment but the stress stays with you way longer than it should. Hours later, sometimes days, your body is still processing something that's already over. Your system knows how to regulate. It's just getting stuck on the way back down."

Mixed scores:
"You're not in constant survival mode but you're dipping into it more than you should be, and it's taking longer to come back. Your nervous system still has the capacity to settle on its own. Right now it just needs some help remembering how."
```

### User message to Claude API:
```
Result: {result}
Scores: Trigger {trigger_score}/12, Recovery {recovery_score}/12, Baseline {baseline_score}/12
Total: {total_score}/36

Answers:
Q1 (threat response): {q1_answer}
Q2 (shrinking safety): {q2_answer}
Q3 (body before brain): {q3_answer}
Q4 (prolonged activation): {q4_answer}
Q5 (body doesn't believe safety): {q5_answer}
Q6 (stress bleeding): {q6_answer}
Q7 (waking activated): {q7_answer}
Q8 (relaxation foreign): {q8_answer}
Q9 (background hum): {q9_answer}

Has chronic pain: {yes/no}
Medical clearance: {yes_confident/seen_but_unsure/not_evaluated/n/a}

Additional context from user:
{free_text_response or "None provided"}
```

---

## CTA Sections

### Default CTA (no chronic pain, or chronic pain with "yes_confident" clearance):

**Headline:** "This is exactly what Soft Regulation™ is built for."

**Description:** "A simple approach to healing your nervous system without hour-long breathwork sessions, rigid protocols, or another program that treats healing like a full-time job."

**Button:** "Join the Waitlist"

### Trust CTA (chronic pain with "seen_but_unsure" clearance):

**Headline:** "This work requires you to trust your medical clearance"

**Body:** "If you've seen doctors, gotten imaging, gotten labs, and they haven't found anything major wrong, at some point you have to trust that. Not because it's impossible something was missed. But because staying stuck in that fixation is one of the things keeping your nervous system on high alert.

We can't make that decision for you. No coach can. But this work won't work if part of you is still convinced something is being missed.

When you get to the point where you're ready to stop searching and start healing, we'd love to work with you."

**Button:** "Join the Waitlist for When You're Ready"

### Evaluation CTA (chronic pain with "not_evaluated" clearance):

**Headline:** "Get checked out first"

**Body:** "Before diving into nervous system work, it's worth ruling out structural damage, disease, or other medical causes for your pain. Western medicine is very good at catching serious issues, even if it's not great at treating nervous system stuff. Get the imaging, get the labs, get a second opinion if you need one. Once you've done that and you're confident your symptoms are nervous system related, we'd love to work with you."

**Button:** "Join the Waitlist for When You're Ready"

### CTA Configuration (for switching from waitlist to live program):

This should be configurable via Supabase settings table so it can be switched without code changes:

```javascript
const ctaConfig = {
  mode: "waitlist", // or "live"
  waitlist: {
    buttonText: "Join the Waitlist",
    softButtonText: "Join the Waitlist for When You're Ready"
  },
  live: {
    buttonText: "Join Soft Regulation",
    buttonUrl: "https://...",
    softButtonText: "Join the Waitlist for When You're Ready" // Soft CTAs still go to waitlist
  }
}
```

When mode = "live", the default CTA button links to the program URL. The soft CTAs (trust and evaluation) always go to waitlist regardless of mode.

---

## On Submit Actions

### When user submits (after email capture):

1. **Save to Supabase** (responses table)
2. **POST to n8n webhook** with:
   - email
   - result (sensitized/not_sensitized)
   - has_chronic_pain
   - medical_clearance (yes_confident/seen_but_unsure/not_evaluated/null)
   - waitlist_opted_in (false initially)
   - utm_source, utm_campaign (if present in URL params)
3. **Call Claude API** to generate personalized insight
4. **Display results screen**

### When user clicks CTA button:

1. **Update Supabase** record: waitlist_opted_in = true
2. **POST to n8n webhook** with: email + appropriate tag based on which CTA they saw:
   - Default CTA: "waitlist-ready" (or "program-joined" if live mode)
   - Trust CTA: "waitlist-trust-issue"
   - Evaluation CTA: "waitlist-needs-evaluation"
3. If mode = "live" AND default CTA, redirect to buttonUrl

---

## Supabase Schema

### Table: responses
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
  waitlist_opted_in boolean default false,
  cta_type text, -- 'default', 'trust', 'evaluation'
  utm_source text,
  utm_campaign text
);
```

### Table: settings
```sql
create table settings (
  key text primary key,
  value jsonb not null
);

-- Insert default CTA config
insert into settings (key, value) values (
  'cta_config',
  '{
    "mode": "waitlist",
    "waitlist": {
      "buttonText": "Join the Waitlist",
      "softButtonText": "Join the Waitlist for When You are Ready"
    },
    "live": {
      "buttonText": "Join Soft Regulation",
      "buttonUrl": "",
      "softButtonText": "Join the Waitlist for When You are Ready"
    }
  }'
);
```

---

## Admin Dashboard

Separate route: /admin (password protected)

### Tab 1: Responses Table
- Sortable, filterable table showing all responses
- Columns: Date, Email, Result, Total Score, Has Pain, Medical Clearance, CTA Type, Waitlist Opted In, Free Text (truncated)
- Click row to expand and see full details including all individual question answers
- Filters: Result type, Has pain, Medical clearance status, CTA type, Waitlist opted in, Date range
- Search by email
- Export to CSV button

### Tab 2: Analytics Dashboard
- Date range selector at top (default: last 30 days)
- Cards showing:
  - Total submissions
  - Sensitized vs Not Sensitized (count + percentage)
  - % with chronic pain
  - Waitlist opt-in rate (overall)
  - Waitlist opt-in rate by CTA type
- Charts:
  - Submissions over time (line chart)
  - Result distribution (pie chart)
  - Score distributions by dimension (bar charts or histograms)
  - Medical clearance breakdown (for pain respondents only)
  - Conversion funnel: Quiz started → Completed → Opted in
  - Opt-in rate by CTA type (bar chart)

### Tab 3: AI Analyzer
- Chat interface
- System prompt gives Claude access to summary statistics and ability to query the dataset
- User can ask questions like:
  - "What are the most common themes in free-text responses?"
  - "How do sensitized respondents differ from not sensitized in their free-text answers?"
  - "What % of people with chronic pain have full medical clearance?"
  - "Summarize what people with high baseline scores are saying"
  - "What patterns do you see in people who opted into the waitlist vs those who didn't?"
  - "What are people with the trust issue saying in their free-text responses?"

Implementation:
- On each query, fetch relevant data from Supabase
- Pass data + user question to Claude API
- Stream response back to chat interface

### Tab 4: Settings
- Toggle for CTA mode (waitlist vs live)
- Input field for live program URL
- Save button that updates Supabase settings table

---

## UI/UX Requirements

- Use Tailwind UI components throughout
- Progress bar at top of quiz showing completion percentage
- One question per screen with smooth transitions
- Mobile-first responsive design
- Clean, calm aesthetic (specific fonts/colors to be provided by client)
- Helper text below questions should be visually subtle (smaller, lighter)
- Free-text field should feel inviting, not intimidating
- Results screen should feel like a moment of clarity, not a diagnosis

---

## Environment Variables Needed

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_CLAUDE_API_KEY=
VITE_N8N_WEBHOOK_URL=
VITE_ADMIN_PASSWORD=
```

---

## File Structure (suggested)

```
/src
  /components
    Quiz.jsx
    Question.jsx
    ProgressBar.jsx
    Results.jsx
    EmailCapture.jsx
    CTASection.jsx
    FreeTextInput.jsx
  /admin
    AdminLayout.jsx
    ResponsesTable.jsx
    Analytics.jsx
    AIAnalyzer.jsx
    Settings.jsx
  /lib
    supabase.js
    claude.js
    scoring.js
    webhook.js
  /data
    questions.js
    ctaContent.js
  App.jsx
  main.jsx
/public
  index.html
tailwind.config.js
```

---

## Notes for Claude Code

- Keep the codebase simple and maintainable
- All questions and copy should be easy to edit in one place (questions.js, ctaContent.js)
- The personalized AI insight is the key differentiator—make sure the Claude API integration is solid
- Error handling for API calls (Claude, Supabase, n8n) with graceful fallbacks
- If Claude API fails, still show results with static content only
- The admin dashboard can be basic/functional; polish is less important than the quiz itself
- Test the conditional logic for Q10/Q11 thoroughly
- Make sure the three CTA paths work correctly based on medical clearance answer
- Progress bar should account for conditional questions (Q11 only shows sometimes)
