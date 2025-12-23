import { useState } from 'react';
import { EMAIL_FIELD } from '../data/ctaContent';

export default function EmailCapture({ value, onChange, onSubmit, onBack, isSubmitting }) {
  const [error, setError] = useState('');

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
              We'll send your personalized results and follow-up tips to this email.
            </p>
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
