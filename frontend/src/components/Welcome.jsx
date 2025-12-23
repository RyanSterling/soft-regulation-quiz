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
      </div>
    </div>
  );
}
