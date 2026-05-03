import { supabase } from './supabase';

/**
 * Default scoring configuration
 * Used as fallback if database config is not available
 */
export const DEFAULT_CONFIG = {
  question_scores: {
    q1: [0, 1, 2, 3],
    q2: [0, 1, 2, 3],
    q3: [0, 1, 2, 3],
    q4: [0, 1, 2, 3],
    q5: [0, 1, 2, 3],
    q6: [0, 1, 2, 3],
    q7: [0, 1, 2, 4], // Q7 bottom option gets +1 bonus
    q8: [0, 1, 2, 3],
    q9: [0, 1, 2, 3],
    q10: [0, 1, 2, 3],
    q11: [0, 0, 1, 3, 3] // Q11 has 5 options
  },
  thresholds: {
    pass_max: 10,
    review_max: 19
  },
  auto_fail_options: {
    q11: [3, 4], // Options 4 and 5 (indices 3, 4) trigger auto-fail
    q13: ['mostly_sure', 'unsure', 'no'] // Anything except 'yes_certain' is auto-fail
  }
};

/**
 * Get coaching scoring configuration from Supabase
 * Falls back to DEFAULT_CONFIG if not available
 */
export async function getCoachingScoringConfig() {
  try {
    const { data, error } = await supabase
      .from('cohort_scoring_config')
      .select('config_key, config_value');

    if (error) {
      console.error('Error fetching coaching config:', error);
      return DEFAULT_CONFIG;
    }

    if (!data || data.length === 0) {
      console.warn('No coaching config found, using defaults');
      return DEFAULT_CONFIG;
    }

    // Convert array of {config_key, config_value} to config object
    const config = {};
    data.forEach(row => {
      config[row.config_key] = row.config_value;
    });

    // Merge with defaults to ensure all keys exist
    return {
      question_scores: config.question_scores || DEFAULT_CONFIG.question_scores,
      thresholds: config.thresholds || DEFAULT_CONFIG.thresholds,
      auto_fail_options: config.auto_fail_options || DEFAULT_CONFIG.auto_fail_options
    };
  } catch (error) {
    console.error('Error fetching coaching config:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Update a specific config value in Supabase
 * @param {string} configKey - The config key to update (question_scores, thresholds, auto_fail_options)
 * @param {object} configValue - The new value
 * @param {string} updatedBy - Optional identifier for who made the change
 */
export async function updateCoachingScoringConfig(configKey, configValue, updatedBy = null) {
  try {
    const { data, error } = await supabase
      .from('cohort_scoring_config')
      .upsert({
        config_key: configKey,
        config_value: configValue,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy
      }, {
        onConflict: 'config_key'
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating coaching config:', error);
    return { data: null, error };
  }
}

/**
 * Update all config values at once
 * @param {object} config - The full config object
 * @param {string} updatedBy - Optional identifier for who made the change
 */
export async function updateFullCoachingConfig(config, updatedBy = null) {
  try {
    const updates = [
      { config_key: 'question_scores', config_value: config.question_scores },
      { config_key: 'thresholds', config_value: config.thresholds },
      { config_key: 'auto_fail_options', config_value: config.auto_fail_options }
    ].map(item => ({
      ...item,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy
    }));

    const { data, error } = await supabase
      .from('cohort_scoring_config')
      .upsert(updates, {
        onConflict: 'config_key'
      })
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating full coaching config:', error);
    return { data: null, error };
  }
}

/**
 * Save a coaching quiz response to the database
 */
export async function saveCoachingResponse(responseData) {
  try {
    const { data, error } = await supabase
      .from('cohort_responses')
      .insert([{
        email: responseData.email,
        outcome: responseData.outcome,
        score: responseData.score,
        fail_reason: responseData.fail_reason || null,
        answers: responseData.answers,
        free_text: responseData.free_text,
        utm_source: responseData.utm_source || null,
        utm_campaign: responseData.utm_campaign || null,
        utm_content: responseData.utm_content || null,
        utm_term: responseData.utm_term || null
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving coaching response:', error);
    return { data: null, error };
  }
}

/**
 * Get all coaching responses (for admin dashboard)
 * @param {object} filters - Optional filters
 * @param {number} limit - Max number of responses to fetch
 */
export async function getCoachingResponses(filters = {}, limit = 100) {
  try {
    let query = supabase
      .from('cohort_responses')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (filters.outcome) {
      query = query.eq('outcome', filters.outcome);
    }
    if (filters.email) {
      query = query.ilike('email', `%${filters.email}%`);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, count, error } = await query;

    if (error) throw error;
    return { data: data || [], count: count || 0, error: null };
  } catch (error) {
    console.error('Error fetching coaching responses:', error);
    return { data: [], count: 0, error };
  }
}

/**
 * Get coaching analytics summary
 */
export async function getCoachingAnalytics() {
  try {
    const { data, error } = await supabase
      .from('cohort_responses')
      .select('outcome, created_at');

    if (error) throw error;

    // Calculate totals
    const totals = {
      total: data?.length || 0,
      pass: 0,
      review: 0,
      fail: 0
    };

    data?.forEach(row => {
      if (row.outcome === 'PASS') totals.pass++;
      else if (row.outcome === 'REVIEW') totals.review++;
      else if (row.outcome === 'FAIL') totals.fail++;
    });

    return { data: totals, error: null };
  } catch (error) {
    console.error('Error fetching coaching analytics:', error);
    return { data: null, error };
  }
}
