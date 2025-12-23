export default function WaitlistModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Success icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
            <svg className="w-8 h-8" style={{ color: '#4D1E22' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <h3 className="text-2xl mb-3" style={{
            fontFamily: 'Libre Baskerville, serif',
            fontWeight: 'bold',
            color: '#101827',
            letterSpacing: '-0.02em'
          }}>
            You're on the waitlist!
          </h3>
          <p className="mb-6" style={{
            fontFamily: 'Inter, sans-serif',
            color: '#6D6B6B',
            fontSize: '1rem',
            letterSpacing: '-0.01em'
          }}>
            Check your email for next steps and resources to get started.
          </p>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-lg font-semibold transition-all hover:opacity-90"
            style={{
              backgroundColor: '#4D1E22',
              color: 'white',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
