import { useState, useEffect } from 'react';
import { getUtmParams } from '../lib/utm';
import { sendChallengeWebhook } from '../lib/api';

// Design system matching the site
const colors = {
  cream: '#FAF8F5',
  creamDark: '#F0EDE8',
  olive: '#9C8B75',
  oliveMuted: 'rgba(156, 139, 117, 0.15)',
  black: '#1A1A1A',
  muted: '#6B6B6B',
  white: '#FFFFFF',
  error: '#DC2626',
};

export default function ChallengePage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [utmParams, setUtmParams] = useState({});

  useEffect(() => {
    setUtmParams(getUtmParams());
  }, []);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);

    try {
      const result = await sendChallengeWebhook({
        email: email.trim(),
        source: '14-day-challenge-waitlist',
        utmSource: utmParams.utm_source,
        utmCampaign: utmParams.utm_campaign,
        utmContent: utmParams.utm_content,
        utmTerm: utmParams.utm_term,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: colors.cream }}
      >
        <div className="max-w-lg text-center">
          <div
            className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full"
            style={{ backgroundColor: colors.oliveMuted }}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke={colors.olive}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1
            className="mb-6"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: '500',
              fontSize: 'clamp(2rem, 5vw, 2.75rem)',
              color: colors.black,
              lineHeight: '1.2',
            }}
          >
            You're on the list
          </h1>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: colors.muted,
              fontSize: '1.0625rem',
              lineHeight: '1.8',
            }}
          >
            I'll email you as soon as the details are ready.
          </p>
          <p
            className="mt-8"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              color: colors.olive,
              fontSize: '1.125rem',
            }}
          >
            xo Maggie
          </p>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.cream }}>
      <div className="max-w-2xl mx-auto px-6 py-16 lg:py-24">
        {/* Header */}
        <div className="text-center mb-10">
          <p
            className="mb-4"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              fontSize: '1.25rem',
              color: colors.olive,
            }}
          >
            coming soon
          </p>
          <h1
            className="mb-8"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: '500',
              fontSize: 'clamp(2rem, 5vw, 2.75rem)',
              color: colors.black,
              lineHeight: '1.2',
              letterSpacing: '-0.02em',
            }}
          >
            Let Life Be the Regulator: A 14-Day Challenge
          </h1>
        </div>

        {/* Body Copy */}
        <div className="mb-10 space-y-6">
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: colors.muted,
              fontSize: '1.0625rem',
              lineHeight: '1.85',
            }}
          >
            For 14 days, we're going to practice one of the biggest things I teach, which is letting life be the regulator. Your nervous system learns from what you do, so we're going to work on filling your days with things that pull your attention toward your life, even while you still feel bad.
          </p>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: colors.muted,
              fontSize: '1.0625rem',
              lineHeight: '1.85',
            }}
          >
            We'll do this together as a community, and I'll be there with you through the whole thing. It's going to be low cost, and I'll share the price once it's set. I'm still working out the rest of the details. Join the waitlist and you'll be the first to know when everything is ready.
          </p>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: colors.muted,
              fontSize: '1.0625rem',
              lineHeight: '1.85',
            }}
          >
            This works at any level of capacity. If you're in bed most of the day right now, living is going to look different for you, and that's okay. The goal is to find a little joy inside the capacity you already have.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 border focus:outline-none focus:ring-2"
              style={{
                fontFamily: 'Inter, sans-serif',
                borderColor: colors.creamDark,
                backgroundColor: colors.white,
                fontSize: '1rem',
                borderRadius: '0',
              }}
              placeholder="Your email address"
            />
          </div>

          {error && (
            <p
              className="mb-4 text-center"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: colors.error,
                fontSize: '0.9375rem',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              fontSize: '1rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              backgroundColor: colors.olive,
              color: colors.white,
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Joining...' : 'Join the waitlist'}
          </button>
        </form>

        {/* Closing */}
        <p
          className="text-center mt-12"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            color: colors.olive,
            fontSize: '1.125rem',
          }}
        >
          xo Maggie
        </p>
      </div>
    </div>
  );
}
