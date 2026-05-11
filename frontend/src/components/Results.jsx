import { useEffect } from 'react';
import ScoreVisualization from './ScoreVisualization';
import SalesSection from './SalesSection';
import { getSeverityLevel } from '../lib/scoring';
import { getSymptomComparisons } from '../data/symptomData';

export default function Results({
  result,
  scores,
  aiContent,
  symptoms = []
}) {
  // Scroll to top when results load (delay to override browser autoscroll to video)
  useEffect(() => {
    window.scrollTo(0, 0);
    // Also scroll after a brief delay to override any browser auto-scroll behavior
    const timeout = setTimeout(() => window.scrollTo(0, 0), 100);
    return () => clearTimeout(timeout);
  }, []);

  // Get severity level for sensitized results
  const severity = scores ? getSeverityLevel(scores, result) : null;

  // Get symptom comparisons for selected symptoms
  const symptomComparisons = getSymptomComparisons(symptoms);

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
          height: '220px',
          zIndex: 0
        }} />

        {/* Content with relative positioning */}
        <div style={{ position: 'relative', zIndex: 1, paddingTop: '3rem', paddingBottom: '3rem' }}>
          {/* Score Visualization - now the primary visual at top */}
          {scores && <ScoreVisualization scores={scores} result={result} />}
        </div>

        {/* Light background section */}
        <div style={{ position: 'relative', zIndex: 1, paddingBottom: '3rem' }}>
          <div className="space-y-8">

          {/* Symptoms Confirmation - Green checkmarks (only for sensitized) */}
          {result === 'sensitized' && symptomComparisons.length > 0 && (
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-center mb-6" style={{
                fontFamily: 'Libre Baskerville, serif',
                fontWeight: '400',
                color: '#101827',
                letterSpacing: '-0.02em',
                fontSize: '22px',
                lineHeight: '1.4'
              }}>
                Are these symptoms caused by your<br />sensitized nervous system?
              </h3>

              <div className="space-y-3">
                {symptomComparisons.map((symptom) => (
                  <div
                    key={symptom.id}
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: '#F0FDF4' }}
                  >
                    <div
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#22C55E' }}
                    >
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.9375rem',
                      color: '#166534',
                      fontWeight: '500'
                    }}>
                      {symptom.label} — <span style={{ fontWeight: '400' }}>Yes</span>
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-center" style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                color: '#6D6B6B',
                lineHeight: '1.6'
              }}>
                These symptoms share one root cause: a nervous system stuck in protection mode.
                When the nervous system desensitizes, these symptoms resolve.
              </p>
            </div>
          )}

          {/* Symptom Comparison Table - only show for sensitized with symptoms */}
          {result === 'sensitized' && symptomComparisons.length > 0 && (
            <div>
              <h3 className="text-center mb-6" style={{
                fontFamily: 'Libre Baskerville, serif',
                fontWeight: '400',
                color: '#101827',
                letterSpacing: '-0.02em',
                fontSize: '24px',
                lineHeight: '1.3'
              }}>
                What you've been offered vs.<br />what actually works
              </h3>

              <div className="bg-white rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-3 border-b" style={{ borderColor: '#E6E4E1' }}>
                  <div className="p-4 text-center" style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600',
                    fontSize: '0.75rem',
                    color: '#101827',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Your Symptom
                  </div>
                  <div className="p-4 text-center" style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600',
                    fontSize: '0.75rem',
                    color: '#8B8886',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: '#F9F8F7'
                  }}>
                    Medical System
                    <div style={{
                      fontWeight: '400',
                      fontSize: '0.6875rem',
                      marginTop: '2px',
                      textTransform: 'none',
                      letterSpacing: 'normal'
                    }}>
                      (Symptom Management)
                    </div>
                  </div>
                  <div className="p-4 text-center" style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600',
                    fontSize: '0.75rem',
                    color: '#4D1E22',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Root Cause
                    <div style={{
                      fontWeight: '400',
                      fontSize: '0.6875rem',
                      marginTop: '2px',
                      textTransform: 'none',
                      letterSpacing: 'normal'
                    }}>
                      (Nervous System)
                    </div>
                  </div>
                </div>

                {/* Table Rows */}
                {symptomComparisons.map((symptom, index) => (
                  <div
                    key={symptom.id}
                    className="grid grid-cols-3"
                    style={{
                      borderBottom: index < symptomComparisons.length - 1 ? '1px solid #E6E4E1' : 'none'
                    }}
                  >
                    <div className="p-4 flex items-center" style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      color: '#101827'
                    }}>
                      {symptom.label}
                    </div>
                    <div className="p-4 flex items-center" style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.8125rem',
                      color: '#8B8886',
                      backgroundColor: '#F9F8F7',
                      fontStyle: 'italic'
                    }}>
                      {symptom.medical}
                    </div>
                    <div className="p-4 flex items-center" style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.8125rem',
                      color: '#4D1E22',
                      fontWeight: '500'
                    }}>
                      {symptom.rootCause}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What This Means Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/assets/book.svg" alt="" className="w-10 h-10" />
              <h3 style={{
                fontFamily: 'Libre Baskerville, serif',
                fontWeight: '400',
                color: '#101827',
                letterSpacing: '-0.02em',
                fontSize: '28px'
              }}>
                What this means
              </h3>
            </div>
            <div className="bg-white rounded-2xl p-8">
              <div style={{
                fontFamily: 'Inter, sans-serif',
                color: '#6D6B6B',
                fontSize: '0.875rem',
                letterSpacing: '-0.01em',
                lineHeight: '1.7'
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
                fontSize: '28px'
              }}>
                What to do
              </h3>
            </div>
            <div className="bg-white rounded-2xl p-8">
              <div style={{
                fontFamily: 'Inter, sans-serif',
                color: '#6D6B6B',
                fontSize: '0.875rem',
                letterSpacing: '-0.01em',
                lineHeight: '1.7'
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

          {/* Sales Section - Course CTA */}
          <SalesSection />

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
