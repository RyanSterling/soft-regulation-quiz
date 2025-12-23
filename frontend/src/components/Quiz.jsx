import { useState } from 'react';
import Welcome from './Welcome';
import Question from './Question';
import ProgressBar from './ProgressBar';
import FreeTextInput from './FreeTextInput';
import EmailCapture from './EmailCapture';
import LoadingScreen from './LoadingScreen';
import Results from './Results';
import { QUESTIONS, getVisibleQuestions, getTotalQuestionCount } from '../data/questions';
import { getCtaType } from '../data/ctaContent';
import { calculateScores, determineResult, prepareQuizData } from '../lib/scoring';
import { getUtmParams } from '../lib/utm';
import { generateSessionId } from '../lib/session';
import { saveResponse, trackQuizStart, markQuizCompleted } from '../lib/supabase';
import { generateInsight, sendWebhook } from '../lib/api';

const STEPS = {
  WELCOME: 'welcome',
  QUESTIONS: 'questions',
  FREE_TEXT: 'free_text',
  EMAIL: 'email',
  LOADING: 'loading',
  RESULTS: 'results'
};

export default function Quiz() {
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [freeText, setFreeText] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Results data
  const [result, setResult] = useState(null);
  const [aiContent, setAiContent] = useState(null);

  // UTM and session tracking
  const [utmParams, setUtmParams] = useState({});
  const [sessionId, setSessionId] = useState('');

  // Get visible questions based on current answers
  const visibleQuestions = getVisibleQuestions(answers);
  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const totalQuestions = getTotalQuestionCount(answers);

  const handleStart = async () => {
    // Generate a fresh session ID for this quiz attempt
    const session = generateSessionId();
    const utm = getUtmParams();

    setSessionId(session);
    setUtmParams(utm);

    await trackQuizStart(session, utm);

    setCurrentStep(STEPS.QUESTIONS);
  };

  const handleAnswer = (questionId, value, callback) => {
    setAnswers(prev => {
      const newAnswers = { ...prev, [questionId]: value };
      // Execute callback after state update with new answers
      if (callback) {
        setTimeout(() => callback(newAnswers), 0);
      }
      return newAnswers;
    });
  };

  const handleNext = (updatedAnswers) => {
    // Use provided answers or fall back to current state
    const answersToUse = updatedAnswers || answers;

    // Fade out before transitioning
    setIsTransitioning(true);

    setTimeout(() => {
      // Recalculate visible questions with the answers we're using
      const updatedVisibleQuestions = getVisibleQuestions(answersToUse);
      const nextIndex = currentQuestionIndex + 1;

      if (nextIndex < updatedVisibleQuestions.length) {
        setCurrentQuestionIndex(nextIndex);
      } else {
        // Move to free text input
        setCurrentStep(STEPS.FREE_TEXT);
      }

      // Small delay to ensure state updates before fade in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
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

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Navigate to loading screen immediately
    setCurrentStep(STEPS.LOADING);

    try {
      // Calculate scores and result
      const calculatedScores = calculateScores(answers);
      const calculatedResult = determineResult(calculatedScores);

      setResult(calculatedResult);

      // Determine CTA type for database storage
      const hasPain = answers.q10 || false;
      const medicalClearance = answers.q11 || null;
      const determinedCtaType = getCtaType(hasPain, medicalClearance);

      // Prepare quiz data for submission
      const quizData = prepareQuizData(answers, email, freeText, utmParams);
      quizData.cta_type = determinedCtaType;

      // Generate AI content (non-blocking)
      let aiResult = null;
      try {
        const insightResult = await generateInsight({
          result: calculatedResult,
          scores: calculatedScores,
          answers: quizData,
          hasPain,
          medicalClearance,
          freeText,
          email
        });
        aiResult = {
          whatThisMeans: insightResult.whatThisMeans,
          whatToDo: insightResult.whatToDo,
          closingMessage: insightResult.closingMessage
        };
        setAiContent(aiResult);
      } catch (error) {
        console.error('AI insight generation failed:', error);
        // Continue without AI insight
      }

      // Save response to Supabase (store combined content as ai_insight for now)
      quizData.ai_insight = aiResult ? JSON.stringify(aiResult) : null;
      const { data: savedResponse, error: saveError } = await saveResponse(quizData);

      if (saveError) {
        throw new Error('Failed to save response');
      }

      // Mark quiz as completed
      await markQuizCompleted(sessionId, savedResponse.id);

      // Send initial webhook ONLY for eligible users (paths 1 & 2)
      if (determinedCtaType === 'eligible') {
        await sendWebhook({
          email,
          result: calculatedResult,
          hasPain,
          medicalClearance,
          waitlistOptedIn: false,
          tag: null,
          utmSource: utmParams.utm_source,
          utmCampaign: utmParams.utm_campaign
        });
      }

      // Show results
      setCurrentStep(STEPS.RESULTS);

    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('There was an error processing your quiz. Please try again.');
      // Go back to email screen on error
      setCurrentStep(STEPS.EMAIL);
    } finally {
      setIsSubmitting(false);
    }
  };


  // Render current step
  if (currentStep === STEPS.WELCOME) {
    return <Welcome onStart={handleStart} />;
  }

  if (currentStep === STEPS.QUESTIONS) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#EFEDEC' }}>
        <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions + 2} />
          <Question
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={(value, callback) => handleAnswer(currentQuestion.id, value, callback)}
            onNext={handleNext}
            onBack={handleBack}
            showBack={currentQuestionIndex > 0}
            current={currentQuestionIndex + 1}
            total={totalQuestions + 2}
            onTransitionStart={() => setIsTransitioning(true)}
          />
        </div>
      </div>
    );
  }

  if (currentStep === STEPS.FREE_TEXT) {
    return (
      <>
        <ProgressBar current={totalQuestions + 1} total={totalQuestions + 2} />
        <FreeTextInput
          value={freeText}
          onChange={setFreeText}
          onNext={handleFreeTextNext}
          onBack={handleBack}
        />
      </>
    );
  }

  if (currentStep === STEPS.EMAIL) {
    return (
      <>
        <ProgressBar current={totalQuestions + 2} total={totalQuestions + 2} />
        <EmailCapture
          value={email}
          onChange={setEmail}
          onSubmit={handleSubmit}
          onBack={handleBack}
          isSubmitting={isSubmitting}
        />
      </>
    );
  }

  if (currentStep === STEPS.LOADING) {
    return <LoadingScreen />;
  }

  if (currentStep === STEPS.RESULTS) {
    return (
      <Results
        result={result}
        aiContent={aiContent}
      />
    );
  }

  return null;
}
