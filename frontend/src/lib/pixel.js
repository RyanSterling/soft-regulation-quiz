/**
 * Facebook Pixel tracking helpers
 */

export function trackQuizCompleted(result, scores) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration', {
      content_name: 'Sensitization Quiz',
      status: result,
      value: scores.total
    });
  }
}

export function trackSensitizedResult(scores) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', 'SensitizedResult', {
      trigger_score: scores.trigger,
      recovery_score: scores.recovery,
      baseline_score: scores.baseline,
      total_score: scores.total
    });
  }
}
