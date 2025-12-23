/**
 * CTA Content Data
 * All CTA variations and results copy in one central location
 */

export const WELCOME_CONTENT = {
  title: 'Is Your Nervous System Sensitized?',
  subhead: 'Most people think they just need to relax more or find the right tool. But if your nervous system has become sensitized, that\'s why nothing has worked. Take this 2-minute quiz to find out.',
  buttonText: 'Take the Quiz'
};

export const RESULT_HEADLINES = {
  sensitized: 'Yes, your nervous system is likely sensitized.',
  not_sensitized: 'Your nervous system isn\'t fully sensitized yet.'
};

export const RESULT_EXPLANATIONS = {
  sensitized: 'Your alarm system has become too touchy. It\'s going off for things that aren\'t actually dangerous because you\'ve spent so long in survival mode that your body now interprets almost everything as a threat. Sensations, sounds, situations that used to be fine now set you off. And the tools you\'ve tried probably haven\'t worked because your body is using them to fight against what\'s happening instead of actually creating safety.',

  not_sensitized: 'Your nervous system is spending a lot of time stuck in survival mode. You\'re getting locked into fight, flight, or freeze and having a hard time coming back down after stress. Your system still has the capacity to regulate. It\'s getting stuck, not broken. But if you stay in this state long enough, sensitization is where it leads.'
};

export const CTA_TYPES = {
  ELIGIBLE: 'eligible',
  NOT_ELIGIBLE: 'not_eligible'
};

export const CONFIRMATION_MESSAGE = 'We\'ll send you some tips that can help in the meantime.';

export const FREE_TEXT_FIELD = {
  label: 'What\'s been going on for you?',
  helper: 'The more context you share, the more specific your results will be.',
  placeholder: 'Type here...'
};

export const EMAIL_FIELD = {
  label: 'Where should we send your results and follow-up tips?',
  placeholder: 'your@email.com'
};

/**
 * Determine if user is eligible for the program
 * Note: Everyone is now eligible - medical clearance data is tracked for analytics only
 */
export function getCtaType(hasPain, medicalClearance) {
  // Everyone is eligible regardless of pain or medical clearance status
  return CTA_TYPES.ELIGIBLE;
}

/**
 * Get ConvertKit tag based on eligibility and mode
 */
export function getConvertKitTag(ctaType, ctaConfig) {
  // Only eligible users can join, so they're the only ones getting tags
  if (ctaType !== CTA_TYPES.ELIGIBLE) {
    return null;
  }

  const mode = ctaConfig?.mode || 'waitlist';

  if (mode === 'live') {
    return 'program-joined';
  }

  return 'waitlist-ready';
}
