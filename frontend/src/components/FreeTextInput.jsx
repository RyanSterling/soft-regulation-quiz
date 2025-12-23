import { FREE_TEXT_FIELD } from '../data/ctaContent';

export default function FreeTextInput({ value, onChange, onNext, onBack }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#EFEDEC' }}>
      <div className="flex-1 pt-20 pb-8 px-4">
        <div className="max-w-3xl mx-auto flex flex-col h-full">
          {/* Question Text */}
          <div className="space-y-4 mb-auto">
            <div>
              <h2 style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '1.875rem',
                color: '#1E1F1C',
                lineHeight: '1.3',
                fontWeight: '400'
              }}>
                {FREE_TEXT_FIELD.label}
              </h2>

              {FREE_TEXT_FIELD.helper && (
                <p className="text-sm italic mt-2" style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#77716E'
                }}>
                  {FREE_TEXT_FIELD.helper}
                </p>
              )}
            </div>

            {/* Textarea */}
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={FREE_TEXT_FIELD.placeholder}
              rows={6}
              className="w-full px-4 py-3 transition-colors resize-none"
              style={{
                backgroundColor: '#E6E4E1',
                borderRadius: '12px',
                border: 'none',
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem',
                color: '#1E1F1C',
                outline: 'none'
              }}
            />

            <p className="text-sm" style={{
              fontFamily: 'Inter, sans-serif',
              color: '#77716E'
            }}>
              This field is optional but recommended for more personalized results.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={onBack}
              className="font-medium transition-colors"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#77716E'
              }}
            >
              ← Back
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  onChange(''); // Clear the text field
                  onNext();
                }}
                className="font-medium transition-colors"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#77716E'
                }}
              >
                Skip
              </button>

              <button
                onClick={onNext}
                className="px-8 py-3 font-medium transition-all"
                style={{
                  backgroundColor: '#4D1E22',
                  color: 'white',
                  borderRadius: '27px',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
