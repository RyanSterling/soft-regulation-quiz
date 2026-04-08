/**
 * Traffic Source Detection
 * Detects whether user came from Facebook Ads, organic Facebook, or other sources
 */

const STORAGE_KEY = 'quiz_traffic_source';

/**
 * Detect traffic source from URL params and referrer
 */
export function detectTrafficSource() {
  const params = new URLSearchParams(window.location.search);

  // Check for fbclid (Facebook Ads click ID)
  if (params.get('fbclid')) {
    return 'facebook-ads';
  }

  // Check referrer for Facebook domains
  const referrer = document.referrer.toLowerCase();
  if (referrer.includes('facebook.com') ||
      referrer.includes('fb.com') ||
      referrer.includes('m.facebook.com') ||
      referrer.includes('l.facebook.com') ||
      referrer.includes('lm.facebook.com')) {
    return 'organic-facebook';
  }

  return 'organic';
}

/**
 * Initialize traffic source detection (call once on page load)
 */
export function initTrafficSource() {
  const detected = detectTrafficSource();
  // Only store if not already set (first touch attribution)
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, detected);
  }
  return detected;
}

/**
 * Get traffic source (handles returning ad visitors)
 */
export function getTrafficSource() {
  const fresh = detectTrafficSource();

  // If paid traffic NOW, update storage (last-touch for ads)
  if (fresh === 'facebook-ads') {
    localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  }

  // Otherwise return stored value
  return localStorage.getItem(STORAGE_KEY) || 'organic';
}

/**
 * Clear stored traffic source (optional: after conversion)
 */
export function clearTrafficSource() {
  localStorage.removeItem(STORAGE_KEY);
}
