/**
 * Quiz Scoring Logic
 */

/**
 * Calculate quiz scores from answers
 */
export function calculateScores(answers) {
  // Trigger score: Q1 + Q2 + Q3
  const trigger = (answers.q1 || 0) + (answers.q2 || 0) + (answers.q3 || 0);

  // Recovery score: Q4 + Q5 + Q6
  const recovery = (answers.q4 || 0) + (answers.q5 || 0) + (answers.q6 || 0);

  // Baseline score: Q7 + Q8 + Q9
  const baseline = (answers.q7 || 0) + (answers.q8 || 0) + (answers.q9 || 0);

  // Total score
  const total = trigger + recovery + baseline;

  return {
    trigger,
    recovery,
    baseline,
    total
  };
}

/**
 * Determine result based on scores
 * - If baseline >= 8 OR total >= 27: "sensitized"
 * - Else: "not_sensitized"
 */
export function determineResult(scores) {
  if (scores.baseline >= 8 || scores.total >= 27) {
    return 'sensitized';
  }
  return 'not_sensitized';
}

/**
 * Get all quiz data in format ready for submission
 */
export function prepareQuizData(answers, email, freeText, utmParams = {}) {
  const scores = calculateScores(answers);
  const result = determineResult(scores);

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
    has_chronic_pain: answers.q10 || false,
    medical_clearance: answers.q11 || null,
    free_text_response: freeText || null,
    utm_source: utmParams.utm_source || null,
    utm_campaign: utmParams.utm_campaign || null
  };
}
