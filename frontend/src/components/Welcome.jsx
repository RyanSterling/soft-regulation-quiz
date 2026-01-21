import { WELCOME_CONTENT } from '../data/ctaContent';

export default function Welcome({ onStart }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#EFEDEC' }}>
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="mb-12 flex justify-center">
          <img
            src="/assets/logo.svg"
            alt="Soft Regulation"
            className="h-16 md:h-20"
          />
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'Libre Baskerville, serif',
          fontWeight: '400',
          color: '#101827',
          letterSpacing: '-0.02em',
          fontSize: '2.5rem',
          lineHeight: '1.2'
        }} className="md:text-5xl">
          {WELCOME_CONTENT.title}
        </h1>

        {/* Subhead */}
        <p style={{
          fontFamily: 'Inter, sans-serif',
          color: '#77716E',
          fontSize: '1.125rem',
          lineHeight: '1.75'
        }} className="md:text-xl">
          {WELCOME_CONTENT.subhead}
        </p>

        {/* Button */}
        <div className="pt-8">
          <button
            onClick={onStart}
            className="px-10 py-4 text-lg font-medium transition-all duration-200 hover:opacity-90"
            style={{
              backgroundColor: '#4D1E22',
              color: '#FFFFFF',
              borderRadius: '27px',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            {WELCOME_CONTENT.buttonText}
          </button>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-6 px-4">
          <p style={{
            fontFamily: 'Inter, sans-serif',
            color: '#77716E',
            fontSize: '0.875rem',
            lineHeight: '1.5'
          }}>
            By taking this quiz, you agree to our{' '}
            <a
              href="https://www.maggiesterling.com/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
              style={{ color: '#77716E' }}
            >
              Terms of Service
            </a>
            {' '}and{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
              style={{ color: '#77716E' }}
            >
              Privacy Policy
            </a>
            . This quiz provides educational information only and is not medical or psychological treatment.
          </p>
        </div>
      </div>
    </div>
  );
}
