/**
 * Root Cause Quiz Content Data
 * Welcome screen, results copy, and UI text
 */

export const WELCOME_CONTENT = {
  title: 'Are Your Symptoms Driven by Your Nervous System?',
  subhead: 'Chronic pain and symptoms often persist not because of ongoing damage, but because your nervous system has learned to amplify danger signals. Take this assessment to understand what might be driving your symptoms.',
  buttonText: 'Start the Assessment'
};

export const FREE_TEXT_FIELD = {
  label: 'Anything else you\'d like to share about your symptoms or situation?',
  helper: 'Optional, but the more context you provide, the more personalized your assessment will be.',
  placeholder: 'Type here...'
};

export const EMAIL_FIELD = {
  label: 'Where should we send your personalized assessment?',
  placeholder: 'your@email.com'
};

export const LOADING_MESSAGES = [
  'Analyzing your responses...',
  'Reviewing your symptom patterns...',
  'Preparing your personalized assessment...'
];

export const RESULT_HEADLINES = {
  high: 'Your symptoms show strong neuroplastic patterns.',
  moderate: 'Your symptoms show some neuroplastic patterns.',
  low: 'Your symptoms may have a structural component.',
  unclear: 'We need more information to assess your situation.'
};

export const RESULT_SUBHEADLINES = {
  high: 'Based on the FIT criteria, your symptoms are highly likely to be driven by your nervous system.',
  moderate: 'Based on the FIT criteria, your symptoms show characteristics of nervous system involvement.',
  low: 'Based on your answers, structural factors may be playing a significant role.',
  unclear: 'Please consult with a healthcare provider for a proper evaluation.'
};

export const DISCLAIMER = 'This assessment is for educational purposes only and is not a medical diagnosis. Please consult with a healthcare provider for proper evaluation and treatment.';

export const LIKELIHOOD_BADGES = {
  high: { text: 'Likely Nervous System', color: '#059669', bgColor: '#D1FAE5' },
  moderate: { text: 'Likely Nervous System', color: '#059669', bgColor: '#D1FAE5' },
  low: { text: 'May Have Structural Component', color: '#D97706', bgColor: '#FEF3C7' },
  unclear: { text: 'More Information Needed', color: '#6B7280', bgColor: '#F3F4F6' }
};

export const EDUCATIONAL_CONTENT = {
  whatAreNeuroplasticSymptoms: {
    title: 'What are neuroplastic symptoms?',
    content: 'When your nervous system becomes sensitized, it can generate real physical symptoms — pain, fatigue, digestive issues, and more — even without structural damage. These are sometimes called mind-body symptoms, neuroplastic pain, or central sensitization. The symptoms are 100% real, but their source is a learned pattern in the nervous system rather than ongoing tissue damage.'
  },
  whyDoesThisHappen: {
    title: 'Why does this happen?',
    content: 'Your brain and nervous system are constantly evaluating danger. When they become overly protective — often due to stress, trauma, or an injury that has since healed — they can keep sending pain and symptom signals even when there\'s no actual threat. It\'s like a car alarm that goes off too easily. This isn\'t a character flaw or weakness; it\'s a protective mechanism that got stuck in overdrive.'
  },
  howDoPeopleHeal: {
    title: 'How do people heal?',
    content: 'Research shows that neuroplastic symptoms can improve significantly through mind-body approaches that help retrain the nervous system. A landmark 2021 study in JAMA Psychiatry found that 66% of chronic back pain patients were pain-free or nearly pain-free after a mind-body treatment, compared to just 20% in the control group. The key is understanding that the brain can learn new patterns — and unlearn old ones.'
  },
  resources: {
    title: 'Learn more',
    links: [
      {
        text: 'How Chronic Pain & Illness Develop',
        url: 'https://www.youtube.com/watch?v=Nv-Ol3l4QX4',
        description: 'Understanding the nervous system\'s role in chronic symptoms',
        thumbnail: 'https://img.youtube.com/vi/Nv-Ol3l4QX4/mqdefault.jpg',
        type: 'video'
      },
      {
        text: 'Lorimer Moseley TEDx Talk',
        url: 'https://www.youtube.com/watch?v=gwd-wLdIHjs',
        description: 'Why things hurt — pain science explained',
        thumbnail: 'https://img.youtube.com/vi/gwd-wLdIHjs/mqdefault.jpg',
        type: 'video'
      },
      {
        text: 'Boulder Back Pain Study (JAMA, 2021)',
        url: 'https://jamanetwork.com/journals/jamapsychiatry/fullarticle/2784694',
        description: 'Landmark research showing 66% pain-free after mind-body treatment',
        type: 'article'
      },
      {
        text: 'Curable Health Blog',
        url: 'https://www.curablehealth.com/blog',
        description: 'Articles on neuroplastic symptoms and recovery',
        type: 'article'
      }
    ]
  }
};
