export default function ScoreVisualization({ scores, result }) {
  if (!scores) return null;

  const { total } = scores;

  // Calculate position on scale (9-36 range maps to 0-100%)
  const minScore = 9;
  const maxScore = 36;
  const position = ((total - minScore) / (maxScore - minScore)) * 100;

  // Sensitization threshold is at 27 out of 36
  // That's 66.67% along the scale from 9 to 36
  const thresholdPosition = ((27 - minScore) / (maxScore - minScore)) * 100;

  // Determine contextual message based on position
  const getMessage = () => {
    if (result === 'sensitized') {
      return "Your nervous system has crossed into sensitization and needs support.";
    } else if (position >= thresholdPosition - 10) {
      return "You're approaching the sensitization threshold. Now is a good time to address these patterns.";
    } else if (position >= 40) {
      return "Your nervous system is showing signs of dysregulation that could benefit from attention.";
    } else {
      return "Your nervous system is showing early warning signs of dysregulation.";
    }
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, paddingBottom: '2rem' }}>
      <div className="bg-white rounded-2xl p-8">
        {/* Scale labels */}
        <div className="flex justify-between items-start mb-3">
          <div className="text-left">
            <div style={{
              fontFamily: 'Inter, sans-serif',
              color: '#101827',
              fontSize: '1.125rem',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase'
            }}>
              DYSREGULATED
            </div>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              color: '#6D6B6B',
              fontSize: '0.8125rem',
              letterSpacing: '-0.01em',
              marginTop: '0.25rem'
            }}>
              Early warning signs
            </div>
          </div>
          <div className="text-right">
            <div style={{
              fontFamily: 'Inter, sans-serif',
              color: '#101827',
              fontSize: '1.125rem',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase'
            }}>
              SENSITIZED
            </div>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              color: '#6D6B6B',
              fontSize: '0.8125rem',
              letterSpacing: '-0.01em',
              marginTop: '0.25rem'
            }}>
              Requires attention
            </div>
          </div>
        </div>

        {/* Gradient bar with position indicator */}
        <div className="relative" style={{ height: '60px', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Left side of gradient bar with triangular notch cutout */}
          <div
            className="absolute"
            style={{
              left: 0,
              width: `${thresholdPosition}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              height: '16px',
              background: 'linear-gradient(to right, #FDE68A 0%, #FCD34D 30%, #FBBF24 50%, #F59E0B 75%, #F97316 100%)',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
              borderTopLeftRadius: '8px',
              borderBottomLeftRadius: '8px',
              clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 0 100%)'
            }}
          />

          {/* Right side of gradient bar with triangular notch cutout */}
          <div
            className="absolute"
            style={{
              left: `${thresholdPosition}%`,
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              height: '16px',
              background: 'linear-gradient(to right, #F97316 0%, #EF4444 50%, #DC2626 100%)',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
              borderTopRightRadius: '8px',
              borderBottomRightRadius: '8px',
              clipPath: 'polygon(6px 0, 100% 0, 100% 100%, 6px 100%, 0 50%)'
            }}
          />

          {/* Threshold label with arrow */}
          <div
            className="absolute"
            style={{
              left: `${thresholdPosition}%`,
              top: '-30px',
              transform: 'translateX(-50%)',
              zIndex: 5,
              textAlign: 'center'
            }}
          >
            {/* Label text */}
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.6875rem',
              color: '#6D6B6B',
              fontWeight: '600',
              letterSpacing: '-0.01em',
              marginBottom: '4px',
              whiteSpace: 'nowrap'
            }}>
              Sensitized
            </div>
            {/* Downward arrow */}
            <div style={{
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '10px solid #D1D5DB',
              margin: '0 auto'
            }} />
          </div>

          {/* Position indicator */}
          <div
            className="absolute transition-all duration-700 ease-out"
            style={{
              left: `${position}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10
            }}
          >
            {/* Indicator circle with shadow */}
            <div
              className="relative"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#101827',
                borderRadius: '50%',
                border: '5px solid white',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
            />
          </div>
        </div>

        {/* Contextual message */}
        <div className="mt-6 pt-6 border-t" style={{ borderColor: '#E6E4E1' }}>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            color: '#6D6B6B',
            fontSize: '1.0625rem',
            letterSpacing: '-0.01em',
            lineHeight: '1.6',
            textAlign: 'center'
          }}>
            {getMessage()}
          </p>
        </div>
      </div>
    </div>
  );
}
