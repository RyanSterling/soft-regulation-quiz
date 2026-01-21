import { useState } from 'react';
import { EMAIL_FIELD } from '../data/ctaContent';

export default function EmailCapture({ value, onChange, onSubmit, onBack, isSubmitting }) {
  const [error, setError] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = () => {
    if (!value || !value.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(value)) {
      setError('Please enter a valid email address');
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
              onClick={handleSubmit}
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
        </div>
      </div>
    </div>
  );
}
