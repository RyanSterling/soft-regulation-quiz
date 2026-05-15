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
        utm_campaign: utmParams.utm_campaign || null,
        utm_content: utmParams.utm_content || null,
        utm_term: utmParams.utm_term || null,
        deployment_source: import.meta.env.VITE_DEPLOYMENT_SOURCE || 'organic'
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
      .select('*', { count: 'exact' })
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
    if (filters.deployment_source) {
      query = query.eq('deployment_source', filters.deployment_source);
    }

    // First, get the count to know how many rows we need to fetch
    const { count } = await query;

    // If count is greater than 1000, we need to paginate
    // Otherwise, just fetch all at once with a reasonable limit
    let allData = [];
    const pageSize = 1000;

    if (count > 1000) {
      // Fetch in batches
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        let batchQuery = supabase
          .from('responses')
          .select('*')
          .order('created_at', { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        // Re-apply all filters to each batch
        if (filters.result) batchQuery = batchQuery.eq('result', filters.result);
        if (filters.has_chronic_pain !== undefined) batchQuery = batchQuery.eq('has_chronic_pain', filters.has_chronic_pain);
        if (filters.medical_clearance) batchQuery = batchQuery.eq('medical_clearance', filters.medical_clearance);
        if (filters.cta_type) batchQuery = batchQuery.eq('cta_type', filters.cta_type);
        if (filters.waitlist_opted_in !== undefined) batchQuery = batchQuery.eq('waitlist_opted_in', filters.waitlist_opted_in);
        if (filters.email) batchQuery = batchQuery.ilike('email', `%${filters.email}%`);
        if (filters.startDate) batchQuery = batchQuery.gte('created_at', filters.startDate);
        if (filters.endDate) batchQuery = batchQuery.lte('created_at', filters.endDate);
        if (filters.deployment_source) batchQuery = batchQuery.eq('deployment_source', filters.deployment_source);

        const { data: batchData, error: batchError } = await batchQuery;

        if (batchError) throw batchError;

        if (batchData && batchData.length > 0) {
          allData = [...allData, ...batchData];
          page++;
          hasMore = batchData.length === pageSize;
        } else {
          hasMore = false;
        }
      }
    } else {
      // For datasets under 1000, just fetch with a high limit
      const { data, error } = await query.limit(count || 10000);
      if (error) throw error;
      allData = data || [];
    }

    return { data: allData, error: null };
  } catch (error) {
    console.error('Error fetching responses:', error);
    return { data: null, error };
  }
}

/**
 * Get paginated responses (for admin dashboard with pagination)
 */
export async function getResponsesPaginated(filters = {}, page = 0, pageSize = 50) {
  try {
    let query = supabase
      .from('responses')
      .select('*', { count: 'exact' })
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
    if (filters.deployment_source) {
      query = query.eq('deployment_source', filters.deployment_source);
    }

    // Apply pagination
    query = query.range(page * pageSize, (page + 1) * pageSize - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
      error: null
    };
  } catch (error) {
    console.error('Error fetching paginated responses:', error);
    return { data: [], count: 0, totalPages: 0, error };
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

/**
 * Save a root cause quiz response to the database
 */
export async function saveRootCauseResponse(responseData) {
  try {
    const { data, error } = await supabase
      .from('rootcause_responses')
      .insert([{
        email: responseData.email,
        answers: responseData.answers,
        ai_assessment: responseData.ai_assessment,
        free_text_response: responseData.free_text_response,
        utm_source: responseData.utm_source,
        utm_campaign: responseData.utm_campaign
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving root cause response:', error);
    return { data: null, error };
  }
}

// =============================================
// EVENTS & RSVP FUNCTIONS
// =============================================

/**
 * Get the next upcoming active event
 */
export async function getActiveEvent() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return { data: data || null, error: null };
  } catch (error) {
    console.error('Error fetching active event:', error);
    return { data: null, error };
  }
}

/**
 * Get all events (for admin)
 */
export async function getAllEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { data: [], error };
  }
}

/**
 * Create a new event
 */
export async function createEvent(eventData) {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating event:', error);
    return { data: null, error };
  }
}

/**
 * Update an event
 */
export async function updateEvent(eventId, updates) {
  try {
    const { data, error } = await supabase
      .from('events')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating event:', error);
    return { data: null, error };
  }
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId) {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { error };
  }
}

/**
 * Save an RSVP
 */
export async function saveRSVP(rsvpData) {
  try {
    const { data, error } = await supabase
      .from('rsvps')
      .insert([rsvpData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving RSVP:', error);
    return { data: null, error };
  }
}

/**
 * Get RSVPs for an event
 */
export async function getRSVPsForEvent(eventId) {
  try {
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    return { data: [], error };
  }
}

/**
 * Get RSVP count for an event
 */
export async function getRSVPCount(eventId) {
  try {
    const { count, error } = await supabase
      .from('rsvps')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    if (error) throw error;
    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Error fetching RSVP count:', error);
    return { count: 0, error };
  }
}

/**
 * Get all RSVPs with event info (for admin)
 */
export async function getAllRSVPs() {
  try {
    const { data, error } = await supabase
      .from('rsvps')
      .select(`
        *,
        events (
          title,
          event_date
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching all RSVPs:', error);
    return { data: [], error };
  }
}

/**
 * Delete an RSVP
 */
export async function deleteRSVP(rsvpId) {
  try {
    const { error } = await supabase
      .from('rsvps')
      .delete()
      .eq('id', rsvpId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting RSVP:', error);
    return { error };
  }
}
