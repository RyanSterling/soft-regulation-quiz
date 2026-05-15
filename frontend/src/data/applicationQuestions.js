/**
 * 1:1 Business Coaching Application - Question Definitions
 */

// Timezone options for dropdown
export const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'Europe/London', label: 'UK / London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central Europe (CET)' },
  { value: 'Europe/Berlin', label: 'Germany / Berlin (CET)' },
  { value: 'Australia/Sydney', label: 'Australia / Sydney (AEST)' },
  { value: 'Australia/Perth', label: 'Australia / Perth (AWST)' },
  { value: 'Asia/Tokyo', label: 'Japan / Tokyo (JST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'other', label: 'Other' }
];

// Revenue range options
export const REVENUE_OPTIONS = [
  { value: 'under_100k', label: 'Under $100K' },
  { value: '100k_250k', label: '$100K - $250K' },
  { value: '250k_500k', label: '$250K - $500K' },
  { value: '500k_1m', label: '$500K - $1M' },
  { value: 'over_1m', label: '$1M+' }
];

// Pricing acknowledgment options
export const PRICING_OPTIONS = [
  { value: 'yes', label: "Yes, I'm ready" },
  { value: 'not_yet', label: 'Not yet' }
];

// Links question - individual URL fields, at least 1 required
export const LINKS_QUESTION = {
  questionNumber: 3,
  headline: 'Where can I see your work?',
  helper: 'Share at least one link or handle so I can get a sense of your public-facing presence.',
  requirement: 'At least 1 link required',
  fields: [
    { id: 'instagram', label: 'Instagram', placeholder: '@yourhandle' },
    { id: 'youtube', label: 'YouTube', placeholder: '@yourchannel' },
    { id: 'tiktok', label: 'TikTok', placeholder: '@yourhandle' },
    { id: 'website', label: 'Website', placeholder: 'yourwebsite.com' },
    { id: 'other', label: 'Other', placeholder: 'Link or handle' }
  ]
};

// Symptoms question - yes/no with conditional free text
export const SYMPTOMS_QUESTION = {
  questionNumber: 4,
  headline: 'Are you currently dealing with any nervous system related symptoms?',
  helper: '',
  options: [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ],
  followUp: {
    label: 'What symptoms or patterns are you experiencing?',
    helper: 'Be specific about what you experience day-to-day.',
    placeholder: 'Describe the nervous system symptoms or patterns affecting you...',
    minChars: 50
  }
};

// Course question - yes/no
export const COURSE_QUESTION = {
  questionNumber: 5,
  headline: "Have you taken Maggie's course, Soft Regulation Desensitize?",
  helper: '',
  options: [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ]
};

// Free text questions (shown one per screen)
export const FREE_TEXT_QUESTIONS = [
  {
    id: 'business_description',
    questionNumber: 2,
    label: 'Tell me about your business.',
    helper: 'What do you do, who do you serve, what does your public-facing work look like?',
    placeholder: 'Describe your business, audience, and the work you do publicly...',
    required: true,
    minChars: 50
  },
  // Questions 3 (links), 4 (symptoms), and 5 (course) are handled separately
  {
    id: 'already_tried',
    questionNumber: 6,
    label: 'What have you already tried?',
    helper: 'Therapy, modalities, courses, practitioners, etc.',
    placeholder: "List what you've already attempted to address this...",
    required: true,
    minChars: 50
  },
  {
    id: 'success_outcome',
    questionNumber: 7,
    label: 'What would success look like for you after 3 months of coaching?',
    helper: '',
    placeholder: "Describe the outcome you're hoping for...",
    required: true,
    minChars: 30
  },
  {
    id: 'anything_else',
    questionNumber: 8,
    label: 'Is there anything else you want me to know before our discovery call?',
    helper: 'Optional, but helpful.',
    placeholder: 'Anything else relevant to your situation...',
    required: false,
    minChars: 0
  }
];

// Content for each step
export const STEP_CONTENT = {
  welcome: {
    headline: '1:1 Business Coaching Application',
    subhead: 'This is an application for private 1:1 coaching with Maggie. Please answer honestly — there are no right answers, just fit.',
    buttonText: 'Begin Application',
    timeEstimate: 'Takes about 10 minutes'
  },
  contact: {
    headline: "Let's start with the basics.",
    fields: {
      name: {
        label: 'Your name',
        placeholder: 'Full name',
        required: true
      },
      email: {
        label: 'Email address',
        placeholder: 'you@example.com',
        required: true
      },
      location: {
        label: 'Where are you located?',
        placeholder: 'City, Country',
        required: false
      },
      timezone: {
        label: 'Your time zone',
        placeholder: 'Select your timezone',
        required: true
      }
    }
  },
  revenue: {
    questionNumber: 8,
    headline: "What's your current annual revenue range?",
    helper: 'Approximate is fine.'
  },
  pricing: {
    questionNumber: 9,
    headline: 'One last thing.',
    statement: 'I understand the investment is $5,500 for the 3-month container and I\'m ready to enroll if we\'re a mutual fit.',
    helper: ''
  },
  confirmation: {
    headline: 'Application Received',
    subhead: 'Thank you for applying.',
    body: "Maggie reviews every application personally. If you're a fit, she'll be in touch within 2-3 business days to schedule a discovery call."
  },
  loading: {
    message: 'Submitting your application...'
  }
};

// Total question count for progress bar
// welcome + contact + business + links + symptoms + course + already_tried + success_outcome + anything_else + pricing
export const TOTAL_STEPS = 11;

// URL/handle validation helper - accepts URLs, handles (@username), or plain text
export function isValidUrl(string) {
  if (!string || string.trim() === '') return true; // Empty is OK (we check at least 1 separately)
  // Accept anything that looks like a handle, URL, or username
  // Just make sure they entered something meaningful (at least 3 chars)
  return string.trim().length >= 3;
}
