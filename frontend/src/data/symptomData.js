/**
 * Symptom Comparison Data
 * Maps each symptom to what the medical system offers vs root cause approach
 */

export const SYMPTOM_COMPARISONS = {
  anxiety: {
    label: 'Anxiety / panic',
    medical: 'SSRIs, benzos, "just breathe"',
    rootCause: 'Resetting the threat threshold'
  },
  back_pain: {
    label: 'Back pain',
    medical: 'Muscle relaxants, PT, injections, surgery consults',
    rootCause: 'Releasing chronic bracing patterns'
  },
  bladder_pain: {
    label: 'Bladder pain / IC',
    medical: 'Elmiron, bladder instillations, diet restrictions',
    rootCause: 'Calming pelvic nervous system sensitization'
  },
  brain_fog: {
    label: 'Brain fog',
    medical: 'Stimulants, "it\'s just stress," thyroid tests',
    rootCause: 'Reducing the nervous system\'s threat load'
  },
  chronic_fatigue: {
    label: 'Chronic fatigue',
    medical: 'Blood work, "pacing," acceptance that this is your life',
    rootCause: 'Restoring capacity by building safety'
  },
  crps: {
    label: 'CRPS',
    medical: 'Nerve blocks, ketamine infusions, pain clinics',
    rootCause: 'Desensitizing the amplified pain response'
  },
  dizziness: {
    label: 'Dizziness / vertigo',
    medical: 'Meclizine, vestibular PT, MRIs',
    rootCause: 'Calming the overactive threat detection'
  },
  fibromyalgia: {
    label: 'Fibromyalgia',
    medical: 'Lyrica, Cymbalta, trigger point injections',
    rootCause: 'Turning down the whole-body pain alarm'
  },
  heart_palpitations: {
    label: 'Heart palpitations',
    medical: 'Beta blockers, cardiac workups, "nothing wrong"',
    rootCause: 'Teaching your system it\'s not under threat'
  },
  ibs: {
    label: 'IBS / digestive issues',
    medical: 'Low FODMAP, antispasmodics, endless food eliminations',
    rootCause: 'Calming gut-brain hypervigilance'
  },
  jaw_pain: {
    label: 'Jaw pain / TMJ',
    medical: 'Night guards, muscle relaxants, dental work',
    rootCause: 'Releasing chronic tension holding'
  },
  long_covid: {
    label: 'Long COVID',
    medical: '"We don\'t know yet," symptom management, waiting',
    rootCause: 'Resetting post-viral sensitization'
  },
  migraines: {
    label: 'Migraines / headaches',
    medical: 'Triptans, Botox, preventatives, trigger avoidance',
    rootCause: 'Lowering overall nervous system activation'
  },
  muscle_tension: {
    label: 'Muscle tension',
    medical: 'Massage, muscle relaxants, "try to relax"',
    rootCause: 'Releasing protective bracing'
  },
  neck_pain: {
    label: 'Neck pain',
    medical: 'PT, injections, cervical MRIs',
    rootCause: 'Unwinding chronic guarding patterns'
  },
  pelvic_pain: {
    label: 'Pelvic pain',
    medical: 'Pelvic floor PT, nerve blocks, exploratory surgery',
    rootCause: 'Calming pelvic sensitization'
  },
  sensitivity: {
    label: 'Sensitivity to light/sound',
    medical: 'Migraine glasses, noise canceling, avoidance',
    rootCause: 'Expanding your window of tolerance'
  },
  sleep_issues: {
    label: 'Sleep issues / insomnia',
    medical: 'Ambien, trazodone, melatonin, sleep hygiene',
    rootCause: 'Teaching your system it\'s safe to rest'
  },
  tingling: {
    label: 'Tingling / numbness',
    medical: 'Nerve conduction tests, MRIs, "we don\'t see anything"',
    rootCause: 'Calming nerve sensitization'
  }
};

/**
 * Get comparison data for selected symptoms
 * @param {Array} symptoms - Array of symptom objects with id property
 * @returns {Array} Array of comparison objects for selected symptoms
 */
export function getSymptomComparisons(symptoms) {
  if (!Array.isArray(symptoms) || symptoms.length === 0) {
    return [];
  }

  return symptoms
    .map(symptom => {
      const id = symptom.id || symptom;
      const comparison = SYMPTOM_COMPARISONS[id];
      if (comparison) {
        return { id, ...comparison };
      }
      return null;
    })
    .filter(Boolean);
}
