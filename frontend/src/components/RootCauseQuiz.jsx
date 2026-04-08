import { useState } from 'react';
import ProgressBar from './ProgressBar';
import { QUESTIONS, getVisibleQuestions, getTotalQuestionCount } from '../data/rootCauseQuestions';
import { WELCOME_CONTENT, FREE_TEXT_FIELD, EMAIL_FIELD, DISCLAIMER, LIKELIHOOD_BADGES, EDUCATIONAL_CONTENT } from '../data/rootCauseContent';
import { getUtmParams } from '../lib/utm';
import { saveRootCauseResponse } from '../lib/supabase';
import { generateRootCauseAssessment, sendRootCauseWebhook } from '../lib/api';

const STEPS = {
  WELCOME: 'welcome',
  QUESTIONS: 'questions',
  FREE_TEXT: 'free_text',
  EMAIL: 'email',
  LOADING: 'loading',
  RESULTS: 'results'
};

export default function RootCauseQuiz() {
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [freeText, setFreeText] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);

  // Results data
  const [aiResult, setAiResult] = useState(null);

  // UTM tracking
  const [utmParams, setUtmParams] = useState({});

  const visibleQuestions = getVisibleQuestions();
  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const totalQuestions = getTotalQuestionCount();

  const handleStart = () => {
    const utm = getUtmParams();
    setUtmParams(utm);
    setCurrentStep(STEPS.QUESTIONS);
  };

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < visibleQuestions.length) {
        setCurrentQuestionIndex(nextIndex);
      } else {
        setCurrentStep(STEPS.FREE_TEXT);
      }
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  const handleBack = () => {
    if (currentStep === STEPS.EMAIL) {
      setCurrentStep(STEPS.FREE_TEXT);
    } else if (currentStep === STEPS.FREE_TEXT) {
      setCurrentStep(STEPS.QUESTIONS);
      setCurrentQuestionIndex(visibleQuestions.length - 1);
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFreeTextNext = () => {
    setCurrentStep(STEPS.EMAIL);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    if (!email || !email.trim()) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!privacyConsent) {
      setError('Please agree to the Privacy Policy to continue');
      return;
    }

    setError('');
    setIsSubmitting(true);
    setCurrentStep(STEPS.LOADING);

    try {
      // Format answers for the API
      const formattedAnswers = {
        symptoms: answers.symptoms || [],
        duration: answers.duration,
        structuralCause: answers.structuralCause,
        symptomOnset: answers.symptomOnset,
        multipleAreas: answers.multipleAreas,
        spreadOverTime: answers.spreadOverTime,
        shiftLocations: answers.shiftLocations,
        betterWhenDistracted: answers.betterWhenDistracted,
        worseDuringStress: answers.worseDuringStress,
        triggeredByUnrelated: answers.triggeredByUnrelated,
        historyOfSymptoms: answers.historyOfSymptoms
      };

      // Generate AI assessment
      const result = await generateRootCauseAssessment({
        email,
        answers: formattedAnswers,
        freeText
      });

      setAiResult(result);

      // Save to database
      await saveRootCauseResponse({
        email,
        answers: formattedAnswers,
        ai_assessment: JSON.stringify(result),
        free_text_response: freeText || null,
        utm_source: utmParams.utm_source || null,
        utm_campaign: utmParams.utm_campaign || null
      });

      // Send webhook to n8n for ConvertKit tagging
      await sendRootCauseWebhook({
        email,
        symptoms: formattedAnswers.symptoms,
        likelihood: result.likelihood,
        utmSource: utmParams.utm_source || null,
        utmCampaign: utmParams.utm_campaign || null
      });

      setCurrentStep(STEPS.RESULTS);

    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert('There was an error processing your assessment. Please try again.');
      setCurrentStep(STEPS.EMAIL);
    } finally {
      setIsSubmitting(false);
    }
  };

  // WELCOME SCREEN
  if (currentStep === STEPS.WELCOME) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#EFEDEC' }}>
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="mb-12 flex justify-center">
            <img src="/assets/logo.svg" alt="Soft Regulation" className="h-16 md:h-20" />
          </div>

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

          <p style={{
            fontFamily: 'Inter, sans-serif',
            color: '#77716E',
            fontSize: '1.125rem',
            lineHeight: '1.75'
          }} className="md:text-xl">
            {WELCOME_CONTENT.subhead}
          </p>

          <div className="pt-8">
            <button
              onClick={handleStart}
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

          <div className="pt-6 px-4">
            <p style={{
              fontFamily: 'Inter, sans-serif',
              color: '#77716E',
              fontSize: '0.875rem',
              lineHeight: '1.5'
            }}>
              By taking this assessment, you agree to our{' '}
              <a href="https://www.maggiesterling.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80" style={{ color: '#77716E' }}>Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80" style={{ color: '#77716E' }}>Privacy Policy</a>.
              This assessment provides educational information only and is not medical advice.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // QUESTIONS SCREEN
  if (currentStep === STEPS.QUESTIONS) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#EFEDEC' }}>
        <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions + 2} />
          <QuestionRenderer
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={(value) => handleAnswer(currentQuestion.id, value)}
            onNext={handleNext}
            onBack={handleBack}
            showBack={currentQuestionIndex > 0}
            current={currentQuestionIndex + 1}
            total={totalQuestions}
          />
        </div>
      </div>
    );
  }

  // FREE TEXT SCREEN
  if (currentStep === STEPS.FREE_TEXT) {
    return (
      <>
        <ProgressBar current={totalQuestions + 1} total={totalQuestions + 2} />
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#EFEDEC' }}>
          <div className="flex-1 pt-20 pb-8 px-4">
            <div className="max-w-3xl mx-auto flex flex-col h-full">
              <div className="space-y-4 mb-auto">
                <h2 style={{
                  fontFamily: 'Libre Baskerville, serif',
                  fontSize: '1.875rem',
                  color: '#1E1F1C',
                  lineHeight: '1.3',
                  fontWeight: '400'
                }}>
                  {FREE_TEXT_FIELD.label}
                </h2>
                <p className="text-sm italic" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
                  {FREE_TEXT_FIELD.helper}
                </p>
                <textarea
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder={FREE_TEXT_FIELD.placeholder}
                  rows={6}
                  className="w-full px-4 py-3 resize-none"
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
              </div>
              <div className="flex justify-between items-center mt-8">
                <button onClick={handleBack} className="font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
                  ← Back
                </button>
                <div className="flex items-center space-x-4">
                  <button onClick={() => { setFreeText(''); handleFreeTextNext(); }} className="font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
                    Skip
                  </button>
                  <button onClick={handleFreeTextNext} className="px-8 py-3 font-medium" style={{ backgroundColor: '#4D1E22', color: 'white', borderRadius: '27px', fontFamily: 'Inter, sans-serif' }}>
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // EMAIL SCREEN
  if (currentStep === STEPS.EMAIL) {
    return (
      <>
        <ProgressBar current={totalQuestions + 2} total={totalQuestions + 2} />
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#EFEDEC' }}>
          <div className="flex-1 pt-20 pb-8 px-4">
            <div className="max-w-3xl mx-auto flex flex-col h-full">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className="space-y-4 mb-auto">
                  <h2 style={{
                    fontFamily: 'Libre Baskerville, serif',
                    fontSize: '1.875rem',
                    color: '#1E1F1C',
                    lineHeight: '1.3',
                    fontWeight: '400'
                  }}>
                    {EMAIL_FIELD.label}
                  </h2>
                  <div className="space-y-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setError(''); setEmail(e.target.value); }}
                      placeholder={EMAIL_FIELD.placeholder}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3"
                      style={{
                        backgroundColor: '#E6E4E1',
                        borderRadius: '12px',
                        border: error ? '2px solid #DC2626' : 'none',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '1rem',
                        color: '#1E1F1C',
                        outline: 'none'
                      }}
                    />
                    {error && <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#DC2626' }}>{error}</p>}
                  </div>
                  <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
                    You'll see your results on the next screen.
                  </p>
                  <div className="flex items-start gap-3 mt-6">
                    <input
                      type="checkbox"
                      id="privacy-consent"
                      checked={privacyConsent}
                      onChange={(e) => { setPrivacyConsent(e.target.checked); setError(''); }}
                      disabled={isSubmitting}
                      className="mt-1 cursor-pointer"
                      style={{ width: '18px', height: '18px', accentColor: '#4D1E22' }}
                    />
                    <label htmlFor="privacy-consent" className="text-sm cursor-pointer" style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', lineHeight: '1.5' }}>
                      I agree to the{' '}
                      <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#4D1E22', textDecoration: 'underline' }}>Privacy Policy</a>
                      {' '}and consent to my data being processed to provide assessment results.
                    </label>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-8">
                  <button type="button" onClick={handleBack} disabled={isSubmitting} className="font-medium disabled:opacity-50" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
                    ← Back
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-8 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: '#4D1E22', color: 'white', borderRadius: '27px', fontFamily: 'Inter, sans-serif' }}>
                    {isSubmitting ? 'Processing...' : 'Get My Assessment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  // LOADING SCREEN
  if (currentStep === STEPS.LOADING) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EFEDEC' }}>
        <div className="text-center space-y-6">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 mx-auto" style={{ borderTopColor: '#4D1E22' }} />
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#77716E', fontSize: '1.125rem' }}>
            Analyzing your responses...
          </p>
        </div>
      </div>
    );
  }

  // RESULTS SCREEN
  if (currentStep === STEPS.RESULTS) {
    const likelihood = aiResult?.likelihood || 'unclear';
    const badge = LIKELIHOOD_BADGES[likelihood] || LIKELIHOOD_BADGES.unclear;
    const symptoms = answers.symptoms || [];

    // Dynamic headline based on likelihood
    const getResultHeadline = () => {
      if (likelihood === 'high' || likelihood === 'moderate') {
        return 'Your symptoms are very likely driven by your nervous system.';
      } else if (likelihood === 'low') {
        return 'Your symptoms may have a structural component.';
      } else {
        return 'We need more information to assess your situation.';
      }
    };

    return (
      <div className="min-h-screen" style={{ backgroundColor: '#EFEDEC' }}>
        <div className="max-w-3xl mx-auto px-4">
          <div style={{ backgroundColor: '#4D1E22', position: 'absolute', left: 0, right: 0, top: 0, height: '170px', zIndex: 0 }} />

          <div style={{ position: 'relative', zIndex: 1, paddingTop: '5rem', paddingBottom: '2rem' }}>
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-8 text-center">
              {/* Likelihood Badge */}
              <div className="flex justify-center mb-4">
                <span
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: badge.bgColor,
                    color: badge.color,
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  {badge.text}
                </span>
              </div>
              <h2 className="mb-2" style={{ fontFamily: 'Libre Baskerville, serif', fontWeight: '400', color: '#101827', letterSpacing: '-0.02em', fontSize: '32px' }}>
                Your Assessment
              </h2>
              <p style={{ fontFamily: 'Inter, sans-serif', color: '#77716E', fontSize: '1.25rem', lineHeight: '1.5' }}>
                {getResultHeadline()}
              </p>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1, paddingBottom: '2rem' }}>
            {/* Main Content Card */}
            <div className="bg-white rounded-2xl p-8">
              {/* Symptom Tags */}
              {symptoms.length > 0 && (
                <div className="mb-6 pb-6" style={{ borderBottom: '1px solid #E6E4E1' }}>
                  <p className="text-sm mb-3" style={{ fontFamily: 'Inter, sans-serif', color: '#8B8886' }}>
                    Your symptoms:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {symptoms.map((symptom, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 rounded-full text-sm"
                        style={{
                          backgroundColor: '#F3F4F6',
                          color: '#4B5563',
                          fontFamily: 'Inter, sans-serif'
                        }}
                      >
                        {symptom.label || symptom.id}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* What we see */}
                {aiResult?.assessment && (
                  <div>
                    <h3 className="mb-2" style={{ fontFamily: 'Libre Baskerville, serif', fontWeight: '400', color: '#101827', fontSize: '1.25rem' }}>
                      What we see
                    </h3>
                    <p style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '1rem', lineHeight: '1.7' }}>
                      {aiResult.assessment}
                    </p>
                  </div>
                )}

                {/* What this means */}
                {aiResult?.explanation && (
                  <div>
                    <h3 className="mb-2" style={{ fontFamily: 'Libre Baskerville, serif', fontWeight: '400', color: '#101827', fontSize: '1.25rem' }}>
                      What this means
                    </h3>
                    <p style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '1rem', lineHeight: '1.7' }}>
                      {aiResult.explanation}
                    </p>
                  </div>
                )}

                {/* What to do next */}
                {aiResult?.nextSteps && (
                  <div>
                    <h3 className="mb-2" style={{ fontFamily: 'Libre Baskerville, serif', fontWeight: '400', color: '#101827', fontSize: '1.25rem' }}>
                      What to do next
                    </h3>
                    <p style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '1rem', lineHeight: '1.7' }}>
                      {aiResult.nextSteps}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Educational Resources Card */}
          <div style={{ position: 'relative', zIndex: 1, paddingBottom: '2rem' }}>
            <div className="bg-white rounded-2xl p-8">
              <h3 className="mb-6" style={{ fontFamily: 'Libre Baskerville, serif', fontWeight: '400', color: '#101827', fontSize: '1.5rem' }}>
                Understanding Neuroplastic Symptoms
              </h3>

              <div className="space-y-6">
                {/* What are neuroplastic symptoms */}
                <div>
                  <h4 className="mb-2 font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#101827', fontSize: '1rem' }}>
                    {EDUCATIONAL_CONTENT.whatAreNeuroplasticSymptoms.title}
                  </h4>
                  <p style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '0.95rem', lineHeight: '1.7' }}>
                    {EDUCATIONAL_CONTENT.whatAreNeuroplasticSymptoms.content}
                  </p>
                </div>

                {/* Why does this happen */}
                <div>
                  <h4 className="mb-2 font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#101827', fontSize: '1rem' }}>
                    {EDUCATIONAL_CONTENT.whyDoesThisHappen.title}
                  </h4>
                  <p style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '0.95rem', lineHeight: '1.7' }}>
                    {EDUCATIONAL_CONTENT.whyDoesThisHappen.content}
                  </p>
                </div>

                {/* How do people heal */}
                <div>
                  <h4 className="mb-2 font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#101827', fontSize: '1rem' }}>
                    {EDUCATIONAL_CONTENT.howDoPeopleHeal.title}
                  </h4>
                  <p style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '0.95rem', lineHeight: '1.7' }}>
                    {EDUCATIONAL_CONTENT.howDoPeopleHeal.content}
                  </p>
                </div>

                {/* Learn more links */}
                <div className="pt-4" style={{ borderTop: '1px solid #E6E4E1' }}>
                  <h4 className="mb-3 font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#101827', fontSize: '1rem' }}>
                    {EDUCATIONAL_CONTENT.resources.title}
                  </h4>
                  <div className="space-y-3">
                    {EDUCATIONAL_CONTENT.resources.links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-lg transition-colors hover:bg-gray-50"
                        style={{ backgroundColor: '#F9FAFB' }}
                      >
                        <span className="font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#4D1E22', fontSize: '0.95rem' }}>
                          {link.text}
                        </span>
                        <span className="block text-sm mt-0.5" style={{ fontFamily: 'Inter, sans-serif', color: '#8B8886' }}>
                          {link.description}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ position: 'relative', zIndex: 1, paddingBottom: '3rem' }}>
            <p className="text-xs leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', color: '#8B8886' }}>
              <strong>Disclaimer:</strong> {DISCLAIMER}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Question Renderer Component
function QuestionRenderer({ question, value, onChange, onNext, onBack, showBack, current, total }) {
  const [otherText, setOtherText] = useState('');

  // For multiselect questions
  if (question.type === 'multiselect') {
    const selectedItems = value || [];
    // Extract IDs from the stored objects
    const selectedIds = selectedItems.map(item => typeof item === 'string' ? item : item.id);

    const toggleOption = (optionId) => {
      const isCurrentlySelected = selectedIds.includes(optionId);

      let newSelectedIds;
      if (isCurrentlySelected) {
        newSelectedIds = selectedIds.filter(id => id !== optionId);
      } else {
        newSelectedIds = [...selectedIds, optionId];
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

    const hasSelection = selectedIds.length > 0;

    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 pt-20 pb-8 px-4">
          <div className="max-w-3xl mx-auto flex flex-col h-full">
            <div className="space-y-4 mb-auto">
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

            <div className="space-y-3 mt-8">
              {question.options.map((option) => {
                const isSelected = selectedIds.includes(option.id);
                return (
                  <div key={option.id}>
                    <button
                      onClick={() => toggleOption(option.id)}
                      className="w-full text-left px-6 py-4 transition-all duration-100"
                      style={{
                        backgroundColor: isSelected ? '#4D1E22' : '#E6E4E1',
                        borderRadius: '27px',
                        fontFamily: 'Inter, sans-serif',
                        color: isSelected ? 'white' : '#77716E'
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
                          style={{ borderColor: isSelected ? 'white' : '#CBC9C8', backgroundColor: 'transparent' }}
                        >
                          {isSelected && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke={isSelected ? "white" : "#CBC9C8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <span className="text-lg">{option.label}</span>
                      </div>
                    </button>
                    {option.id === 'other' && isSelected && question.hasOtherText && (
                      <input
                        type="text"
                        value={otherText}
                        onChange={(e) => {
                          setOtherText(e.target.value);
                          // Update the answer with the custom text
                          const updated = selectedIds.map(id => {
                            const opt = question.options.find(o => o.id === id);
                            return {
                              id,
                              label: opt?.label || id,
                              ...(id === 'other' ? { customText: e.target.value } : {})
                            };
                          });
                          onChange(updated);
                        }}
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
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-8">
              {showBack ? (
                <button onClick={onBack} className="font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
                  ← Back
                </button>
              ) : <div />}
              <button
                onClick={onNext}
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

  // For choice/yesno questions (single select with auto-advance)
  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
    setTimeout(() => onNext(), 400);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 pt-20 pb-8 px-4">
        <div className="max-w-3xl mx-auto flex flex-col h-full">
          <div className="space-y-4 mb-auto">
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

          <div className="space-y-3 mt-8">
            {question.options.map((option) => {
              const isSelected = value === option.value;
              return (
                <button
                  key={option.value?.toString() || option.label}
                  onClick={() => handleOptionClick(option.value)}
                  className="w-full text-left px-6 py-4 transition-all duration-100"
                  style={{
                    backgroundColor: isSelected ? '#4D1E22' : '#E6E4E1',
                    borderRadius: '27px',
                    fontFamily: 'Inter, sans-serif',
                    color: isSelected ? 'white' : '#77716E'
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: isSelected ? 'white' : '#CBC9C8', backgroundColor: 'transparent', marginTop: '2px' }}
                    >
                      {isSelected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-lg">{option.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {showBack && (
            <div className="mt-6">
              <button onClick={onBack} className="font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
