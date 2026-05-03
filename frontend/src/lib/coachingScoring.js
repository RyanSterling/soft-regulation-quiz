/**
 * Coaching Pre-Screening Assessment Scoring Logic
 *
 * Client-side scoring that reads configuration from database.
 * This allows admins to adjust scoring without code changes.
 *
 * Scoring Rules:
 * - Q1-Q10: 0-3 points based on option index (configurable)
 * - Q7: 0, 1, 2, 4 (bottom option gets +1 bonus by default)
 * - Q11: 0, 0, 1, 3, 3 (5 options with special mapping)
 * - Q13: Hard gate (not scored)
 *
 * Auto-FAIL triggers (configurable):
 * - Q11 options 4 or 5 (indices 3, 4)
 * - Q13 anything except "yes_certain"
 *
 * Outcome thresholds (configurable):
 * - 0-10: PASS
 * - 11-19: REVIEW
 * - 20+: FAIL
 */

/**
 * Score the coaching quiz answers using the provided config
 *
 * @param {object} answers - Object with question IDs as keys and answer values as values
 * @param {object} config - Scoring configuration from database
 * @returns {object} - { outcome: 'PASS'|'REVIEW'|'FAIL', score: number, reason: string|null }
 */
export function scoreCoachingQuiz(answers, config) {
  const { question_scores, thresholds, auto_fail_options } = config;

  // Step 1: Check Q13 hard gate
  const q13Answer = answers.q13;
  if (auto_fail_options.q13 && auto_fail_options.q13.includes(q13Answer)) {
    return {
      outcome: 'FAIL',
      score: null,
      reason: 'commitment_gate'
    };
  }

  // Step 2: Check auto-fail triggers for other questions
  for (const [questionId, failIndices] of Object.entries(auto_fail_options)) {
    if (questionId === 'q13') continue; // Already handled above

    const answerValue = answers[questionId];
    if (answerValue !== undefined && failIndices.includes(answerValue)) {
      return {
        outcome: 'FAIL',
        score: null,
        reason: `autofail_${questionId}`
      };
    }
  }

  // Step 3: Calculate total score using config values
  let score = 0;

  for (const [questionId, scoreMap] of Object.entries(question_scores)) {
    const answerValue = answers[questionId];

    if (answerValue !== undefined && scoreMap[answerValue] !== undefined) {
      score += scoreMap[answerValue];
    }
  }

  // Step 4: Determine outcome based on thresholds
  if (score <= thresholds.pass_max) {
    return {
      outcome: 'PASS',
      score,
      reason: null
    };
  }

  if (score <= thresholds.review_max) {
    return {
      outcome: 'REVIEW',
      score,
      reason: null
    };
  }

  return {
    outcome: 'FAIL',
    score,
    reason: 'score_threshold'
  };
}

/**
 * Calculate score breakdown by question (for admin viewing)
 *
 * @param {object} answers - Object with question IDs as keys and answer values as values
 * @param {object} questionScores - Score mapping from config
 * @returns {object} - { q1: score, q2: score, ..., total: totalScore }
 */
export function getScoreBreakdown(answers, questionScores) {
  const breakdown = {};
  let total = 0;

  for (const [questionId, scoreMap] of Object.entries(questionScores)) {
    const answerValue = answers[questionId];
    const points = (answerValue !== undefined && scoreMap[answerValue] !== undefined)
      ? scoreMap[answerValue]
      : 0;

    breakdown[questionId] = points;
    total += points;
  }

  breakdown.total = total;
  return breakdown;
}

/**
 * Get maximum possible score based on config
 *
 * @param {object} questionScores - Score mapping from config
 * @returns {number} - Maximum possible score
 */
export function getMaxScore(questionScores) {
  let maxScore = 0;

  for (const scoreMap of Object.values(questionScores)) {
    const maxForQuestion = Math.max(...scoreMap);
    maxScore += maxForQuestion;
  }

  return maxScore;
}

/**
 * Check if a specific answer triggers auto-fail
 *
 * @param {string} questionId - The question ID
 * @param {any} answerValue - The answer value
 * @param {object} autoFailOptions - Auto-fail configuration
 * @returns {boolean} - True if this answer triggers auto-fail
 */
export function isAutoFailAnswer(questionId, answerValue, autoFailOptions) {
  const failValues = autoFailOptions[questionId];
  if (!failValues) return false;
  return failValues.includes(answerValue);
}

/**
 * Format outcome for display
 *
 * @param {string} outcome - 'PASS', 'REVIEW', or 'FAIL'
 * @returns {object} - { text: string, color: string, bgColor: string }
 */
export function getOutcomeDisplay(outcome) {
  switch (outcome) {
    case 'PASS':
      return {
        text: 'Approved',
        color: '#166534', // green-800
        bgColor: '#DCFCE7' // green-100
      };
    case 'REVIEW':
      return {
        text: 'Under Review',
        color: '#92400E', // amber-800
        bgColor: '#FEF3C7' // amber-100
      };
    case 'FAIL':
      return {
        text: 'Not Approved',
        color: '#991B1B', // red-800
        bgColor: '#FEE2E2' // red-100
      };
    default:
      return {
        text: outcome,
        color: '#374151', // gray-700
        bgColor: '#F3F4F6' // gray-100
      };
  }
}
