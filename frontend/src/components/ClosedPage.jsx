import { useEffect } from 'react';
import { getUtmParams } from '../lib/utm';

const colors = {
  cream: '#FAF8F5',
  creamDark: '#F0EDE8',
  olive: '#9C8B75',
  oliveMuted: 'rgba(156, 139, 117, 0.15)',
  black: '#1A1A1A',
  muted: '#6B6B6B',
  white: '#FFFFFF',
};

export default function ClosedPage() {
  useEffect(() => {
    // Preserve UTM params for downstream tracking
    getUtmParams();
  }, []);

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
            Enrollment Has Ended
          </h1>
          <p
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              fontSize: '1.25rem',
              color: colors.olive,
            }}
          >
            The 14-day challenge is now closed
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
              textAlign: 'center',
            }}
          >
            You missed this round, but there are still ways to work with me.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Course CTA */}
          <a
            href="https://www.maggiesterling.com/soft-regulation"
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
            Explore the Soft Regulation Course
          </a>

          {/* Quiz CTA */}
          <a
            href="/"
            className="block w-full py-4 text-center transition-opacity hover:opacity-90"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              fontSize: '1rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              backgroundColor: 'transparent',
              color: colors.olive,
              textDecoration: 'none',
              border: `2px solid ${colors.olive}`,
            }}
          >
            Take the Free Quiz
          </a>
        </div>

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
