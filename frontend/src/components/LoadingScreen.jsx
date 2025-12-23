import { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  "Analyzing your nervous system patterns...",
  "Identifying your unique triggers...",
  "Mapping your body's response system...",
  "Connecting the dots between your answers...",
  "Crafting your personalized insights...",
  "Almost there..."
];

export default function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#EFEDEC' }}>
      <div className="max-w-md mx-auto px-4 text-center">
        {/* Spinner */}
        <div className="mb-8 flex justify-center">
          <div
            className="animate-spin rounded-full border-4 border-solid"
            style={{
              width: '48px',
              height: '48px',
              borderColor: '#E6E4E1',
              borderTopColor: '#4D1E22'
            }}
          />
        </div>

        {/* Rotating message */}
        <p
          className="text-xl transition-opacity duration-500"
          style={{
            fontFamily: 'Inter, sans-serif',
            color: '#77716E'
          }}
        >
          {LOADING_MESSAGES[messageIndex]}
        </p>
      </div>
    </div>
  );
}
