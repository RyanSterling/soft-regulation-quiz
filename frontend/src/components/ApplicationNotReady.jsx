import { NOT_READY_CONTENT } from '../data/applicationContent';

// Match ApplicationLanding color palette
const colors = {
  cream: '#FAF9F7',
  creamDark: '#E8E6E3',
  white: '#FFFFFF',
  black: '#1E1F1C',
  olive: '#545B47',
  muted: '#6D6B6B',
};

export default function ApplicationNotReady() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.cream }}>
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="mb-12 flex justify-center">
          <img src="/assets/logo.svg" alt="Soft Regulation" className="h-16 md:h-20" />
        </div>

        <h1
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontWeight: '500',
            color: colors.black,
            letterSpacing: '-0.02em',
            fontSize: '2rem',
            lineHeight: '1.3'
          }}
          className="md:text-4xl"
        >
          {NOT_READY_CONTENT.headline}
        </h1>

        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            color: colors.muted,
            fontSize: '1.125rem',
            lineHeight: '1.75'
          }}
          className="md:text-xl"
        >
          {NOT_READY_CONTENT.body}
        </p>

        <div className="pt-8">
          <a
            href={NOT_READY_CONTENT.ctaUrl}
            className="inline-block px-10 py-4 text-lg font-medium transition-all duration-200 hover:opacity-90"
            style={{
              backgroundColor: colors.olive,
              color: colors.white,
              fontFamily: 'Inter, sans-serif',
              textDecoration: 'none'
            }}
          >
            {NOT_READY_CONTENT.ctaText}
          </a>
        </div>
      </div>
    </div>
  );
}
