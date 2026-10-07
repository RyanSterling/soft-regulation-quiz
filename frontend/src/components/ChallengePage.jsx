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
          <img
            src="/maggie-cutout-2025.png"
            alt="Maggie Sterling"
            className="mx-auto mb-8"
            style={{
              maxWidth: '196px',
              width: '100%',
              height: 'auto',
            }}
          />
          <h1
            className="mb-4"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: '500',
              fontSize: 'clamp(2rem, 5vw, 2.75rem)',
              color: colors.black,
              lineHeight: '1.2',
              letterSpacing: '-0.02em',
            }}
          >
            Let Life Be the Regulator
          </h1>
          <p
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              fontSize: '1.25rem',
              color: colors.olive,
            }}
          >
            A 14-day challenge with Maggie Sterling
          </p>
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
            Your nervous system learns from what you do. It learns from the way you fill your time and what you fill your mind with.
          </p>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: colors.muted,
              fontSize: '1.0625rem',
              lineHeight: '1.85',
            }}
          >
            For 14 days, we're going to introduce things that pull you more into your life and more away from your symptoms. Even *especially* when you feel bad.
          </p>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: colors.muted,
              fontSize: '1.0625rem',
              lineHeight: '1.85',
            }}
          >
            This works at any capacity. If you're in bed most of the day, your version will look different, but it isn't wrong. This challenge is meant to meet you where you're at.
          </p>
        </div>

        {/* What's Included */}
        <div
          className="mb-10 p-6"
          style={{ backgroundColor: colors.creamDark, borderRadius: '4px' }}
        >
          <p
            className="mb-4"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: '500',
              fontSize: '1.25rem',
              color: colors.black,
            }}
          >
            What you get
          </p>
          <ul className="space-y-3">
            {[
              '4 live calls with Maggie (twice a week)',
              'Private community to interact with other participants',
              'Accountability + exclusive content',
              '30 days of replay access',
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: colors.muted,
                  fontSize: '1rem',
                }}
              >
                <svg
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
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
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <a
          href="https://let-life-be-the-regulator.circle.so/checkout/let-life-be-the-regulator-14-day-challenge"
          className="block w-full py-4 text-center transition-opacity hover:opacity-90"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: '500',
            fontSize: '1rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            backgroundColor: colors.olive,
            color: colors.white,
            textDecoration: 'none',
          }}
        >
          Join the Challenge — $33
        </a>

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
