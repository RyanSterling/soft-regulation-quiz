/**
 * Quiz Questions Data
 * All quiz questions, options, and helper text in one central location
 */

export const SCALE_OPTIONS = [
  { value: 1, label: 'Rarely' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Often' },
  { value: 4, label: 'Almost always' }
];

export const QUESTIONS = [
  // Trigger Threshold (Q1-3)
  {
    id: 'q1',
    category: 'trigger',
    text: 'My body reacts to things that aren\'t actually dangerous—a text notification, someone\'s tone, a weird sensation—like they\'re real threats.',
    type: 'scale',
    options: SCALE_OPTIONS
  },
  {
    id: 'q2',
    category: 'trigger',
    text: 'Things that didn\'t used to bother me now set me off. My world of "safe" keeps shrinking.',
    helper: 'Example: Places you used to go, sounds you used to tolerate, situations you used to handle',
    type: 'scale',
    options: SCALE_OPTIONS
  },
  {
    id: 'q3',
    category: 'trigger',
    text: 'My body reacts before my brain catches up—I\'m already in panic or shutdown before I even know what triggered it.',
    helper: 'Example: Heart racing before you\'ve consciously registered what\'s wrong',
    type: 'scale',
    options: SCALE_OPTIONS
  },

  // Recovery Time (Q4-6)
  {
    id: 'q4',
    category: 'recovery',
    text: 'After something stressful, I stay activated for hours or days—even when the situation is completely over.',
    type: 'scale',
    options: SCALE_OPTIONS
  },
  {
    id: 'q5',
    category: 'recovery',
    text: 'Even when I know I\'m safe, my body doesn\'t believe me. The racing heart, the tension, the dread—it just keeps going.',
    type: 'scale',
    options: SCALE_OPTIONS
  },
  {
    id: 'q6',
    category: 'recovery',
    text: 'Stress from one area of my life bleeds into everything else. I can\'t contain it.',
    helper: 'Example: A hard morning at work ruins your entire evening, or one bad interaction affects your whole week',
    type: 'scale',
    options: SCALE_OPTIONS
  },

  // Baseline State (Q7-9)
  {
    id: 'q7',
    category: 'baseline',
    text: 'I wake up already activated—anxious, bracing, or exhausted—before the day has even started.',
    type: 'scale',
    options: SCALE_OPTIONS
  },
  {
    id: 'q8',
    category: 'baseline',
    text: 'Real relaxation feels foreign. I can distract myself or collapse from exhaustion, but actually feeling calm and safe in my body is rare.',
    type: 'scale',
    options: SCALE_OPTIONS
  },
  {
    id: 'q9',
    category: 'baseline',
    text: 'Even in objectively calm moments, there\'s a hum underneath—a low-grade anxiety, unease, or like I\'m waiting for something bad to happen.',
    helper: 'Example: You\'re on vacation or having a good day, but your body still feels "on"',
    type: 'scale',
    options: SCALE_OPTIONS
  },

  // Anxious Response Pattern (Q10-11) - Heavy weight in scoring
  {
    id: 'q10',
    category: 'anxious_response',
    text: 'Do you find yourself constantly checking your body, researching your symptoms, or seeking reassurance—even though it only brings temporary relief?',
    type: 'scale',
    options: SCALE_OPTIONS
  },
  {
    id: 'q11',
    category: 'anxious_response',
    text: 'Do you live in a state of chronic fear about your symptoms, spending significant mental energy worrying, monitoring, or running through worst-case scenarios?',
    type: 'scale',
    options: SCALE_OPTIONS
  },

  // Physical Symptoms (Q12)
  {
    id: 'q12',
    category: 'symptoms',
    text: 'Are you experiencing any physical symptoms? If so, which ones?',
    helper: 'Select all that apply',
    type: 'multiselect',
    options: [
      { id: 'anxiety', label: 'Anxiety / panic' },
      { id: 'back_pain', label: 'Back pain' },
      { id: 'bladder_pain', label: 'Bladder pain / IC' },
      { id: 'chronic_fatigue', label: 'Chronic fatigue' },
      { id: 'crps', label: 'CRPS' },
      { id: 'dizziness', label: 'Dizziness / vertigo' },
      { id: 'fibromyalgia', label: 'Fibromyalgia' },
      { id: 'ibs', label: 'IBS / digestive issues' },
      { id: 'long_covid', label: 'Long COVID' },
      { id: 'migraines', label: 'Migraines / headaches' },
      { id: 'neck_pain', label: 'Neck pain' },
      { id: 'pelvic_pain', label: 'Pelvic pain' },
      { id: 'tingling', label: 'Tingling / numbness' },
      { id: 'none', label: 'None' },
      { id: 'other', label: 'Other' }
    ],
    hasOtherText: true
  }
];

// Helper function to get questions that should be shown based on answers
export function getVisibleQuestions(answers) {
  return QUESTIONS.filter(question => {
    if (!question.conditional) return true;

    const conditionalAnswer = answers[question.conditional.questionId];
    return conditionalAnswer === question.conditional.value;
  });
}

// Helper function to calculate total question count (including conditionals)
export function getTotalQuestionCount(answers) {
  return getVisibleQuestions(answers).length;
}
