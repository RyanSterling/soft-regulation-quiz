/**
 * Coaching Pre-Screening Assessment Content
 *
 * All copy and configuration for the coaching quiz screens
 */

// ============================================
// CONFIGURATION
// Change these to switch between signup/waitlist modes
// ============================================

export const COACHING_MODE = 'signup'; // 'signup' or 'waitlist'
export const SIGNUP_URL = 'https://maggiesterling.com/coaching-signup'; // Replace with actual URL
export const WAITLIST_URL = 'https://maggiesterling.com/coaching-waitlist'; // Replace with actual URL
export const DESENSITIZE_URL = 'https://maggiesterling.com/desensitize'; // Replace with actual course URL

// ============================================
// VALIDATION
// ============================================

export const FREE_TEXT_MIN_CHARS = 50;

// ============================================
// WELCOME SCREEN
// ============================================

export const WELCOME_CONTENT = {
  title: 'Coaching Pre-Screening',
  subhead: 'This short assessment will help us determine if you\'re a fit for the upcoming coaching program. Answer honestly — there are no right or wrong answers.',
  buttonText: 'Start Assessment',
  disclaimer: 'This assessment takes about 3-5 minutes to complete.'
};

// ============================================
// Q12 FREE TEXT FIELD
// ============================================

export const FREE_TEXT_CONTENT = {
  questionNumber: 12,
  label: 'What would you want to get out of this coaching program?',
  helper: 'Please share in 2-3 sentences.',
  placeholder: 'Type your answer here...',
  minCharsMessage: (current, min) => `${current}/${min} characters minimum`,
  errorMessage: `Please provide at least ${FREE_TEXT_MIN_CHARS} characters`
};

// ============================================
// EMAIL CAPTURE
// ============================================

export const EMAIL_CONTENT = {
  label: 'Enter your email to complete your application.',
  placeholder: 'your@email.com',
  helper: 'We\'ll use this to contact you about your application.',
  privacyText: 'I agree to the',
  privacyLinkText: 'Privacy Policy',
  privacyUrl: '/privacy',
  submitButton: 'Submit Application'
};

// ============================================
// LOADING SCREEN
// ============================================

export const LOADING_CONTENT = {
  message: 'Processing your application...'
};

// ============================================
// RESULTS SCREENS
// ============================================

export const RESULTS_CONTENT = {
  PASS: {
    headline: "You're a Great Fit",
    subhead: 'Based on your responses, the coaching program looks like a strong match for where you are in your recovery.',
    body: "We're excited to potentially have you join us. Click the button below to secure your spot.",
    ctaText: COACHING_MODE === 'signup' ? 'Sign Up for Coaching' : 'Join the Waitlist',
    ctaUrl: COACHING_MODE === 'signup' ? SIGNUP_URL : WAITLIST_URL
  },
  REVIEW: {
    headline: 'Application Under Review',
    subhead: 'Thanks for taking the time to fill this out.',
    body: 'We review every submission personally. If you\'re a fit for the coaching program, we\'ll be in touch.',
    ctaText: null, // No CTA for review
    ctaUrl: null
  },
  FAIL: {
    headline: 'Not the Right Starting Point',
    subhead: 'Based on your answers, the coaching program isn\'t the right starting point for you right now.',
    body: 'The Soft Regulation\u2122 Desensitize course is designed for exactly where you are, and is the path we\'d recommend before considering coaching.',
    ctaText: 'Learn About Desensitize',
    ctaUrl: DESENSITIZE_URL
  }
};

// ============================================
// FAIL REASONS (for admin display)
// ============================================

export const FAIL_REASON_LABELS = {
  commitment_gate: 'Q13: Not 100% certain about NS cause',
  autofail_q11: 'Q11: Victim mentality response',
  score_threshold: 'Score exceeded threshold'
};

// ============================================
// HELPER FUNCTION
// Get CTA URL based on mode
// ============================================

export function getCoachingCtaUrl() {
  return COACHING_MODE === 'signup' ? SIGNUP_URL : WAITLIST_URL;
}

export function getCoachingCtaText() {
  return COACHING_MODE === 'signup' ? 'Sign Up for Coaching' : 'Join the Waitlist';
}
