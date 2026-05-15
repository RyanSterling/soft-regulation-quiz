/**
 * 1:1 Business Coaching Application - Landing Page Content
 * Content adapted from sales_page_draft_v3.md
 */

export const LANDING_CONTENT = {
  // Hero section
  hero: {
    eyebrow: 'Private 1:1 Coaching',
    headline: "For creators and leaders with a public presence and a nervous system that's falling apart.",
    subhead: 'A 3-month private container for online business owners, content creators, and helping professionals who are running successful businesses while privately dealing with chronic nervous system symptoms. Strategic business coaching meets nervous system work.',
    ctaText: 'Apply Now'
  },

  // The Opening - emotional hook
  opening: {
    paragraphs: [
      "You're not the person who can step away to heal.",
      "You can't cancel on clients. You can't not get your team what they need. You don't have the luxury of pausing. You are the face of the business, and the business doesn't run if you're not running.",
      "In the middle of trying to handle everything your business requires of you, your body started screaming. And it hasn't stopped.",
      "Anxiety. Panic. Dissociation. Pain. Symptoms you can't ignore anymore.",
      "You've tried therapy, books, courses. You probably understand the nervous system intellectually. You might even teach this stuff to your own clients.",
      "What you don't know is how to keep building without paying the price through your body. Or whether the business you've built is even the one you should be scaling."
    ],
    closing: "That's what this is for."
  },

  // Who this is for
  whoFor: {
    headline: 'This Is For You If...',
    items: [
      'You run an online business, have a public-facing brand, or work in a helping profession (therapist, coach, somatic practitioner, healthcare provider)',
      'Your work involves visibility, and you create content, serve clients, or lead in ways that put your name and face out there',
      "You're experiencing symptoms that are affecting your capacity to work, and you're not sure how much longer you can push through",
      "You're stressed about showing up and staying visible, and the content grind feels harder than it used to",
      "You want strategic help on visibility, content, and scaling"
    ],
    note: "People come to me because they want to keep building without it costing them their body."
  },

  // Who this is NOT for
  notFor: {
    headline: 'Who This Is Not For',
    intro: "I want to be honest about this because the wrong fit doesn't help anyone:",
    items: [
      {
        bold: "This is for people running businesses or practices.",
        text: "If you don't currently run an online business, have a public-facing brand, or work in a helping profession (e.g. therapist, coach, somatic practitioner), this container isn't designed for you."
      },
      {
        bold: "This includes business coaching.",
        text: "If you're only looking for nervous system support without the business component, <a href='https://www.maggiesterling.com/soft-regulation' target='_blank' rel='noopener noreferrer' style='color: #9C8B75; text-decoration: underline;'>my course</a> is the right fit. This container is for people who want both."
      },
      {
        bold: "This isn't a set curriculum or step-by-step program.",
        text: "The work is custom to you and where you're at."
      }
    ]
  },

  // ROI note (hidden - kept for component compatibility)
  roi: {
    headline: '',
    paragraphs: []
  },

  // About Maggie
  about: {
    headline: 'About Maggie',
    paragraphs: [
      "I've been coaching for six years. Thousands of people, across weight loss, overeating, behavior change, and now nervous system work.",
      "Business owners and high-capacity people were always the ones drawn to me. I learned early how to work with people who couldn't afford to fall apart."
    ],
    breakdown: {
      intro: "Then I fell apart.",
      text: "In the middle of running a multiple six-figure business, with a family and a public platform, I had a full-blown mental breakdown. I didn't have the option to stop. I had to recalibrate my entire nervous system while continuing to show up in real time in public with content to post and clients to coach."
    },
    closing: "That's the work I'm bringing to this container: the mindset and identity work that makes business sustainable, plus nervous system desensitization and resilience."
  },

  // Track Record - credibility section
  trackRecord: {
    headline: 'The Track Record',
    intro: "I'm not just a 'coach who coaches coaches'. I've built successful businesses in multiple B2C niches.",
    niches: [
      {
        name: 'Weight Loss & Behavior Change',
        tiktokImage: '/assets/track-record/wl-tiktok.png',
        instagramImage: '/assets/track-record/wl-instagram.png'
      },
      {
        name: 'Nervous System & Mental Health',
        tiktokImage: '/assets/track-record/ns-tiktok.png',
        instagramImage: '/assets/track-record/ns-instagram.png'
      }
    ],
    // YouTube - prominent because this is harder than social
    youtubeStat: '50,000',
    youtubeLabel: 'subscribers in 7 months',
    youtubeImage: '/assets/track-record/youtube-stat.png',
    youtubeNote: 'YouTube is where people actually get to know you. It\'s harder to grow, but it\'s where trust builds.',
    // Podcast
    podcastStat: '3,000,000+',
    podcastLabel: 'podcast downloads',
    podcastImage: '/assets/track-record/podcast-stat.png',
    businessStats: [
      {
        stat: '6 & 7 Figure',
        label: 'businesses built'
      },
      {
        stat: '95%',
        label: 'profit margins'
      },
      {
        stat: '100%',
        label: 'organic content'
      },
      {
        stat: 'Zero',
        label: 'paid ads'
      }
    ],
    closing: ""
  },

  // The Container - what's included
  container: {
    headline: 'The Container',
    duration: 'Three months, 1:1',
    // Simple logistics
    logistics: [
      {
        title: '12 private coaching calls',
        description: '45 minutes each'
      },
      {
        title: 'Direct WhatsApp access',
        description: 'For when something comes up between sessions'
      }
    ],
    logisticsNote: '',
    // What we can work on together
    scopeHeadline: 'What We Can Work On',
    scopeIntro: "The work is custom. We focus on what's actually in the way.",
    scopeItems: [
      'Working through sensitization symptoms without putting your business on hold',
      'Learning to regulate in real-time while you\'re in the middle of the work',
      'Figuring out what you actually want to build (and what needs to go)',
      'Making strategic decisions from clarity instead of survival mode',
      'Content and visibility that doesn\'t cost you your nervous system',
      'Building a business that doesn\'t require you to be in survival mode to run it'
    ],
    scopeClosing: ''
  },

  // Investment
  investment: {
    headline: 'Investment',
    price: '$5,500',
    note: "I'm not a salesperson, and I'm not going to surprise you with a number on a discovery call. If $5,500 isn't a clear yes for you right now, don't apply yet. Take the course, do the work, build the business, and come back when this is the obvious next step.",
    closing: "If it is a clear yes, keep going."
  },

  // Process
  process: {
    headline: 'The Process',
    steps: [
      {
        number: '1',
        title: 'Apply',
        description: 'Fill out the application below. It takes about 5 minutes.'
      },
      {
        number: '2',
        title: 'Discovery call',
        description: "If we're a fit on paper, I'll personally reach out to schedule a call. This is a real conversation about what you need and what I can offer, not a sales pitch."
      },
      {
        number: '3',
        title: 'Enroll',
        description: "If we both decide this is the right work, I'll get you onboarded directly. I handle this myself, and there's no automatic checkout or funnel."
      }
    ],
    note: 'I review every application personally. Expect to hear back within 5 business days.'
  },

  // FAQ
  faq: {
    headline: 'FAQ',
    items: [
      {
        question: 'Is this therapy?',
        answer: "No. I'm not a licensed therapist, and this is not a substitute for mental health care. Many of my clients work with a therapist alongside this container."
      },
      {
        question: 'Will you give medical advice?',
        answer: "No. I don't diagnose, treat, or give medical guidance. If you need medical support, that's a doctor's job."
      },
      {
        question: 'How is this different from your course?',
        answer: "The course teaches the foundational frameworks for understanding sensitization and beginning to recover. This container is for business owners who already have language for what they're experiencing and need help building a business that doesn't require them to abandon themselves to run it."
      },
      {
        question: 'What if I just need help with sensitization?',
        answer: "Take the course. It's the right tool for the job, and this container isn't designed for that."
      },
      {
        question: "What if I'm not sure I qualify?",
        answer: "Apply. The form itself will tell you a lot. If we're not a fit, I'll say so, and I may point you somewhere that is."
      },
      {
        question: "Can I apply if I don't have a business yet?",
        answer: "This container is built for people who are already running a business or practice. If you're still in the building phase, this isn't the right fit yet—but the course is a great place to start."
      }
    ]
  },

  // Footer CTA
  footerCta: {
    headline: 'Ready to Apply?',
    subhead: 'Applications are reviewed personally within 5 business days.',
    ctaText: 'Apply Now'
  }
};

// "Not Ready" page content
export const NOT_READY_CONTENT = {
  headline: "Not Ready Yet? That's Okay.",
  body: "This is a significant investment, and it should feel like a clear yes before you apply. When you're ready, financially and otherwise, come back and fill out the application. The offer will be here.",
  ctaText: 'Back to Homepage',
  ctaUrl: 'https://maggiesterling.com'
};
