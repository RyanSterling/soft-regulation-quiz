/**
 * Quiz Scoring Logic
 */

/**
 * Calculate quiz scores from answers
 * Q10 and Q11 (anxious response) add 1.5x weight to baseline
 */
export function calculateScores(answers) {
  // Trigger score: Q1 + Q2 + Q3
  const trigger = (answers.q1 || 0) + (answers.q2 || 0) + (answers.q3 || 0);

  // Recovery score: Q4 + Q5 + Q6
  const recovery = (answers.q4 || 0) + (answers.q5 || 0) + (answers.q6 || 0);

  // Baseline score: Q7 + Q8 + Q9
  let baseline = (answers.q7 || 0) + (answers.q8 || 0) + (answers.q9 || 0);

  // Q10 and Q11 (anxious response) add 1.5x weight to baseline
  const anxiousResponseWeight = ((answers.q10 || 0) + (answers.q11 || 0)) * 1.5;
  baseline += anxiousResponseWeight;

  // Total score (includes weighted anxious response)
  const total = trigger + recovery + baseline;

  return {
    trigger,
    recovery,
    baseline,
    total
  };
}

/**
 * Determine result based on scores and answers
 * - If Q10 AND Q11 both >= 3 ("Often"): automatic "sensitized" (anxious responder override)
 * - If baseline >= 7 OR total >= 24: "sensitized"
 * - Else: "not_sensitized"
 */
export function determineResult(scores, answers = {}) {
  // Anxious responder override: if both Q10 and Q11 are "Often" or higher
  const q10Score = answers.q10 || 0;
  const q11Score = answers.q11 || 0;
  if (q10Score >= 3 && q11Score >= 3) {
    return 'sensitized';
  }

  // Standard threshold logic
  if (scores.baseline >= 7 || scores.total >= 24) {
    return 'sensitized';
  }
  return 'not_sensitized';
}

/**
 * Get all quiz data in format ready for submission
 */
export function prepareQuizData(answers, email, freeText, utmParams = {}) {
  const scores = calculateScores(answers);
  const result = determineResult(scores, answers);

  return {
    email,
    result,
    score_total: scores.total,
    score_trigger: scores.trigger,
    score_recovery: scores.recovery,
    score_baseline: scores.baseline,
    q1_answer: answers.q1,
    q2_answer: answers.q2,
    q3_answer: answers.q3,
    q4_answer: answers.q4,
    q5_answer: answers.q5,
    q6_answer: answers.q6,
    q7_answer: answers.q7,
    q8_answer: answers.q8,
    q9_answer: answers.q9,
    q10_answer: answers.q10 || null,
    q11_answer: answers.q11 || null,
    has_chronic_pain: answers.q12 || false,
    medical_clearance: answers.q13 || null,
    free_text_response: freeText || null,
    utm_source: utmParams.utm_source || null,
    utm_campaign: utmParams.utm_campaign || null,
    utm_content: utmParams.utm_content || null,
    utm_term: utmParams.utm_term || null,
    deployment_source: import.meta.env.VITE_DEPLOYMENT_SOURCE || 'organic'
  };
}
