import ScoreVisualization from './ScoreVisualization';

export default function Results({
  result,
  scores,
  aiContent
}) {
  // Fallback content if AI fails
  const fallbackWhatThisMeans = result === 'sensitized'
    ? "Your alarm system has become too touchy. It's going off for things that aren't actually dangerous because you've spent so long in survival mode that your body now interprets almost everything as a threat."
    : "Your nervous system is spending time stuck in survival mode. You're getting locked into fight, flight, or freeze and having a hard time coming back down after stress.";

  const fallbackWhatToDo = "Lowering your baseline requires showing your body new, slower, softer experiences. This takes time and consistency.";

  const fallbackClosingMessage = "I'll be in touch with ongoing support and information to help you along the way. Keep an eye on your inbox.";

  const whatThisMeans = aiContent?.whatThisMeans || fallbackWhatThisMeans;
  const whatToDo = aiContent?.whatToDo || fallbackWhatToDo;
  const closingMessage = aiContent?.closingMessage || fallbackClosingMessage;

  // Helper to render text with paragraph breaks
  const renderTextWithBreaks = (text) => {
    const paragraphs = text.split('\n\n');
    return paragraphs.map((para, index) => (
      <p key={index} className={`leading-relaxed ${index > 0 ? 'mt-4' : ''}`}>
        {para}
      </p>
    ));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EFEDEC' }}>
      <div className="max-w-3xl mx-auto px-4">
        {/* Dark background section - absolute positioned behind card */}
        <div style={{
          backgroundColor: '#4D1E22',
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '170px',
          zIndex: 0
        }} />

        {/* Content with relative positioning */}
        <div style={{ position: 'relative', zIndex: 1, paddingTop: '5rem', paddingBottom: '3rem' }}>
          {/* Result Badge */}
          <div className="bg-white rounded-2xl p-8 text-center">
            <h2 className="mb-1" style={{
              fontFamily: 'Libre Baskerville, serif',
              fontWeight: '400',
              color: '#101827',
              letterSpacing: '-0.02em',
              fontSize: '32px'
            }}>
              Results
            </h2>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              color: '#77716E',
              fontSize: '1.5rem'
            }}>
              {result === 'sensitized'
                ? 'Your nervous system is likely sensitized'
                : 'Your nervous system is dysregulated but not quite desensitized yet'}
            </p>
          </div>
        </div>

        {/* Light background section */}
        <div style={{ position: 'relative', zIndex: 1, paddingBottom: '3rem' }}>
          <div className="space-y-8">

          {/* Score Visualization - conditionally rendered */}
          {scores && <ScoreVisualization scores={scores} result={result} />}

          {/* What This Means Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/assets/book.svg" alt="" className="w-10 h-10" />
              <h3 style={{
                fontFamily: 'Libre Baskerville, serif',
                fontWeight: '400',
                color: '#101827',
                letterSpacing: '-0.02em',
                fontSize: '32px'
              }}>
                What this means
              </h3>
            </div>
            <div className="bg-white rounded-2xl p-8">
              <div style={{
                fontFamily: 'Inter, sans-serif',
                color: '#6D6B6B',
                fontSize: '1.0625rem',
                letterSpacing: '-0.01em'
              }}>
                {renderTextWithBreaks(whatThisMeans)}
              </div>
            </div>
          </div>

          {/* What To Do Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/assets/lightbulb.svg" alt="" className="w-10 h-10" />
              <h3 style={{
                fontFamily: 'Libre Baskerville, serif',
                fontWeight: '400',
                color: '#101827',
                letterSpacing: '-0.02em',
                fontSize: '32px'
              }}>
                What to do
              </h3>
            </div>
            <div className="bg-white rounded-2xl p-8">
              <div style={{
                fontFamily: 'Inter, sans-serif',
                color: '#6D6B6B',
                fontSize: '1.0625rem',
                letterSpacing: '-0.01em'
              }}>
                {renderTextWithBreaks(whatToDo)}

                {/* Closing message as separate paragraph */}
                {closingMessage && (
                  <p className="leading-relaxed mt-6 pt-6 border-t" style={{ borderColor: '#E6E4E1' }}>
                    {closingMessage}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="mt-12 pt-8 border-t" style={{ borderColor: '#E6E4E1' }}>
            <p className="text-xs leading-relaxed" style={{
              fontFamily: 'Inter, sans-serif',
              color: '#8B8886'
            }}>
              <strong>Medical Disclaimer:</strong> This assessment is for educational purposes only and is not intended to diagnose, treat, cure, or prevent any medical condition. The results do not constitute medical advice and should not replace consultation with a qualified healthcare professional. If you are experiencing physical symptoms, please consult with your doctor to rule out underlying medical causes. Nervous system work is most effective when you have medical clearance and are confident your symptoms are not due to an undiagnosed medical condition.
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
