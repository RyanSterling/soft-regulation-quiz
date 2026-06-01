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

export function trackResultsViewed(result, scores) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: 'Quiz Results',
      content_category: result,
      value: scores?.total || 0
    });
  }
}

export function trackResultsEngagement(result, timeSpentSeconds) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', 'ResultsEngagement', {
      content_name: 'Quiz Results',
      result: result,
      time_spent_seconds: timeSpentSeconds
    });
  }
}
