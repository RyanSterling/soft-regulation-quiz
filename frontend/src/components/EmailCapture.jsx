import { useState } from 'react';
import { EMAIL_FIELD } from '../data/ctaContent';

// Disposable email domains to block
const BLOCKED_DOMAINS = [
  'mailinator.com', 'tempmail.com', 'throwaway.email', 'guerrillamail.com',
  'sharklasers.com', 'grr.la', 'guerrillamail.info', 'guerrillamail.biz',
  'guerrillamail.de', 'guerrillamail.net', 'guerrillamail.org', 'spam4.me',
  'fakeinbox.com', 'tempinbox.com', 'dispostable.com', 'yopmail.com',
  'trashmail.com', 'mailnesia.com', 'getnada.com', 'temp-mail.org',
  '10minutemail.com', 'minutemail.com', 'emailondeck.com', 'mohmal.com',
  'tempmailo.com', 'tempr.email', 'discard.email', 'discardmail.com',
  'throwawaymail.com', 'maildrop.cc', 'mailsac.com', 'inboxkitten.com'
];

// Suspicious patterns in local part (before @)
const BLOCKED_PATTERNS = [
  /^(test|fake|spam|trash|junk|asdf|qwerty|aaaa+|xxxx+)$/i,
  /^.{1,2}$/, // Too short (1-2 chars)
  /(poo|poop|shit|fuck|ass|penis|vagina|dick|cock|cunt)/i, // Profanity
  /^(admin|root|administrator|null|undefined|nobody)@/i,
  /^[0-9]+$/, // Numbers only
  /(.)\1{4,}/, // Same character repeated 5+ times
];

export default function EmailCapture({ value, onChange, onSubmit, onBack, isSubmitting }) {
  const [error, setError] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const validateEmail = (email) => {
    // Basic format check
    const basicFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicFormat.test(email)) {
      return { valid: false, reason: 'Please enter a valid email address' };
    }

    const [localPart, domain] = email.toLowerCase().split('@');

    // Check blocked domains
    if (BLOCKED_DOMAINS.includes(domain)) {
      return { valid: false, reason: 'Please use a permanent email address' };
    }

    // Check blocked patterns in local part
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(localPart)) {
        return { valid: false, reason: 'Please enter a valid email address' };
      }
    }

    // Check for valid TLD (at least 2 chars)
    const tld = domain.split('.').pop();
    if (!tld || tld.length < 2) {
      return { valid: false, reason: 'Please enter a valid email address' };
    }

    return { valid: true };
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!value || !value.trim()) {
      setError('Email is required');
      return;
    }

    const validation = validateEmail(value);
    if (!validation.valid) {
      setError(validation.reason);
      return;
    }

    if (!privacyConsent) {
      setError('Please agree to the Privacy Policy to continue');
      return;
    }

    setError('');
    onSubmit();
  };

  const handleChange = (newValue) => {
    setError('');
    onChange(newValue);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#EFEDEC' }}>
      <div className="flex-1 pt-20 pb-8 px-4">
        <div className="max-w-3xl mx-auto flex flex-col h-full">
          <form onSubmit={handleSubmit}>
          {/* Question Text */}
          <div className="space-y-4 mb-auto">
            <h2 style={{
              fontFamily: 'Libre Baskerville, serif',
              fontSize: '1.875rem',
              color: '#1E1F1C',
              lineHeight: '1.3',
              fontWeight: '400'
            }}>
              {EMAIL_FIELD.label}
            </h2>

            {/* Email Input */}
            <div className="space-y-2">
              <input
                type="email"
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={EMAIL_FIELD.placeholder}
                disabled={isSubmitting}
                className="w-full px-4 py-3 transition-colors"
                style={{
                  backgroundColor: '#E6E4E1',
                  borderRadius: '12px',
                  border: error ? '2px solid #DC2626' : 'none',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1rem',
                  color: '#1E1F1C',
                  outline: 'none'
                }}
              />
              {error && (
                <p className="text-sm" style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#DC2626'
                }}>
                  {error}
                </p>
              )}
            </div>

            <p className="text-sm" style={{
              fontFamily: 'Inter, sans-serif',
              color: '#77716E'
            }}>
              You'll see your results on the next screen. We'll send follow-up education and resources to this email.
            </p>

            {/* Privacy Consent Checkbox */}
            <div className="flex items-start gap-3 mt-6">
              <input
                type="checkbox"
                id="privacy-consent"
                checked={privacyConsent}
                onChange={(e) => {
                  setPrivacyConsent(e.target.checked);
                  setError('');
                }}
                disabled={isSubmitting}
                className="mt-1 cursor-pointer"
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#4D1E22'
                }}
              />
              <label
                htmlFor="privacy-consent"
                className="text-sm cursor-pointer"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#6D6B6B',
                  lineHeight: '1.5'
                }}
              >
                I agree to the{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#4D1E22',
                    textDecoration: 'underline'
                  }}
                >
                  Privacy Policy
                </a>
                {' '}and consent to my data being processed to provide quiz results.
              </label>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="font-medium transition-colors disabled:opacity-50"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#77716E'
              }}
            >
              ← Back
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#4D1E22',
                color: 'white',
                borderRadius: '27px',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {isSubmitting ? 'Processing...' : 'Get My Results'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
