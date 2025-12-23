import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for database operations

/**
 * Save a completed quiz response to the database
 */
export async function saveResponse(responseData) {
  try {
    const { data, error } = await supabase
      .from('responses')
      .insert([responseData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving response:', error);
    return { data: null, error };
  }
}

/**
 * Update waitlist opt-in status for a response
 */
export async function updateWaitlistStatus(responseId, optedIn = true) {
  try {
    const { data, error } = await supabase
      .from('responses')
      .update({ waitlist_opted_in: optedIn })
      .eq('id', responseId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating waitlist status:', error);
    return { data: null, error };
  }
}

/**
 * Track when a user starts the quiz (for abandonment analysis)
 */
export async function trackQuizStart(sessionId, utmParams = {}) {
  try {
    const { data, error } = await supabase
      .from('quiz_starts')
      .insert([{
        session_id: sessionId,
        utm_source: utmParams.utm_source || null,
        utm_campaign: utmParams.utm_campaign || null
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error tracking quiz start:', error);
    return { data: null, error };
  }
}

/**
 * Mark a quiz as completed (when response is saved)
 */
export async function markQuizCompleted(sessionId, responseId) {
  try {
    const { data, error } = await supabase
      .from('quiz_starts')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        response_id: responseId
      })
      .eq('session_id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error marking quiz completed:', error);
    return { data: null, error };
  }
}

/**
 * Get CTA configuration from settings
 */
export async function getCtaConfig() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'cta_config')
      .single();

    if (error) throw error;
    return { data: data?.value || null, error: null };
  } catch (error) {
    console.error('Error fetching CTA config:', error);
    return { data: null, error };
  }
}

/**
 * Update CTA configuration in settings
 */
export async function updateCtaConfig(config) {
  try {
    const { data, error } = await supabase
      .from('settings')
      .update({
        value: config,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'cta_config')
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating CTA config:', error);
    return { data: null, error };
  }
}

/**
 * Get all responses (for admin dashboard)
 */
export async function getAllResponses(filters = {}) {
  try {
    let query = supabase
      .from('responses')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters if provided
    if (filters.result) {
      query = query.eq('result', filters.result);
    }
    if (filters.has_chronic_pain !== undefined) {
      query = query.eq('has_chronic_pain', filters.has_chronic_pain);
    }
    if (filters.medical_clearance) {
      query = query.eq('medical_clearance', filters.medical_clearance);
    }
    if (filters.cta_type) {
      query = query.eq('cta_type', filters.cta_type);
    }
    if (filters.waitlist_opted_in !== undefined) {
      query = query.eq('waitlist_opted_in', filters.waitlist_opted_in);
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

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching responses:', error);
    return { data: null, error };
  }
}

/**
 * Get analytics summary (for admin dashboard)
 */
export async function getAnalyticsSummary(startDate, endDate) {
  try {
    let query = supabase
      .from('analytics_summary')
      .select('*')
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return { data: null, error };
  }
}

/**
 * Check rate limit for email (max 3 per day)
 */
export async function checkEmailRateLimit(email) {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const { data, error } = await supabase
      .from('responses')
      .select('id')
      .eq('email', email)
      .gte('created_at', oneDayAgo.toISOString());

    if (error) throw error;

    const count = data?.length || 0;
    return { allowed: count < 3, count, error: null };
  } catch (error) {
    console.error('Error checking email rate limit:', error);
    return { allowed: true, count: 0, error }; // Allow on error to not block legitimate users
  }
}
