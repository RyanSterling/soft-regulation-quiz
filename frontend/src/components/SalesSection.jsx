import { useState, useEffect } from 'react';

// Stripe checkout base URL
const STRIPE_URL = 'https://buy.stripe.com/7sYeVe1rCbFu5jO2Qy7Re03';

// Helper to get cookie value
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Build Stripe URL with attribution
function getStripeUrlWithAttribution() {
  const youtubeVisitorId = getCookie('_vid');
  const url = new URL(STRIPE_URL);

  if (youtubeVisitorId) {
    url.searchParams.set('client_reference_id', 'yt_' + youtubeVisitorId);
  }

  return url.toString();
}

// Track InitiateCheckout with Facebook Pixel
function trackInitiateCheckout() {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_name: 'Soft Regulation Course',
      value: 297,
      currency: 'USD'
    });
  }
}

// FAQ Data
const FAQ_ITEMS = [
  {
    question: "Do I need to have a sensitized nervous system to take this course?",
    answer: "This course is designed specifically for people with sensitized nervous systems, but the principles apply to anyone dealing with chronic stress, anxiety, or nervous system dysregulation. If you took the quiz and scored as sensitized or even dysregulated, this course can help you."
  },
  {
    question: "Will this cure my chronic illness or chronic pain?",
    answer: "This is an educational course about how to work with a sensitized nervous system. It's not medical treatment and doesn't promise to cure anything. What it does is teach you how to stop accidentally making your nervous system worse and how to create the conditions for your body to feel safer. Many people find this significantly reduces their symptoms."
  },
  {
    question: "Can I do this alongside therapy or medication?",
    answer: "Yes. This course complements other approaches. It's educational content about nervous system regulation that works alongside whatever else you're doing for your health."
  },
  {
    question: "Why should I pay when there's free content on YouTube?",
    answer: "The free content gives you concepts. This course gives you the complete system, structured in the right order, with specific applications for your situation. It's the difference between random tips and a comprehensive approach designed to actually change your nervous system patterns."
  },
  {
    question: "How do I access the course?",
    answer: "The course is delivered as two private podcast feeds—one for the main lessons and one for the circumstantial coaching audios. After purchase, you'll get instructions to add them to your favorite podcast app. This means you can listen anywhere, anytime, even offline."
  },
  {
    question: "What's the refund policy?",
    answer: "Due to the digital nature of this course and immediate access to all content, all sales are final. Please make sure this feels right for you before purchasing."
  }
];

// Testimonial images
const TESTIMONIALS = [
  '/assets/testimonials/testimonial 1 1.png',
  '/assets/testimonials/testimonial 3 1.png',
  '/assets/testimonials/testimonial 4 1.png',
  '/assets/testimonials/testimonial5.png',
  '/assets/testimonials/testimonial-6.png',
  '/assets/testimonials/testimonial-7.png',
  '/assets/testimonials/testimonial-8.png',
  '/assets/testimonials/testimonial 9.png',
  '/assets/testimonials/long covid CFS.png',
  '/assets/testimonials/PJ wald.png',
  '/assets/testimonials/free vs paid.png'
];

// Curriculum Data - matching actual sales page
const LESSONS = [
  "The Foundation - What Makes This Work",
  "How You're Making Your Nervous System Worse",
  "What Actually Works",
  "Reacting vs Responding",
  "Building Capacity",
  "The Recalibration Phase - Navigating the Hard Part",
  "Acceptance (Part 1) - Putting Down the Mental Fight",
  "Acceptance (Part 2) - How to Practice Acceptance in Real Moments",
  "Allowing (Part 1) - Putting Down the Physical Fight",
  "Allowing (Part 2) - How to Practice Allowing in Real Moments",
  "Self-Compassion - Why Being Hard on Yourself Keeps You Stuck",
  "Letting in the Good",
  "Let Life Be the Regulator",
  "One Last Thing"
];

const COACHING_AUDIOS = [
  "I Was Feeling Good and Then My Symptoms Spiked",
  "I'm in the Middle of a Panic Spike",
  "I keep Waking Up Anxious",
  "I Really Want to Google This / I Need to Know",
  "I Have a New Symptom / My Symptoms Are Shifting",
  "I Feel Like I'm Back at Square One",
  "I Can't Sleep / I Woke Up in the Middle of the Night",
  "Allowing — Quick Reference",
  "Acceptance — Quick Reference"
];

const BROADCAST_FEED = [
  "What is the broadcast feed?",
  "What to Ask Yourself When Symptoms Spike (5m 45s)",
  "Q&A— February 2026 (1h 17m)",
  "Q&A— March 2026 pt. 1 (58m)",
  "Q&A— March 2026 pt. 2 (1h 18m)",
  "[coaching] Relief vs. Recovery (15:44m)"
];

// Who this is for / not for
const WHO_THIS_IS_FOR = [
  "You've been dealing with chronic anxiety, chronic symptoms, pain, insomnia, health fears, or some combination for months or years",
  "You've tried therapy, protocols, supplements, specialists, breathwork, somatic programs, and nothing is helping and/or you're getting worse",
  "You spend hours researching, checking symptoms, scrolling recovery stories, or looking for the next thing that will finally work",
  "You're tired of giving your life over to this and you're willing to do something different even though it's uncomfortable",
  "You're open to an approach that doesn't give you a checklist, a protocol, or steps to monitor yourself with",
  "You've done your due diligence medically. The tests come back fine, or the treatments you've been given haven't helped"
];

const WHO_THIS_IS_NOT_FOR = [
  "You're in an acute medical crisis or have symptoms that haven't been evaluated by a doctor yet",
  "You're in an active mental health crisis, suicidal ideation, or a situation that needs clinical care right now",
  "You want a step-by-step protocol, a daily checklist, or a symptom tracker",
  "You want someone to promise your specific symptoms will disappear in a specific timeframe",
  "You're hoping for a quick fix",
  "You're not willing to live your life while you still feel bad",
  "You want more tools to add on top of the ones you're already using",
  "You're looking for trauma excavation, deep emotional processing, or nervous system regulation tools (not helpful for those in severe sensitization and often makes things worse)",
  "You think you need 1 on 1 coaching to explain your specific situation in order to heal"
];

export default function SalesSection() {
  const [openFaq, setOpenFaq] = useState(null);
  const [stripeUrl, setStripeUrl] = useState(STRIPE_URL);

  // Build attribution URL on mount
  useEffect(() => {
    setStripeUrl(getStripeUrlWithAttribution());
  }, []);

  const handleBuyClick = () => {
    trackInitiateCheckout();
    window.location.href = stripeUrl;
  };

  return (
    <div className="mt-16">
      {/* Transition Section */}
      <div className="text-center mb-12">
        <h2 style={{
          fontFamily: 'Libre Baskerville, serif',
          fontWeight: '400',
          color: '#101827',
          letterSpacing: '-0.02em',
          fontSize: '36px',
          lineHeight: '1.3'
        }}>
          Ready to Heal Your Nervous System?
        </h2>
        <p className="mt-4 text-lg" style={{
          fontFamily: 'Inter, sans-serif',
          color: '#6D6B6B',
          maxWidth: '600px',
          margin: '1rem auto 0'
        }}>
          Learn what's actually keeping your nervous system stuck—and how to finally feel safe in your body again.
        </p>
      </div>

      {/* VSL Video Section - with autoplay */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg mb-12">
        <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
          <iframe
            src="https://player.vimeo.com/video/1158199803?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
            referrerPolicy="strict-origin-when-cross-origin"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            title="Soft Regulation Course"
          />
        </div>
      </div>

      {/* Primary CTA */}
      <div className="text-center mb-16">
        <button
          onClick={handleBuyClick}
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          style={{
            backgroundColor: '#4D1E22',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          Get the Course — $297
        </button>
        <p className="mt-3 text-sm" style={{ color: '#8B8886', fontFamily: 'Inter, sans-serif' }}>
          One-time payment • Lifetime access
        </p>
      </div>

      {/* Main Headline Section */}
      <div className="bg-white rounded-2xl p-8 md:p-12 mb-12">
        <h3 className="text-center mb-6" style={{
          fontFamily: 'Libre Baskerville, serif',
          fontWeight: '400',
          color: '#101827',
          letterSpacing: '-0.02em',
          fontSize: '28px',
          lineHeight: '1.4'
        }}>
          Heal Your Sensitized Nervous System and Finally Feel Safe in Your Body Again
        </h3>
        <p className="text-center" style={{
          fontFamily: 'Inter, sans-serif',
          color: '#6D6B6B',
          fontSize: '1.125rem',
          lineHeight: '1.7',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          Healing your nervous system doesn't have to mean redirecting every negative thought or forcing yourself to feel grateful. I'll show you what's actually keeping your nervous system stuck—and it's not what you think.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="mb-12">
        <h3 className="text-center mb-8" style={{
          fontFamily: 'Libre Baskerville, serif',
          fontWeight: '400',
          color: '#101827',
          letterSpacing: '-0.02em',
          fontSize: '24px'
        }}>
          What You'll Learn
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Change Your Response Patterns",
              description: "Stop the cycle that keeps your alarm system constantly activated. Learn what actually creates safety in your body."
            },
            {
              title: "Handle Discomfort Differently",
              description: "Work with symptoms instead of against them. No more constant internal struggle or fighting your own body."
            },
            {
              title: "Stop Symptoms Running Your Life",
              description: "Move from managing yourself all day to actually living. Reclaim the energy you've been spending on survival."
            }
          ].map((benefit, index) => (
            <div key={index} className="bg-white rounded-2xl p-6">
              <h4 className="mb-3" style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                color: '#101827',
                fontSize: '1.125rem'
              }}>
                {benefit.title}
              </h4>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                color: '#6D6B6B',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="mb-12">
        <h3 className="text-center mb-8" style={{
          fontFamily: 'Libre Baskerville, serif',
          fontWeight: '400',
          color: '#101827',
          letterSpacing: '-0.02em',
          fontSize: '24px'
        }}>
          What Others Are Saying
        </h3>
        <div
          className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {TESTIMONIALS.map((src, index) => (
            <div
              key={index}
              className="flex-shrink-0 bg-white rounded-xl overflow-hidden shadow-md"
              style={{
                scrollSnapAlign: 'start',
                width: '300px',
                maxWidth: '85vw'
              }}
            >
              <img
                src={src}
                alt={`Customer testimonial ${index + 1}`}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        <p className="text-center mt-4 text-sm" style={{ color: '#8B8886', fontFamily: 'Inter, sans-serif' }}>
          Scroll to see more →
        </p>
      </div>

      {/* Why Nothing Has Worked Section */}
      <div className="bg-white rounded-2xl p-8 md:p-12 mb-12">
        <h3 className="mb-6" style={{
          fontFamily: 'Libre Baskerville, serif',
          fontWeight: '400',
          color: '#101827',
          letterSpacing: '-0.02em',
          fontSize: '24px'
        }}>
          Why Nothing You've Tried Has Worked
        </h3>
        <div style={{
          fontFamily: 'Inter, sans-serif',
          color: '#6D6B6B',
          fontSize: '1.0625rem',
          lineHeight: '1.7'
        }}>
          <p>
            Every program promises to calm your nervous system with breathwork, somatic exercises, and regulation tools. But when you're sensitized, you don't need more calming techniques—you need to stop the behaviors that keep reinforcing the alarm.
          </p>
        </div>
      </div>

      {/* What's Included / Curriculum Section */}
      <div className="mb-12">
        <h3 className="text-center mb-4" style={{
          fontFamily: 'Libre Baskerville, serif',
          fontWeight: '400',
          color: '#101827',
          letterSpacing: '-0.02em',
          fontSize: '28px'
        }}>
          What's Inside
        </h3>
        <p className="text-center mb-8" style={{
          fontFamily: 'Inter, sans-serif',
          color: '#6D6B6B',
          fontSize: '1rem'
        }}>
          Two private podcast feeds delivered straight to your phone. Listen while you live your life—no login required, no overwhelming course platform.
        </p>

        {/* The Lessons */}
        <div className="bg-white rounded-2xl p-6 md:p-8 mb-6">
          <h4 className="text-center mb-6" style={{
            fontFamily: 'Libre Baskerville, serif',
            fontWeight: '400',
            color: '#101827',
            fontSize: '1.5rem'
          }}>
            The Lessons
          </h4>
          <ul className="space-y-3">
            {LESSONS.map((lesson, index) => (
              <li key={index} className="flex items-start gap-3" style={{
                fontFamily: 'Inter, sans-serif',
                color: '#6D6B6B',
                fontSize: '1rem'
              }}>
                <span style={{ color: '#B8860B', fontWeight: '500' }}>॥</span>
                <span><strong style={{ color: '#101827' }}>Lesson {index + 1}:</strong> {lesson}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Coaching Audios */}
        <div className="bg-white rounded-2xl p-6 md:p-8 mb-6">
          <h4 className="text-center mb-6" style={{
            fontFamily: 'Libre Baskerville, serif',
            fontWeight: '400',
            color: '#101827',
            fontSize: '1.5rem'
          }}>
            Circumstantial Coaching Audios
          </h4>
          <ul className="space-y-3">
            {COACHING_AUDIOS.map((audio, index) => (
              <li key={index} className="flex items-start gap-3" style={{
                fontFamily: 'Inter, sans-serif',
                color: '#6D6B6B',
                fontSize: '1rem'
              }}>
                <span style={{ color: '#B8860B', fontWeight: '500' }}>॥</span>
                <span><strong style={{ color: '#101827' }}>Coaching:</strong> - {audio}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Coaching Broadcast Feed */}
        <div className="bg-white rounded-2xl p-6 md:p-8">
          <h4 className="text-center mb-6" style={{
            fontFamily: 'Libre Baskerville, serif',
            fontWeight: '400',
            color: '#101827',
            fontSize: '1.5rem'
          }}>
            Coaching Broadcast Feed
          </h4>
          <ul className="space-y-3">
            {BROADCAST_FEED.map((item, index) => (
              <li key={index} className="flex items-start gap-3" style={{
                fontFamily: 'Inter, sans-serif',
                color: '#6D6B6B',
                fontSize: '1rem'
              }}>
                <span style={{ color: '#B8860B', fontWeight: '500' }}>॥</span>
                <span><strong style={{ color: '#101827' }}>Broadcast:</strong> - {item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center mb-16">
        <button
          onClick={handleBuyClick}
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          style={{
            backgroundColor: '#4D1E22',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          Get the Course — $297
        </button>
      </div>

      {/* Who This Is For / Not For - Side by Side */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Who this is for */}
        <div className="bg-white rounded-2xl p-6 md:p-8">
          <h3 className="text-center mb-6" style={{
            fontFamily: 'Libre Baskerville, serif',
            fontWeight: '400',
            color: '#101827',
            letterSpacing: '-0.02em',
            fontSize: '1.5rem'
          }}>
            Who this is for
          </h3>
          <ul className="space-y-4">
            {WHO_THIS_IS_FOR.map((item, index) => (
              <li key={index} className="flex items-start gap-3" style={{
                fontFamily: 'Inter, sans-serif',
                color: '#6D6B6B',
                fontSize: '0.9375rem',
                lineHeight: '1.5'
              }}>
                <span className="mt-0.5 flex-shrink-0" style={{ color: '#22C55E', fontSize: '1.1rem' }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Who this is NOT for */}
        <div className="bg-white rounded-2xl p-6 md:p-8">
          <h3 className="text-center mb-6" style={{
            fontFamily: 'Libre Baskerville, serif',
            fontWeight: '400',
            color: '#101827',
            letterSpacing: '-0.02em',
            fontSize: '1.5rem'
          }}>
            Who this is NOT for
          </h3>
          <ul className="space-y-4">
            {WHO_THIS_IS_NOT_FOR.map((item, index) => (
              <li key={index} className="flex items-start gap-3" style={{
                fontFamily: 'Inter, sans-serif',
                color: '#6D6B6B',
                fontSize: '0.9375rem',
                lineHeight: '1.5'
              }}>
                <span className="mt-0.5 flex-shrink-0" style={{ color: '#DC2626', fontSize: '1.1rem' }}>✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <h3 className="text-center mb-8" style={{
          fontFamily: 'Libre Baskerville, serif',
          fontWeight: '400',
          color: '#101827',
          letterSpacing: '-0.02em',
          fontSize: '24px'
        }}>
          Frequently Asked Questions
        </h3>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <span style={{ color: '#101827', fontWeight: '500' }}>{item.question}</span>
                <span style={{ color: '#4D1E22', fontSize: '1.5rem', fontWeight: '300' }}>
                  {openFaq === index ? '−' : '+'}
                </span>
              </button>
              {openFaq === index && (
                <div className="px-6 pb-4" style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#6D6B6B',
                  fontSize: '0.9375rem',
                  lineHeight: '1.6'
                }}>
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="text-center py-12 px-8 rounded-2xl mb-8" style={{ backgroundColor: '#4D1E22' }}>
        <h3 className="mb-4" style={{
          fontFamily: 'Libre Baskerville, serif',
          fontWeight: '400',
          color: 'white',
          fontSize: '28px',
          lineHeight: '1.3'
        }}>
          Desensitize Your Nervous System and Get Your Life Back
        </h3>
        <p className="mb-6" style={{
          fontFamily: 'Inter, sans-serif',
          color: 'rgba(255,255,255,0.8)',
          fontSize: '1.0625rem',
          maxWidth: '500px',
          margin: '0 auto 1.5rem'
        }}>
          Learn what's actually keeping you stuck and how to create real safety in your body.
        </p>
        <button
          onClick={handleBuyClick}
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
          style={{
            backgroundColor: 'white',
            color: '#4D1E22',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          Get the Course — $297
        </button>
        <p className="mt-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif' }}>
          One-time payment • Lifetime access • Instant delivery
        </p>
      </div>
    </div>
  );
}
