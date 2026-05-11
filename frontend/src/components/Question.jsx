import { useState, useEffect } from 'react';

export default function Question({ question, value, onChange, onNext, onBack, showBack, current, total, onTransitionStart }) {
  const [flashingValue, setFlashingValue] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null); // Track the clicked value for checkmark
  const [otherText, setOtherText] = useState('');

  // Reset flashing state when question changes
  useEffect(() => {
    setFlashingValue(null);
    setIsFlashing(false);
    setSelectedValue(null);
    setOtherText('');
  }, [question.id]);

  // Handle multiselect questions
  if (question.type === 'multiselect') {
    const selectedItems = value || [];
    const selectedIds = selectedItems.map(item => typeof item === 'string' ? item : item.id);

    const toggleOption = (optionId) => {
      let newSelectedIds;

      if (optionId === 'none') {
        // Clicking "None" deselects everything else
        if (selectedIds.includes('none')) {
          newSelectedIds = [];
        } else {
          newSelectedIds = ['none'];
        }
      } else {
        // Clicking any other option deselects "None"
        const withoutNone = selectedIds.filter(id => id !== 'none');

        if (withoutNone.includes(optionId)) {
          newSelectedIds = withoutNone.filter(id => id !== optionId);
        } else {
          newSelectedIds = [...withoutNone, optionId];
        }
      }

      // Format with labels for the API
      const formattedSelection = newSelectedIds.map(id => {
        const opt = question.options.find(o => o.id === id);
        return {
          id,
          label: opt?.label || id,
          ...(id === 'other' && otherText ? { customText: otherText } : {})
        };
      });

      onChange(formattedSelection);
    };

    const handleOtherTextChange = (text) => {
      setOtherText(text);
      // Update the answer with the custom text
      const updated = selectedIds.map(id => {
        const opt = question.options.find(o => o.id === id);
        return {
          id,
          label: opt?.label || id,
          ...(id === 'other' ? { customText: text } : {})
        };
      });
      onChange(updated);
    };

    const hasSelection = selectedIds.length > 0;

    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 pt-20 pb-8 px-4">
          <div className="max-w-3xl mx-auto flex flex-col h-full">
            <div className="space-y-4 mb-6">
              <p className="text-sm font-medium mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#8B8886' }}>
                Question {current} of {total}
              </p>
              <h2 style={{ fontFamily: 'Libre Baskerville, serif', fontSize: '1.875rem', color: '#1E1F1C', lineHeight: '1.3', fontWeight: '400' }}>
                {question.text}
              </h2>
              {question.helper && (
                <p className="text-sm italic" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
                  {question.helper}
                </p>
              )}
            </div>

            {/* 2-column grid for all options */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {question.options.map((option) => {
                const isSelected = selectedIds.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleOption(option.id)}
                    className="text-left px-4 py-3 transition-all duration-100"
                    style={{
                      backgroundColor: isSelected ? '#4D1E22' : '#E6E4E1',
                      borderRadius: '20px',
                      fontFamily: 'Inter, sans-serif',
                      color: isSelected ? 'white' : '#77716E'
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: isSelected ? 'white' : '#CBC9C8', backgroundColor: 'transparent' }}
                      >
                        {isSelected && (
                          <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-sm">{option.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Other text input - shows below grid when Other is selected */}
            {selectedIds.includes('other') && question.hasOtherText && (
              <input
                type="text"
                value={otherText}
                onChange={(e) => handleOtherTextChange(e.target.value)}
                placeholder="Please specify..."
                className="w-full mt-2 px-4 py-3"
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
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              {showBack ? (
                <button onClick={onBack} className="font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
                  ← Back
                </button>
              ) : <div />}
              <button
                onClick={() => {
                  if (onTransitionStart) onTransitionStart();
                  onChange(value, (newAnswers) => onNext(newAnswers));
                }}
                disabled={!hasSelection}
                className="px-8 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#4D1E22', color: 'white', borderRadius: '27px', fontFamily: 'Inter, sans-serif' }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original single-select logic
  const handleOptionClick = (optionValue) => {
    if (isFlashing) return; // Prevent multiple clicks during animation

    // Start the double-flash animation
    setIsFlashing(true);
    setFlashingValue(optionValue);
    setSelectedValue(optionValue); // Keep checkmark visible throughout

    // First flash (selected)
    setTimeout(() => {
      setFlashingValue(null); // Flash to default
    }, 100);

    // Second flash (selected again)
    setTimeout(() => {
      setFlashingValue(optionValue); // Flash back to selected
    }, 200);

    // Navigate after animation completes
    setTimeout(() => {
      if (onTransitionStart) {
        onTransitionStart();
      }

      // Call onChange with callback to ensure navigation happens AFTER state update
      onChange(optionValue, (newAnswers) => {
        onNext(newAnswers); // Pass the new answers to onNext
      });
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 pt-20 pb-8 px-4">
        <div className="max-w-3xl mx-auto flex flex-col h-full">
          {/* Question Text */}
          <div className="space-y-4 mb-auto">
            {/* Question Counter */}
            <p className="text-sm font-medium mb-2" style={{
              fontFamily: 'Inter, sans-serif',
              color: '#8B8886'
            }}>
              Question {current} of {total}
            </p>

            <h2 style={{
              fontFamily: 'Libre Baskerville, serif',
              fontSize: '1.875rem',
              color: '#1E1F1C',
              lineHeight: '1.3',
              fontWeight: '400'
            }}>
              {question.text}
            </h2>

            {question.helper && (
              <p className="text-sm italic" style={{
                fontFamily: 'Inter, sans-serif',
                color: '#77716E'
              }}>
                {question.helper}
              </p>
            )}
          </div>

          {/* Options - pushed to bottom */}
          <div className="space-y-3 mt-8">
            {question.options.map((option) => {
              // For background/text: flash animation if active, otherwise show saved value
              const isVisuallySelected = isFlashing ? flashingValue === option.value : value === option.value;
              // For checkmark: show if selected during animation OR if it's the saved value
              const showCheckmark = isFlashing ? selectedValue === option.value : value === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  className="w-full text-left px-6 py-4 transition-all duration-100"
                  style={{
                    backgroundColor: isVisuallySelected ? '#4D1E22' : '#E6E4E1',
                    borderRadius: '27px',
                    fontFamily: 'Inter, sans-serif',
                    color: isVisuallySelected ? 'white' : '#77716E'
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-100"
                      style={{
                        borderColor: isVisuallySelected ? 'white' : '#CBC9C8',
                        backgroundColor: 'transparent',
                        marginTop: '2px'
                      }}
                    >
                      {showCheckmark && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke={isVisuallySelected ? "white" : "#CBC9C8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-lg">{option.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Back Button */}
          {showBack && (
            <div className="mt-6">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
