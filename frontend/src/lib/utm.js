/**
 * UTM Parameter Handling
 * Extracts and manages UTM tracking parameters
 */

/**
 * Extract UTM parameters from URL
 * We only track utm_source and utm_campaign (keeping it simple)
 */
export function extractUtmParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get('utm_source') || null,
    utm_campaign: params.get('utm_campaign') || null
  };
}

/**
 * Store UTM parameters in sessionStorage
 * This ensures they persist even if the user refreshes the page during the quiz
 */
export function storeUtmParams(utmParams) {
  if (utmParams.utm_source || utmParams.utm_campaign) {
    sessionStorage.setItem('quiz_utm_params', JSON.stringify(utmParams));
  }
}

/**
 * Retrieve stored UTM parameters from sessionStorage
 */
export function getStoredUtmParams() {
  const stored = sessionStorage.getItem('quiz_utm_params');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing stored UTM params:', error);
      return { utm_source: null, utm_campaign: null };
    }
  }
  return { utm_source: null, utm_campaign: null };
}

/**
 * Clear stored UTM parameters (after quiz completion)
 */
export function clearStoredUtmParams() {
  sessionStorage.removeItem('quiz_utm_params');
}

/**
 * Get UTM parameters (from URL or storage)
 * Priority: URL params > stored params > null
 */
export function getUtmParams() {
  const urlParams = extractUtmParams();

  // If URL has UTM params, use and store them
  if (urlParams.utm_source || urlParams.utm_campaign) {
    storeUtmParams(urlParams);
    return urlParams;
  }

  // Otherwise, try to get stored params
  return getStoredUtmParams();
}
