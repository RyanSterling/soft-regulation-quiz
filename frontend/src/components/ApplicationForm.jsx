import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import {
  TIMEZONE_OPTIONS,
  REVENUE_OPTIONS,
  PRICING_OPTIONS,
  FREE_TEXT_QUESTIONS,
  LINKS_QUESTION,
  SYMPTOMS_QUESTION,
  COURSE_QUESTION,
  STEP_CONTENT,
  TOTAL_STEPS,
  isValidUrl
} from '../data/applicationQuestions';
import { getUtmParams } from '../lib/utm';
import { saveApplicationResponse } from '../lib/applicationConfig';
import { sendApplicationWebhook } from '../lib/api';

// Match ApplicationLanding color palette
const colors = {
  cream: '#FAF9F7',
  creamDark: '#E8E6E3',
  white: '#FFFFFF',
  black: '#1E1F1C',
  olive: '#545B47',
  muted: '#6D6B6B',
};

const STEPS = {
  WELCOME: 'welcome',
  CONTACT: 'contact',
  BUSINESS_DESC: 'business_desc',
  LINKS: 'links',
  SYMPTOMS: 'symptoms',
  COURSE: 'course',
  FREE_TEXT: 'free_text',
  REVENUE: 'revenue',
  PRICING: 'pricing',
  LOADING: 'loading',
  CONFIRMATION: 'confirmation'
};

// Free text questions after links/symptoms (indices 1-4 in FREE_TEXT_QUESTIONS array)
const REMAINING_FREE_TEXT = FREE_TEXT_QUESTIONS.slice(1); // already_tried, why_now, clear_yes, anything_else

export default function ApplicationForm() {
  const navigate = useNavigate();

  // Form flow state - skip welcome, go directly to contact
  const [currentStep, setCurrentStep] = useState(STEPS.CONTACT);
  const [currentFreeTextIndex, setCurrentFreeTextIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    location: '',
    timezone: ''
  });
  const [businessDescription, setBusinessDescription] = useState('');
  const [links, setLinks] = useState({
    instagram: '',
    youtube: '',
    tiktok: '',
    website: '',
    other: ''
  });
  const [hasSymptoms, setHasSymptoms] = useState(null); // null, 'yes', 'no'
  const [symptomsDescription, setSymptomsDescription] = useState('');
  const [hasTakenCourse, setHasTakenCourse] = useState(null); // null, 'yes', 'no'
  const [freeTextAnswers, setFreeTextAnswers] = useState({});
  const [revenueRange, setRevenueRange] = useState('');
  const [pricingAck, setPricingAck] = useState('');

  // UTM tracking - capture on mount
  const [utmParams, setUtmParams] = useState({});

  useEffect(() => {
    const utm = getUtmParams();
    setUtmParams(utm);
  }, []);

  // Current free text question (for remaining questions after symptoms)
  const currentFreeTextQuestion = REMAINING_FREE_TEXT[currentFreeTextIndex];

  // Calculate progress
  const getProgress = () => {
    if (currentStep === STEPS.CONTACT) return 0;
    if (currentStep === STEPS.BUSINESS_DESC) return 2;
    if (currentStep === STEPS.LINKS) return 3;
    if (currentStep === STEPS.SYMPTOMS) return 4;
    if (currentStep === STEPS.COURSE) return 5;
    if (currentStep === STEPS.FREE_TEXT) return 6 + currentFreeTextIndex;
    if (currentStep === STEPS.PRICING) return 6 + REMAINING_FREE_TEXT.length;
    return TOTAL_STEPS;
  };

  const handleStart = () => {
    const utm = getUtmParams();
    setUtmParams(utm);
    setCurrentStep(STEPS.CONTACT);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleContactNext = () => {
    if (!contactInfo.name.trim() || contactInfo.name.trim().length < 2) {
      setError('Please enter your name');
      return;
    }
    if (!contactInfo.email.trim() || !validateEmail(contactInfo.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!contactInfo.timezone) {
      setError('Please select your timezone');
      return;
    }

    setError('');
    transitionTo(() => setCurrentStep(STEPS.BUSINESS_DESC));
  };

  const handleBusinessDescNext = () => {
    if (businessDescription.trim().length < 50) {
      setError('Please write at least 50 characters');
      return;
    }
    setError('');
    transitionTo(() => setCurrentStep(STEPS.LINKS));
  };

  const handleLinksNext = () => {
    // Check at least 1 link is provided
    const filledLinks = Object.values(links).filter(v => v.trim() !== '');
    if (filledLinks.length === 0) {
      setError('Please provide at least one link');
      return;
    }

    // Validate all filled URLs
    for (const [key, value] of Object.entries(links)) {
      if (value.trim() && !isValidUrl(value.trim())) {
        setError(`Please enter a valid URL for ${key}`);
        return;
      }
    }

    setError('');
    transitionTo(() => setCurrentStep(STEPS.SYMPTOMS));
  };

  const handleSymptomsNext = () => {
    if (hasSymptoms === null) {
      setError('Please select an option');
      return;
    }
    if (hasSymptoms === 'yes' && symptomsDescription.trim().length < 50) {
      setError('Please write at least 50 characters describing your symptoms');
      return;
    }
    setError('');
    transitionTo(() => setCurrentStep(STEPS.COURSE));
  };

  const handleCourseSelect = (value) => {
    setHasTakenCourse(value);
    transitionTo(() => {
      setCurrentStep(STEPS.FREE_TEXT);
      setCurrentFreeTextIndex(0);
    });
  };

  const handleFreeTextNext = () => {
    const question = currentFreeTextQuestion;
    const answer = freeTextAnswers[question.id] || '';

    if (question.required && answer.trim().length < question.minChars) {
      setError(`Please write at least ${question.minChars} characters`);
      return;
    }

    setError('');
    transitionTo(() => {
      if (currentFreeTextIndex < REMAINING_FREE_TEXT.length - 1) {
        setCurrentFreeTextIndex(currentFreeTextIndex + 1);
      } else {
        setCurrentStep(STEPS.PRICING);
      }
    });
  };

  const handleRevenueSelect = (value) => {
    setRevenueRange(value);
    transitionTo(() => setCurrentStep(STEPS.PRICING));
  };

  const handlePricingSelect = async (value) => {
    setPricingAck(value);

    if (value === 'not_yet') {
      navigate('/apply/not-ready');
      return;
    }

    setCurrentStep(STEPS.LOADING);
    setIsSubmitting(true);

    try {
      // Combine all answers
      const allAnswers = {
        business_description: businessDescription.trim(),
        links: links,
        has_symptoms: hasSymptoms,
        symptoms: hasSymptoms === 'yes' ? symptomsDescription.trim() : null,
        has_taken_course: hasTakenCourse,
        ...freeTextAnswers
      };

      const applicationData = {
        name: contactInfo.name.trim(),
        email: contactInfo.email.trim(),
        location: contactInfo.location.trim() || null,
        timezone: contactInfo.timezone,
        answers: allAnswers,
        revenue_range: revenueRange,
        utm_source: utmParams.utm_source,
        utm_campaign: utmParams.utm_campaign,
        utm_content: utmParams.utm_content,
        utm_term: utmParams.utm_term
      };

      await saveApplicationResponse(applicationData);

      await sendApplicationWebhook({
        name: applicationData.name,
        email: applicationData.email,
        location: applicationData.location,
        timezone: applicationData.timezone,
        answers: applicationData.answers,
        revenueRange: applicationData.revenue_range,
        utmSource: utmParams.utm_source,
        utmCampaign: utmParams.utm_campaign,
        utmContent: utmParams.utm_content,
        utmTerm: utmParams.utm_term
      });

      setCurrentStep(STEPS.CONFIRMATION);
    } catch (err) {
      console.error('Error submitting application:', err);
      alert('There was an error submitting your application. Please try again.');
      setCurrentStep(STEPS.PRICING);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep === STEPS.PRICING) {
      setCurrentStep(STEPS.FREE_TEXT);
      setCurrentFreeTextIndex(REMAINING_FREE_TEXT.length - 1);
    } else if (currentStep === STEPS.FREE_TEXT && currentFreeTextIndex > 0) {
      setCurrentFreeTextIndex(currentFreeTextIndex - 1);
    } else if (currentStep === STEPS.FREE_TEXT && currentFreeTextIndex === 0) {
      setCurrentStep(STEPS.COURSE);
    } else if (currentStep === STEPS.COURSE) {
      setCurrentStep(STEPS.SYMPTOMS);
    } else if (currentStep === STEPS.SYMPTOMS) {
      setCurrentStep(STEPS.LINKS);
    } else if (currentStep === STEPS.LINKS) {
      setCurrentStep(STEPS.BUSINESS_DESC);
    } else if (currentStep === STEPS.BUSINESS_DESC) {
      setCurrentStep(STEPS.CONTACT);
    } else if (currentStep === STEPS.CONTACT) {
      setCurrentStep(STEPS.WELCOME);
    }
  };

  const transitionTo = (callback) => {
    setIsTransitioning(true);
    setTimeout(() => {
      callback();
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  // ============================================
  // WELCOME SCREEN
  // ============================================
  if (currentStep === STEPS.WELCOME) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.cream }}>
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="mb-12 flex justify-center">
            <img src="/assets/logo.svg" alt="Soft Regulation" className="h-16 md:h-20" />
          </div>

          <h1
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: '500',
              color: colors.black,
              letterSpacing: '-0.02em',
              fontSize: '2.5rem',
              lineHeight: '1.2'
            }}
            className="md:text-5xl"
          >
            {STEP_CONTENT.welcome.headline}
          </h1>

          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: colors.muted,
              fontSize: '1.125rem',
              lineHeight: '1.75'
            }}
            className="md:text-xl"
          >
            {STEP_CONTENT.welcome.subhead}
          </p>

          <div className="pt-8">
            <button
              onClick={handleStart}
              className="px-10 py-4 text-lg font-medium transition-all duration-200 hover:opacity-90"
              style={{
                backgroundColor: colors.olive,
                color: colors.white,
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {STEP_CONTENT.welcome.buttonText}
            </button>
          </div>

          <p style={{ fontFamily: 'Inter, sans-serif', color: colors.muted, fontSize: '0.875rem' }}>
            {STEP_CONTENT.welcome.timeEstimate}
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // CONTACT INFO SCREEN
  // ============================================
  if (currentStep === STEPS.CONTACT) {
    const content = STEP_CONTENT.contact;

    return (
      <>
        <ProgressBar current={getProgress()} total={TOTAL_STEPS} barColor={colors.olive} bgColor={colors.creamDark} />
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.cream }}>
          <div className={`flex-1 pt-20 pb-8 px-4 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="max-w-3xl mx-auto">
              <h2 className="mb-8" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.875rem', color: colors.black, lineHeight: '1.3', fontWeight: '500' }}>
                {content.headline}
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                    {content.fields.name.label}
                  </label>
                  <input
                    type="text"
                    value={contactInfo.name}
                    onChange={(e) => { setContactInfo({ ...contactInfo, name: e.target.value }); setError(''); }}
                    placeholder={content.fields.name.placeholder}
                    className="w-full px-4 py-3"
                    style={{ backgroundColor: colors.creamDark, border: `1px solid ${colors.creamDark}`, fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: colors.black, outline: 'none' }}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                    {content.fields.email.label}
                  </label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => { setContactInfo({ ...contactInfo, email: e.target.value }); setError(''); }}
                    placeholder={content.fields.email.placeholder}
                    className="w-full px-4 py-3"
                    style={{ backgroundColor: colors.creamDark, border: `1px solid ${colors.creamDark}`, fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: colors.black, outline: 'none' }}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                    {content.fields.location.label}
                    <span style={{ color: colors.muted, marginLeft: '0.25rem' }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={contactInfo.location}
                    onChange={(e) => setContactInfo({ ...contactInfo, location: e.target.value })}
                    placeholder={content.fields.location.placeholder}
                    className="w-full px-4 py-3"
                    style={{ backgroundColor: colors.creamDark, border: `1px solid ${colors.creamDark}`, fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: colors.black, outline: 'none' }}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                    {content.fields.timezone.label}
                  </label>
                  <select
                    value={contactInfo.timezone}
                    onChange={(e) => { setContactInfo({ ...contactInfo, timezone: e.target.value }); setError(''); }}
                    className="w-full px-4 py-3"
                    style={{ backgroundColor: colors.creamDark, border: `1px solid ${colors.creamDark}`, fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: contactInfo.timezone ? colors.black : colors.muted, outline: 'none' }}
                  >
                    <option value="">{content.fields.timezone.placeholder}</option>
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <p className="mt-4 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#DC2626' }}>{error}</p>}

              <div className="flex justify-between items-center mt-8">
                <button onClick={handleBack} className="font-medium" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                  ← Back
                </button>
                <button onClick={handleContactNext} className="px-8 py-3 font-medium" style={{ backgroundColor: colors.olive, color: colors.white, fontFamily: 'Inter, sans-serif' }}>
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
  // BUSINESS DESCRIPTION SCREEN (Q2)
  // ============================================
  if (currentStep === STEPS.BUSINESS_DESC) {
    const question = FREE_TEXT_QUESTIONS[0]; // business_description
    const charCount = businessDescription.length;
    const meetsMinimum = charCount >= question.minChars;

    return (
      <>
        <ProgressBar current={getProgress()} total={TOTAL_STEPS} barColor={colors.olive} bgColor={colors.creamDark} />
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.cream }}>
          <div className={`flex-1 pt-20 pb-8 px-4 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="max-w-3xl mx-auto flex flex-col h-full">
              <div className="space-y-4 mb-auto">
                <p className="text-sm font-medium mb-2" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                  Question {question.questionNumber} of 9
                </p>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.875rem', color: colors.black, lineHeight: '1.3', fontWeight: '500' }}>
                  {question.label}
                </h2>
                {question.helper && (
                  <p className="text-sm italic" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                    {question.helper}
                  </p>
                )}
                <textarea
                  value={businessDescription}
                  onChange={(e) => { setBusinessDescription(e.target.value); setError(''); }}
                  placeholder={question.placeholder}
                  rows={8}
                  className="w-full px-4 py-3 resize-none"
                  style={{ backgroundColor: colors.creamDark, border: error ? '2px solid #DC2626' : `1px solid ${colors.creamDark}`, fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: colors.black, outline: 'none' }}
                />
                <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: meetsMinimum ? colors.olive : colors.muted }}>
                  {charCount} / {question.minChars} characters minimum
                  {meetsMinimum && ' ✓'}
                </p>
                {error && <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#DC2626' }}>{error}</p>}
              </div>

              <div className="flex justify-between items-center mt-8">
                <button onClick={handleBack} className="font-medium" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                  ← Back
                </button>
                <button
                  onClick={handleBusinessDescNext}
                  disabled={!meetsMinimum}
                  className="px-8 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: colors.olive, color: colors.white, fontFamily: 'Inter, sans-serif' }}
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
  // LINKS SCREEN (Q3)
  // ============================================
  if (currentStep === STEPS.LINKS) {
    const filledCount = Object.values(links).filter(v => v.trim() !== '').length;

    return (
      <>
        <ProgressBar current={getProgress()} total={TOTAL_STEPS} barColor={colors.olive} bgColor={colors.creamDark} />
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.cream }}>
          <div className={`flex-1 pt-20 pb-8 px-4 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="max-w-3xl mx-auto">
              <p className="text-sm font-medium mb-2" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                Question {LINKS_QUESTION.questionNumber} of 9
              </p>
              <h2 className="mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.875rem', color: colors.black, lineHeight: '1.3', fontWeight: '500' }}>
                {LINKS_QUESTION.headline}
              </h2>
              <p className="text-sm italic mb-2" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                {LINKS_QUESTION.helper}
              </p>
              <p className="text-sm mb-6" style={{ fontFamily: 'Inter, sans-serif', color: filledCount > 0 ? colors.olive : colors.muted }}>
                {LINKS_QUESTION.requirement} {filledCount > 0 && '✓'}
              </p>

              <div className="space-y-4">
                {LINKS_QUESTION.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block mb-2 text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                      {field.label}
                    </label>
                    <input
                      type="url"
                      value={links[field.id]}
                      onChange={(e) => { setLinks({ ...links, [field.id]: e.target.value }); setError(''); }}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3"
                      style={{ backgroundColor: colors.creamDark, border: `1px solid ${colors.creamDark}`, fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: colors.black, outline: 'none' }}
                    />
                  </div>
                ))}
              </div>

              {error && <p className="mt-4 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#DC2626' }}>{error}</p>}

              <div className="flex justify-between items-center mt-8">
                <button onClick={handleBack} className="font-medium" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                  ← Back
                </button>
                <button
                  onClick={handleLinksNext}
                  disabled={filledCount === 0}
                  className="px-8 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: colors.olive, color: colors.white, fontFamily: 'Inter, sans-serif' }}
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
  // SYMPTOMS SCREEN (Q4)
  // ============================================
  if (currentStep === STEPS.SYMPTOMS) {
    const showTextarea = hasSymptoms === 'yes';
    const symptomsCharCount = symptomsDescription.length;
    const meetsSymptomsMin = symptomsCharCount >= SYMPTOMS_QUESTION.followUp.minChars;

    return (
      <>
        <ProgressBar current={getProgress()} total={TOTAL_STEPS} barColor={colors.olive} bgColor={colors.creamDark} />
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.cream }}>
          <div className={`flex-1 pt-20 pb-8 px-4 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="max-w-3xl mx-auto">
              <p className="text-sm font-medium mb-2" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                Question {SYMPTOMS_QUESTION.questionNumber} of 9
              </p>
              <h2 className="mb-6" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.875rem', color: colors.black, lineHeight: '1.3', fontWeight: '500' }}>
                {SYMPTOMS_QUESTION.headline}
              </h2>

              <div className="space-y-3 mb-6">
                {SYMPTOMS_QUESTION.options.map((option) => {
                  const isSelected = hasSymptoms === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => { setHasSymptoms(option.value); setError(''); }}
                      className="w-full text-left px-6 py-4 transition-all duration-100"
                      style={{ backgroundColor: isSelected ? colors.olive : colors.creamDark, border: `1px solid ${isSelected ? colors.olive : colors.creamDark}`, fontFamily: 'Inter, sans-serif', color: isSelected ? colors.white : colors.muted }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: isSelected ? colors.white : colors.creamDark, backgroundColor: 'transparent' }}>
                          {isSelected && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className="text-lg">{option.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {showTextarea && (
                <div className="space-y-4 mt-6">
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', color: colors.black, fontWeight: '500' }}>
                    {SYMPTOMS_QUESTION.followUp.label}
                  </h3>
                  {SYMPTOMS_QUESTION.followUp.helper && (
                    <p className="text-sm italic" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                      {SYMPTOMS_QUESTION.followUp.helper}
                    </p>
                  )}
                  <textarea
                    value={symptomsDescription}
                    onChange={(e) => { setSymptomsDescription(e.target.value); setError(''); }}
                    placeholder={SYMPTOMS_QUESTION.followUp.placeholder}
                    rows={6}
                    className="w-full px-4 py-3 resize-none"
                    style={{ backgroundColor: colors.creamDark, border: error ? '2px solid #DC2626' : `1px solid ${colors.creamDark}`, fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: colors.black, outline: 'none' }}
                  />
                  <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: meetsSymptomsMin ? colors.olive : colors.muted }}>
                    {symptomsCharCount} / {SYMPTOMS_QUESTION.followUp.minChars} characters minimum
                    {meetsSymptomsMin && ' ✓'}
                  </p>
                </div>
              )}

              {error && <p className="mt-4 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#DC2626' }}>{error}</p>}

              <div className="flex justify-between items-center mt-8">
                <button onClick={handleBack} className="font-medium" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                  ← Back
                </button>
                <button
                  onClick={handleSymptomsNext}
                  disabled={hasSymptoms === null || (hasSymptoms === 'yes' && !meetsSymptomsMin)}
                  className="px-8 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: colors.olive, color: colors.white, fontFamily: 'Inter, sans-serif' }}
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
  // COURSE QUESTION SCREEN (Q5)
  // ============================================
  if (currentStep === STEPS.COURSE) {
    return (
      <>
        <ProgressBar current={getProgress()} total={TOTAL_STEPS} barColor={colors.olive} bgColor={colors.creamDark} />
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.cream }}>
          <div className={`flex-1 pt-20 pb-8 px-4 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="max-w-3xl mx-auto flex flex-col h-full">
              <div className="space-y-4 mb-auto">
                <p className="text-sm font-medium mb-2" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                  Question {COURSE_QUESTION.questionNumber} of 9
                </p>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.875rem', color: colors.black, lineHeight: '1.3', fontWeight: '500' }}>
                  {COURSE_QUESTION.headline}
                </h2>
              </div>

              <div className="space-y-3 mt-8">
                {COURSE_QUESTION.options.map((option) => {
                  const isSelected = hasTakenCourse === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleCourseSelect(option.value)}
                      className="w-full text-left px-6 py-4 transition-all duration-100"
                      style={{ backgroundColor: isSelected ? colors.olive : colors.creamDark, border: `1px solid ${isSelected ? colors.olive : colors.creamDark}`, fontFamily: 'Inter, sans-serif', color: isSelected ? colors.white : colors.muted }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center mt-8">
                <button onClick={handleBack} className="font-medium" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                  ← Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ============================================
  // FREE TEXT QUESTIONS SCREEN (Q6-Q8)
  // ============================================
  if (currentStep === STEPS.FREE_TEXT) {
    const question = currentFreeTextQuestion;
    const answer = freeTextAnswers[question.id] || '';
    const charCount = answer.length;
    const meetsMinimum = !question.required || charCount >= question.minChars;

    return (
      <>
        <ProgressBar current={getProgress()} total={TOTAL_STEPS} barColor={colors.olive} bgColor={colors.creamDark} />
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.cream }}>
          <div className={`flex-1 pt-20 pb-8 px-4 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="max-w-3xl mx-auto flex flex-col h-full">
              <div className="space-y-4 mb-auto">
                <p className="text-sm font-medium mb-2" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                  Question {question.questionNumber} of 9
                </p>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.875rem', color: colors.black, lineHeight: '1.3', fontWeight: '500' }}>
                  {question.label}
                </h2>
                {question.helper && (
                  <p className="text-sm italic" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                    {question.helper}
                  </p>
                )}
                <textarea
                  value={answer}
                  onChange={(e) => { setFreeTextAnswers({ ...freeTextAnswers, [question.id]: e.target.value }); setError(''); }}
                  placeholder={question.placeholder}
                  rows={8}
                  className="w-full px-4 py-3 resize-none"
                  style={{ backgroundColor: colors.creamDark, border: error ? '2px solid #DC2626' : `1px solid ${colors.creamDark}`, fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: colors.black, outline: 'none' }}
                />
                {question.required && question.minChars > 0 && (
                  <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: meetsMinimum ? colors.olive : colors.muted }}>
                    {charCount} / {question.minChars} characters minimum
                    {meetsMinimum && ' ✓'}
                  </p>
                )}
                {!question.required && (
                  <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Optional</p>
                )}
                {error && <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#DC2626' }}>{error}</p>}
              </div>

              <div className="flex justify-between items-center mt-8">
                <button onClick={handleBack} className="font-medium" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                  ← Back
                </button>
                <button
                  onClick={handleFreeTextNext}
                  disabled={question.required && !meetsMinimum}
                  className="px-8 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: colors.olive, color: colors.white, fontFamily: 'Inter, sans-serif' }}
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
  // REVENUE RANGE SCREEN (Q9)
  // ============================================
  if (currentStep === STEPS.REVENUE) {
    return (
      <>
        <ProgressBar current={getProgress()} total={TOTAL_STEPS} barColor={colors.olive} bgColor={colors.creamDark} />
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.cream }}>
          <div className={`flex-1 pt-20 pb-8 px-4 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="max-w-3xl mx-auto flex flex-col h-full">
              <div className="space-y-4 mb-auto">
                <p className="text-sm font-medium mb-2" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                  Question {STEP_CONTENT.revenue.questionNumber} of 9
                </p>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.875rem', color: colors.black, lineHeight: '1.3', fontWeight: '500' }}>
                  {STEP_CONTENT.revenue.headline}
                </h2>
                {STEP_CONTENT.revenue.helper && (
                  <p className="text-sm italic" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                    {STEP_CONTENT.revenue.helper}
                  </p>
                )}
              </div>

              <div className="space-y-3 mt-8">
                {REVENUE_OPTIONS.map((option) => {
                  const isSelected = revenueRange === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleRevenueSelect(option.value)}
                      className="w-full text-left px-6 py-4 transition-all duration-100"
                      style={{ backgroundColor: isSelected ? colors.olive : colors.creamDark, border: `1px solid ${isSelected ? colors.olive : colors.creamDark}`, fontFamily: 'Inter, sans-serif', color: isSelected ? colors.white : colors.muted }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: isSelected ? colors.white : colors.creamDark, backgroundColor: 'transparent' }}>
                          {isSelected && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className="text-lg">{option.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                <button onClick={handleBack} className="font-medium" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                  ← Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ============================================
  // PRICING ACKNOWLEDGMENT SCREEN (Q10)
  // ============================================
  if (currentStep === STEPS.PRICING) {
    return (
      <>
        <ProgressBar current={getProgress()} total={TOTAL_STEPS} barColor={colors.olive} bgColor={colors.creamDark} />
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.cream }}>
          <div className={`flex-1 pt-20 pb-8 px-4 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="max-w-3xl mx-auto flex flex-col h-full">
              <div className="space-y-4 mb-auto">
                <p className="text-sm font-medium mb-2" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                  Question {STEP_CONTENT.pricing.questionNumber} of 9
                </p>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.875rem', color: colors.black, lineHeight: '1.3', fontWeight: '500' }}>
                  {STEP_CONTENT.pricing.headline}
                </h2>
                <p className="py-4" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted, fontSize: '1.125rem', lineHeight: '1.6' }}>
                  {STEP_CONTENT.pricing.statement}
                </p>
              </div>

              <div className="space-y-3 mt-8">
                {PRICING_OPTIONS.map((option) => {
                  const isSelected = pricingAck === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handlePricingSelect(option.value)}
                      disabled={isSubmitting}
                      className="w-full text-left px-6 py-4 transition-all duration-100 disabled:opacity-50"
                      style={{ backgroundColor: isSelected ? colors.olive : colors.creamDark, border: `1px solid ${isSelected ? colors.olive : colors.creamDark}`, fontFamily: 'Inter, sans-serif', color: isSelected ? colors.white : colors.muted }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: isSelected ? colors.white : colors.creamDark, backgroundColor: 'transparent' }}>
                          {isSelected && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className="text-lg">{option.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                <button onClick={handleBack} disabled={isSubmitting} className="font-medium disabled:opacity-50" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                  ← Back
                </button>
              </div>
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.cream }}>
        <div className="text-center space-y-6">
          <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto" style={{ borderColor: colors.creamDark, borderTopColor: colors.olive }} />
          <p style={{ fontFamily: 'Inter, sans-serif', color: colors.muted, fontSize: '1.125rem' }}>
            {STEP_CONTENT.loading.message}
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // CONFIRMATION SCREEN
  // ============================================
  if (currentStep === STEPS.CONFIRMATION) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.cream }}>
        <div className="max-w-3xl mx-auto px-4">
          <div style={{ backgroundColor: colors.olive, position: 'absolute', left: 0, right: 0, top: 0, height: '170px', zIndex: 0 }} />

          <div style={{ position: 'relative', zIndex: 1, paddingTop: '5rem', paddingBottom: '2rem' }}>
            <div className="p-8 text-center" style={{ backgroundColor: colors.white }}>
              <div className="flex justify-center mb-4">
                <span className="px-4 py-2 text-sm font-medium" style={{ backgroundColor: colors.creamDark, color: colors.olive, fontFamily: 'Inter, sans-serif' }}>
                  Submitted
                </span>
              </div>

              <h2 className="mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: '500', color: colors.black, letterSpacing: '-0.02em', fontSize: '32px' }}>
                {STEP_CONTENT.confirmation.headline}
              </h2>

              <p className="mb-6" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted, fontSize: '1.125rem', lineHeight: '1.6' }}>
                {STEP_CONTENT.confirmation.subhead}
              </p>

              <p style={{ fontFamily: 'Inter, sans-serif', color: colors.muted, fontSize: '1rem', lineHeight: '1.7' }}>
                {STEP_CONTENT.confirmation.body}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
