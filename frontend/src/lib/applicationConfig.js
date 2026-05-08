import { supabase } from './supabase';

/**
 * Save a 1:1 coaching application to the database
 */
export async function saveApplicationResponse(applicationData) {
  try {
    const { data, error } = await supabase
      .from('coaching_applications')
      .insert([{
        name: applicationData.name,
        email: applicationData.email,
        location: applicationData.location || null,
        timezone: applicationData.timezone || null,
        answers: applicationData.answers,
        revenue_range: applicationData.revenue_range,
        utm_source: applicationData.utm_source || null,
        utm_campaign: applicationData.utm_campaign || null,
        utm_content: applicationData.utm_content || null,
        utm_term: applicationData.utm_term || null
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error saving application:', error);
    return { data: null, error };
  }
}

/**
 * Get all coaching applications (for future admin use)
 */
export async function getApplications(filters = {}, limit = 100) {
  try {
    let query = supabase
      .from('coaching_applications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (filters.email) {
      query = query.ilike('email', `%${filters.email}%`);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    if (filters.revenueRange) {
      query = query.eq('revenue_range', filters.revenueRange);
    }

    const { data, count, error } = await query;

    if (error) throw error;
    return { data: data || [], count: count || 0, error: null };
  } catch (error) {
    console.error('Error fetching applications:', error);
    return { data: [], count: 0, error };
  }
}
