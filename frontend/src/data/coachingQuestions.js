/**
 * Coaching Pre-Screening Assessment Questions
 *
 * 13 questions total:
 * - Q1-Q11: Scored questions (single choice)
 * - Q12: Free text (required, min 50 chars) - handled separately in component
 * - Q13: Hard gate question (commitment check)
 *
 * Scoring:
 * - Q1-Q10: 0-3 points (option index = score, except as noted)
 * - Q7: 0, 1, 2, 4 (bottom option gets +1 bonus)
 * - Q11: 0, 0, 1, 3, 3 (5 options with special mapping)
 * - Q13: Not scored, used as hard gate
 *
 * Auto-fail triggers (configurable in admin):
 * - Q11 options 4 or 5 (indices 3, 4)
 * - Q13 anything except "yes_certain"
 */

export const QUESTIONS = [
  // Q1
  {
    id: 'q1',
    questionNumber: 1,
    text: 'In a typical day, how many hours do you spend researching your symptoms, reading recovery stories, watching recovery content, or consuming nervous system / health content?',
    type: 'choice',
    options: [
      { value: 0, label: '0–30 minutes' },
      { value: 1, label: '30 minutes to 1 hour' },
      { value: 2, label: '1–3 hours' },
      { value: 3, label: '3+ hours' }
    ]
  },

  // Q2
  {
    id: 'q2',
    questionNumber: 2,
    text: 'In the last 7 days, how often did you check your body for symptoms — checking your pulse, scanning for sensations, testing whether something was still there, looking in the mirror, etc.?',
    type: 'choice',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'A few times total' },
      { value: 2, label: 'Daily' },
      { value: 3, label: 'Many times a day' }
    ]
  },

  // Q3 (was Q4)
  {
    id: 'q3',
    questionNumber: 3,
    text: "A new physical sensation shows up that you've never felt before. What's the most honest description of what you usually do in the next hour?",
    type: 'choice',
    options: [
      { value: 0, label: 'Notice it and keep doing what I was doing' },
      { value: 1, label: 'Look it up online or in an app' },
      { value: 2, label: 'Text or call someone about it' },
      { value: 3, label: 'Get pulled into a spiral that takes over the rest of my day' }
    ]
  },

  // Q4 (was Q5)
  {
    id: 'q4',
    questionNumber: 4,
    text: "You've just started a new approach to your recovery. How long before you start evaluating whether it's \"working\"?",
    type: 'choice',
    options: [
      { value: 0, label: 'I give things weeks or months before I evaluate' },
      { value: 1, label: 'I check in after a few days' },
      { value: 2, label: "I'm usually evaluating within 24 hours" },
      { value: 3, label: "I'm basically evaluating constantly" }
    ]
  },

  // Q5 (was Q6)
  {
    id: 'q5',
    questionNumber: 5,
    text: 'In the last 30 days, how often did you do something enjoyable without first checking whether your body could handle it?',
    type: 'choice',
    options: [
      { value: 0, label: 'Regularly' },
      { value: 1, label: 'Sometimes' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: "I can't remember the last time" }
    ]
  },

  // Q6 (was Q7)
  {
    id: 'q6',
    questionNumber: 6,
    text: 'Over the last month, roughly how many days did your symptoms dictate your schedule?',
    type: 'choice',
    options: [
      { value: 0, label: '0–5 days' },
      { value: 1, label: '5–15 days' },
      { value: 2, label: '15–25 days' },
      { value: 3, label: 'Most days' }
    ]
  },

  // Q7 (was Q8) - Bottom option gets +1 bonus (4 points instead of 3)
  {
    id: 'q7',
    questionNumber: 7,
    text: 'If someone asked you to describe yourself without mentioning your health, symptoms, or nervous system, how would that feel?',
    helper: 'Think about your interests, relationships, work, hobbies — the parts of you beyond your health journey.',
    type: 'choice',
    options: [
      { value: 0, label: 'Easy' },
      { value: 1, label: 'Takes a minute but doable' },
      { value: 2, label: 'Hard' },
      { value: 3, label: "I don't really know who I am outside of this right now" }
    ]
  },

  // Q8 (was Q9)
  {
    id: 'q8',
    questionNumber: 8,
    text: 'Which statement is most honest for you right now?',
    type: 'choice',
    options: [
      { value: 0, label: "I know what I need to do, I just don't always do it" },
      { value: 1, label: "I understand all of this intellectually but I can't seem to apply it" },
      { value: 2, label: "I've tried everything and nothing works for me" },
      { value: 3, label: "I'm not sure I believe nervous system work applies to my situation" }
    ]
  },

  // Q9 (was Q10)
  {
    id: 'q9',
    questionNumber: 9,
    text: "When someone tells you that you have to stop checking and reassurance-seeking, what's your gut reaction?",
    type: 'choice',
    options: [
      { value: 0, label: "I agree and I've been working on it" },
      { value: 1, label: "I agree but I don't know how to actually stop" },
      { value: 2, label: 'I agree, but my situation is different' },
      { value: 3, label: 'That sounds impossible right now' }
    ]
  },

  // Q10 (was Q11)
  {
    id: 'q10',
    questionNumber: 10,
    text: "When you read or hear about people who recovered, what's closest to your internal response?",
    type: 'choice',
    options: [
      { value: 0, label: "I feel hopeful and use it as evidence it's possible" },
      { value: 1, label: 'I study their timeline to see how long it took' },
      { value: 2, label: 'I look for differences between their case and mine' },
      { value: 3, label: 'I feel worse because my case feels different or more severe' }
    ]
  },

  // Q11 (was Q12) - 5 options with special scoring, options 4 & 5 are auto-fail triggers
  {
    id: 'q11',
    questionNumber: 11,
    text: 'When you see content telling people with chronic symptoms to "get out and live your life," what\'s your honest first reaction?',
    type: 'choice',
    options: [
      { value: 0, label: "I'm already living my life — this isn't the part I'm working on" },
      { value: 1, label: "That resonates — that's the direction I want to move in" },
      { value: 2, label: "I agree in principle but I'm not there yet" },
      { value: 3, label: "That advice doesn't account for conditions like mine" },
      { value: 4, label: 'That advice can be harmful for people with real physical limitations like mine' }
    ]
  },

  // Q13 (was Q14) - Hard gate question (Q12 is free text, handled separately)
  {
    id: 'q13',
    questionNumber: 13,
    text: 'Are you 100% certain that the symptoms or condition you\'re dealing with are nervous system related?',
    type: 'choice',
    isHardGate: true,
    options: [
      { value: 'yes_certain', label: "Yes, I'm 100% certain" },
      { value: 'mostly_sure', label: "I'm mostly sure but still have some doubt" },
      { value: 'unsure', label: "I think so but I'm not certain" },
      { value: 'no', label: "No, I'm still trying to figure out what's wrong" }
    ]
  }
];

/**
 * Get all questions (no conditional logic in this quiz)
 */
export function getVisibleQuestions() {
  return QUESTIONS;
}

/**
 * Get total question count (including Q12 free text which is handled separately)
 */
export function getTotalQuestionCount() {
  return QUESTIONS.length + 1; // +1 for Q12 free text
}

/**
 * Get a specific question by ID
 */
export function getQuestionById(id) {
  return QUESTIONS.find(q => q.id === id);
}

/**
 * Get question text by ID (for review emails)
 */
export function getQuestionText(id) {
  const question = getQuestionById(id);
  return question ? question.text : '';
}

/**
 * Get option label by question ID and value
 */
export function getOptionLabel(questionId, value) {
  const question = getQuestionById(questionId);
  if (!question) return '';
  const option = question.options.find(o => o.value === value);
  return option ? option.label : '';
}
