import { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import { QUESTIONS, getVisibleQuestions, getTotalQuestionCount, getQuestionText, getOptionLabel } from '../data/coachingQuestions';
import {
  WELCOME_CONTENT,
  FREE_TEXT_CONTENT,
  EMAIL_CONTENT,
  LOADING_CONTENT,
  RESULTS_CONTENT,
  FREE_TEXT_MIN_CHARS
} from '../data/coachingContent';
import { getUtmParams } from '../lib/utm';
import { getCoachingScoringConfig, saveCoachingResponse } from '../lib/coachingConfig';
import { scoreCoachingQuiz } from '../lib/coachingScoring';
import { sendCoachingWebhook } from '../lib/api';

const STEPS = {
  WELCOME: 'welcome',
  QUESTIONS: 'questions',
  FREE_TEXT: 'free_text',
  EMAIL: 'email',
  LOADING: 'loading',
  RESULTS: 'results'
};

export default function CoachingQuiz() {
  // Quiz flow state
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [freeText, setFreeText] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);

  // Scoring state
  const [scoringConfig, setScoringConfig] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [score, setScore] = useState(null);
  const [failReason, setFailReason] = useState(null);

  // UTM tracking
  const [utmParams, setUtmParams] = useState({});

  // Question navigation
  const visibleQuestions = getVisibleQuestions();
  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const totalQuestions = getTotalQuestionCount();

  // Load scoring config on mount
  useEffect(() => {
    const loadConfig = async () => {
      const config = await getCoachingScoringConfig();
      setScoringConfig(config);
    };
    loadConfig();
  }, []);

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
        // All questions answered, go to free text (Q12)
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
    if (freeText.length < FREE_TEXT_MIN_CHARS) {
      setError(FREE_TEXT_CONTENT.errorMessage);
      return;
    }
    setError('');
    setCurrentStep(STEPS.EMAIL);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    // Validate email
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
      // Score the quiz
      const scoringResult = scoreCoachingQuiz(answers, scoringConfig);
      setOutcome(scoringResult.outcome);
      setScore(scoringResult.score);
      setFailReason(scoringResult.reason);

      // Save to database (all outcomes)
      await saveCoachingResponse({
        email,
        outcome: scoringResult.outcome,
        score: scoringResult.score,
        fail_reason: scoringResult.reason,
        answers,
        free_text: freeText,
        utm_source: utmParams.utm_source,
        utm_campaign: utmParams.utm_campaign,
        utm_content: utmParams.utm_content,
        utm_term: utmParams.utm_term
      });

      // Send webhook only for PASS and REVIEW
      if (scoringResult.outcome === 'PASS' || scoringResult.outcome === 'REVIEW') {
        await sendCoachingWebhook({
          email,
          outcome: scoringResult.outcome,
          score: scoringResult.score,
          answers,
          freeText,
          utmSource: utmParams.utm_source,
          utmCampaign: utmParams.utm_campaign
        });
      }

      setCurrentStep(STEPS.RESULTS);

    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert('There was an error processing your application. Please try again.');
      setCurrentStep(STEPS.EMAIL);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // WELCOME SCREEN
  // ============================================
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
              disabled={!scoringConfig}
              className="px-10 py-4 text-lg font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-50"
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
              {WELCOME_CONTENT.disclaimer}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // QUESTIONS SCREEN
  // ============================================
  if (currentStep === STEPS.QUESTIONS) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#EFEDEC' }}>
        <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions + 1} />
          <QuestionRenderer
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={(value) => handleAnswer(currentQuestion.id, value)}
            onNext={handleNext}
            onBack={handleBack}
            showBack={currentQuestionIndex > 0}
            current={currentQuestion.questionNumber}
            total={13}
          />
        </div>
      </div>
    );
  }

  // ============================================
  // FREE TEXT SCREEN (Q12)
  // ============================================
  if (currentStep === STEPS.FREE_TEXT) {
    const charCount = freeText.length;
    const meetsMinimum = charCount >= FREE_TEXT_MIN_CHARS;

    return (
      <>
        <ProgressBar current={totalQuestions} total={totalQuestions + 1} />
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#EFEDEC' }}>
          <div className="flex-1 pt-20 pb-8 px-4">
            <div className="max-w-3xl mx-auto flex flex-col h-full">
              <div className="space-y-4 mb-auto">
                <p className="text-sm font-medium mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#8B8886' }}>
                  Question {FREE_TEXT_CONTENT.questionNumber} of 13
                </p>
                <h2 style={{
                  fontFamily: 'Libre Baskerville, serif',
                  fontSize: '1.875rem',
                  color: '#1E1F1C',
                  lineHeight: '1.3',
                  fontWeight: '400'
                }}>
                  {FREE_TEXT_CONTENT.label}
                </h2>
                <p className="text-sm italic" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
                  {FREE_TEXT_CONTENT.helper}
                </p>
                <textarea
                  value={freeText}
                  onChange={(e) => { setFreeText(e.target.value); setError(''); }}
                  placeholder={FREE_TEXT_CONTENT.placeholder}
                  rows={6}
                  className="w-full px-4 py-3 resize-none"
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
                <p className="text-sm" style={{
                  fontFamily: 'Inter, sans-serif',
                  color: meetsMinimum ? '#166534' : '#77716E'
                }}>
                  {FREE_TEXT_CONTENT.minCharsMessage(charCount, FREE_TEXT_MIN_CHARS)}
                  {meetsMinimum && ' ✓'}
                </p>
                {error && (
                  <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#DC2626' }}>
                    {error}
                  </p>
                )}
              </div>
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={handleBack}
                  className="font-medium"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleFreeTextNext}
                  disabled={!meetsMinimum}
                  className="px-8 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
      </>
    );
  }

  // ============================================
  // EMAIL SCREEN
  // ============================================
  if (currentStep === STEPS.EMAIL) {
    return (
      <>
        <ProgressBar current={totalQuestions + 1} total={totalQuestions + 1} />
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
                    {EMAIL_CONTENT.label}
                  </h2>
                  <div className="space-y-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setError(''); setEmail(e.target.value); }}
                      placeholder={EMAIL_CONTENT.placeholder}
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
                    {error && (
                      <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#DC2626' }}>
                        {error}
                      </p>
                    )}
                  </div>
                  <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
                    {EMAIL_CONTENT.helper}
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
                    <label
                      htmlFor="privacy-consent"
                      className="text-sm cursor-pointer"
                      style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', lineHeight: '1.5' }}
                    >
                      {EMAIL_CONTENT.privacyText}{' '}
                      <a
                        href={EMAIL_CONTENT.privacyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#4D1E22', textDecoration: 'underline' }}
                      >
                        {EMAIL_CONTENT.privacyLinkText}
                      </a>
                    </label>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-8">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="font-medium disabled:opacity-50"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: '#4D1E22',
                      color: 'white',
                      borderRadius: '27px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {isSubmitting ? 'Processing...' : EMAIL_CONTENT.submitButton}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ============================================
  // LOADING SCREEN
  // ============================================
  if (currentStep === STEPS.LOADING) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EFEDEC' }}>
        <div className="text-center space-y-6">
          <div
            className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 mx-auto"
            style={{ borderTopColor: '#4D1E22' }}
          />
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#77716E', fontSize: '1.125rem' }}>
            {LOADING_CONTENT.message}
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // RESULTS SCREEN
  // ============================================
  if (currentStep === STEPS.RESULTS) {
    const resultContent = RESULTS_CONTENT[outcome] || RESULTS_CONTENT.FAIL;

    // Badge styling based on outcome
    const getBadgeStyle = () => {
      switch (outcome) {
        case 'PASS':
          return { backgroundColor: '#DCFCE7', color: '#166534' };
        case 'REVIEW':
          return { backgroundColor: '#FEF3C7', color: '#92400E' };
        case 'FAIL':
        default:
          return { backgroundColor: '#FEE2E2', color: '#991B1B' };
      }
    };

    const badgeStyle = getBadgeStyle();

    return (
      <div className="min-h-screen" style={{ backgroundColor: '#EFEDEC' }}>
        <div className="max-w-3xl mx-auto px-4">
          <div
            style={{
              backgroundColor: '#4D1E22',
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: '170px',
              zIndex: 0
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, paddingTop: '5rem', paddingBottom: '2rem' }}>
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-8 text-center">
              {/* Outcome Badge */}
              <div className="flex justify-center mb-4">
                <span
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: badgeStyle.backgroundColor,
                    color: badgeStyle.color,
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  {outcome === 'PASS' ? 'Approved' : outcome === 'REVIEW' ? 'Under Review' : 'Application Complete'}
                </span>
              </div>

              <h2
                className="mb-4"
                style={{
                  fontFamily: 'Libre Baskerville, serif',
                  fontWeight: '400',
                  color: '#101827',
                  letterSpacing: '-0.02em',
                  fontSize: '32px'
                }}
              >
                {resultContent.headline}
              </h2>

              <p
                className="mb-6"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#77716E',
                  fontSize: '1.125rem',
                  lineHeight: '1.6'
                }}
              >
                {resultContent.subhead}
              </p>

              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#6D6B6B',
                  fontSize: '1rem',
                  lineHeight: '1.7'
                }}
              >
                {resultContent.body}
              </p>

              {/* CTA Button (only for PASS and FAIL) */}
              {resultContent.ctaText && resultContent.ctaUrl && (
                <div className="mt-8">
                  <a
                    href={resultContent.ctaUrl}
                    className="inline-block px-10 py-4 text-lg font-medium transition-all duration-200 hover:opacity-90"
                    style={{
                      backgroundColor: '#4D1E22',
                      color: '#FFFFFF',
                      borderRadius: '27px',
                      fontFamily: 'Inter, sans-serif',
                      textDecoration: 'none'
                    }}
                  >
                    {resultContent.ctaText}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ============================================
// Question Renderer Component
// ============================================
function QuestionRenderer({ question, value, onChange, onNext, onBack, showBack, current, total }) {
  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
    setTimeout(() => onNext(), 400);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 pt-20 pb-8 px-4">
        <div className="max-w-3xl mx-auto flex flex-col h-full">
          <div className="space-y-4 mb-auto">
            <p
              className="text-sm font-medium mb-2"
              style={{ fontFamily: 'Inter, sans-serif', color: '#8B8886' }}
            >
              Question {current} of {total}
            </p>
            <h2
              style={{
                fontFamily: 'Libre Baskerville, serif',
                fontSize: '1.875rem',
                color: '#1E1F1C',
                lineHeight: '1.3',
                fontWeight: '400'
              }}
            >
              {question.text}
            </h2>
            {question.helper && (
              <p
                className="text-sm italic"
                style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}
              >
                {question.helper}
              </p>
            )}
          </div>

          <div className="space-y-3 mt-8">
            {question.options.map((option, index) => {
              const isSelected = value === option.value;
              return (
                <button
                  key={index}
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
                      style={{
                        borderColor: isSelected ? 'white' : '#CBC9C8',
                        backgroundColor: 'transparent',
                        marginTop: '2px'
                      }}
                    >
                      {isSelected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
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
              <button
                onClick={onBack}
                className="font-medium"
                style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}
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
