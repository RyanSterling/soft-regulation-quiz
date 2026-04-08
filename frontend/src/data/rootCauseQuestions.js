/**
 * Root Cause Quiz Questions Data
 * Based on Dr. Howard Schubiner's FIT Criteria (Functional, Inconsistent, Triggered)
 */

export const SYMPTOM_OPTIONS = [
  { id: 'back_pain', label: 'Back pain' },
  { id: 'neck_pain', label: 'Neck pain' },
  { id: 'migraines', label: 'Migraines / headaches' },
  { id: 'ibs', label: 'IBS / digestive issues' },
  { id: 'fibromyalgia', label: 'Fibromyalgia' },
  { id: 'chronic_fatigue', label: 'Chronic fatigue' },
  { id: 'pelvic_pain', label: 'Pelvic pain' },
  { id: 'crps', label: 'CRPS' },
  { id: 'tingling', label: 'Tingling / numbness' },
  { id: 'anxiety', label: 'Anxiety / panic' },
  { id: 'other', label: 'Other' }
];

export const QUESTIONS = [
  // Section 1: Your Symptoms
  {
    id: 'symptoms',
    section: 'symptoms',
    sectionTitle: 'Your Symptoms',
    text: 'What symptoms are you experiencing?',
    helper: 'Select all that apply',
    type: 'multiselect',
    options: SYMPTOM_OPTIONS,
    hasOtherText: true
  },
  {
    id: 'duration',
    section: 'symptoms',
    text: 'How long have you had these symptoms?',
    type: 'choice',
    options: [
      { value: 'less_than_3_months', label: 'Less than 3 months' },
      { value: '3_to_12_months', label: '3-12 months' },
      { value: '1_to_3_years', label: '1-3 years' },
      { value: 'more_than_3_years', label: '3+ years' }
    ]
  },
  {
    id: 'structuralCause',
    section: 'symptoms',
    text: 'Have doctors found a clear structural cause for your symptoms?',
    helper: 'Such as tumor, fracture, infection, autoimmune disease, or nerve damage',
    type: 'choice',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'unclear', label: 'Some findings, but unclear if they\'re the cause' },
      { value: 'not_evaluated', label: 'Haven\'t been evaluated' }
    ]
  },

  // Section 2: Functional (F)
  {
    id: 'symptomOnset',
    section: 'functional',
    sectionTitle: 'How Your Symptoms Behave',
    text: 'How did your symptoms begin?',
    type: 'choice',
    options: [
      { value: 'injury', label: 'Clear injury or accident' },
      { value: 'stress', label: 'During a stressful period' },
      { value: 'gradual', label: 'Gradually, with no clear cause' },
      { value: 'sudden', label: 'Suddenly, like waking up one day' }
    ]
  },
  {
    id: 'multipleAreas',
    section: 'functional',
    text: 'Do your symptoms occur in multiple body areas?',
    type: 'yesno',
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ]
  },
  {
    id: 'spreadOverTime',
    section: 'functional',
    text: 'Have your symptoms spread to new areas over time?',
    type: 'yesno',
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ]
  },

  // Section 3: Inconsistent (I)
  {
    id: 'shiftLocations',
    section: 'inconsistent',
    sectionTitle: 'Symptom Patterns',
    text: 'Do your symptoms shift locations?',
    helper: 'Moving from one area to another over hours, days, or weeks',
    type: 'choice',
    options: [
      { value: 'frequently', label: 'Yes, frequently' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'rarely', label: 'Rarely or never' }
    ]
  },
  {
    id: 'betterWhenDistracted',
    section: 'inconsistent',
    text: 'Are your symptoms better when you\'re distracted, on vacation, or doing something enjoyable?',
    type: 'choice',
    options: [
      { value: 'noticeably', label: 'Yes, noticeably' },
      { value: 'somewhat', label: 'Somewhat' },
      { value: 'no_difference', label: 'No difference' }
    ]
  },
  {
    id: 'worseDuringStress',
    section: 'inconsistent',
    text: 'Do your symptoms get worse during stressful times?',
    type: 'choice',
    options: [
      { value: 'clearly', label: 'Yes, clearly' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'no_pattern', label: 'No pattern' }
    ]
  },

  // Section 4: Triggered (T)
  {
    id: 'triggeredByUnrelated',
    section: 'triggered',
    sectionTitle: 'Triggers',
    text: 'Are your symptoms triggered by things unrelated to the symptom itself?',
    helper: 'Such as weather, foods, smells, sounds, or anticipating stressful events',
    type: 'choice',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'no', label: 'No' }
    ]
  },

  // Section 5: History
  {
    id: 'historyOfSymptoms',
    section: 'history',
    sectionTitle: 'Your History',
    text: 'Have you experienced various unexplained symptoms throughout your life?',
    helper: 'Not just your current issue, but different symptoms over the years',
    type: 'choice',
    options: [
      { value: 'several', label: 'Yes, several different issues' },
      { value: 'a_few', label: 'A few' },
      { value: 'first', label: 'This is my first' }
    ]
  }
];

// Helper function to get all questions (no conditional logic in this quiz)
export function getVisibleQuestions() {
  return QUESTIONS;
}

// Helper function to get total question count
export function getTotalQuestionCount() {
  return QUESTIONS.length;
}

// Helper to get section info for a question
export function getSectionInfo(questionId) {
  const question = QUESTIONS.find(q => q.id === questionId);
  return question ? { section: question.section, sectionTitle: question.sectionTitle } : null;
}
