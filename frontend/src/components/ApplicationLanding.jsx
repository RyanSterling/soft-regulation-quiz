import { Link } from 'react-router-dom';
import { LANDING_CONTENT } from '../data/applicationContent';

// ============================================
// DESIGN SYSTEM - Inspired by reference images
// ============================================
const colors = {
  cream: '#FAF8F5',
  creamDark: '#F0EDE8',
  olive: '#9C8B75',
  oliveMuted: 'rgba(156, 139, 117, 0.15)',
  black: '#1A1A1A',
  muted: '#6B6B6B',
  white: '#FFFFFF',
};

// ============================================
// COMPONENTS
// ============================================

function ScriptText({ children, className = '' }) {
  return (
    <span
      className={className}
      style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontStyle: 'italic',
        fontWeight: '400',
      }}
    >
      {children}
    </span>
  );
}

function SectionHeading({ children, script, className = '' }) {
  return (
    <div className={`mb-10 ${className}`}>
      {script && (
        <p
          className="mb-2"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            fontSize: '1.25rem',
            color: colors.olive,
          }}
        >
          {script}
        </p>
      )}
      <h2
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontWeight: '500',
          color: colors.black,
          fontSize: 'clamp(2rem, 5vw, 2.75rem)',
          lineHeight: '1.15',
          letterSpacing: '-0.02em',
        }}
      >
        {children}
      </h2>
    </div>
  );
}

function BodyText({ children, className = '' }) {
  return (
    <p
      className={className}
      style={{
        fontFamily: 'Inter, sans-serif',
        color: colors.muted,
        fontSize: '1rem',
        lineHeight: '1.85',
      }}
    >
      {children}
    </p>
  );
}

function CTAButton({ to, children, variant = 'primary' }) {
  const styles = {
    primary: {
      backgroundColor: colors.olive,
      color: colors.white,
    },
    secondary: {
      backgroundColor: colors.white,
      color: colors.olive,
      border: `1px solid ${colors.olive}`,
    },
  };

  return (
    <Link
      to={to}
      className="inline-block px-8 py-4 text-sm tracking-wider uppercase transition-all duration-300 hover:opacity-90"
      style={{
        ...styles[variant],
        fontFamily: 'Inter, sans-serif',
        fontWeight: '500',
        textDecoration: 'none',
        letterSpacing: '0.1em',
      }}
    >
      {children}
    </Link>
  );
}

// Scrolling Marquee Component
function Marquee() {
  const items = [
    'Strategic Business Coaching',
    'Nervous System Regulation',
    'Embodied Leadership',
    'Sustainable Scaling',
  ];

  return (
    <div
      className="py-4 overflow-hidden"
      style={{ backgroundColor: colors.olive }}
    >
      <div className="marquee-track flex whitespace-nowrap animate-marquee">
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            className="mx-8 text-sm tracking-widest uppercase"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: colors.white,
              fontWeight: '500',
            }}
          >
            {item}
            <span className="mx-8 opacity-50">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ApplicationLanding() {
  const content = LANDING_CONTENT;

  return (
    <div style={{ backgroundColor: colors.cream }}>
      {/* ============================================ */}
      {/* HERO SECTION - Asymmetric Editorial Layout */}
      {/* ============================================ */}
      <section className="min-h-screen relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 min-h-screen">
            {/* Left: Image */}
            <div className="relative order-2 lg:order-1">
              <div className="lg:absolute lg:inset-0 lg:-left-20">
                <img
                  src="/assets/maggie-1.jpg"
                  alt="Maggie Sterling"
                  className="w-full h-[60vh] lg:h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Right: Content */}
            <div className="order-1 lg:order-2 flex items-center px-6 lg:px-16 py-20 lg:py-0">
              <div className="max-w-xl">
                <p
                  className="mb-6"
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontStyle: 'italic',
                    fontSize: '1.375rem',
                    color: colors.olive,
                  }}
                >
                  {content.hero.eyebrow}
                </p>

                <h1
                  className="mb-8"
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontWeight: '500',
                    color: colors.black,
                    fontSize: 'clamp(2.25rem, 4vw, 3.25rem)',
                    lineHeight: '1.15',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {content.hero.headline}
                </h1>

                <p
                  className="mb-10"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: colors.muted,
                    fontSize: '1.0625rem',
                    lineHeight: '1.8',
                  }}
                >
                  {content.hero.subhead}
                </p>

                <CTAButton to="/apply/form">{content.hero.ctaText}</CTAButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Banner */}
      <Marquee />

      {/* ============================================ */}
      {/* THE OPENING */}
      {/* ============================================ */}
      <section className="py-24 lg:py-32 px-6" style={{ backgroundColor: colors.white }}>
        <div className="max-w-3xl mx-auto">
          <p
            className="mb-12"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              color: colors.black,
              lineHeight: '1.4',
            }}
          >
            {content.opening.paragraphs[0]}
          </p>

          {content.opening.paragraphs.slice(1).map((paragraph, index) => (
            <BodyText key={index} className="mb-6">
              {paragraph}
            </BodyText>
          ))}

          <p
            className="mt-12 pt-8"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              fontSize: '1.5rem',
              color: colors.olive,
              borderTop: `1px solid ${colors.creamDark}`,
            }}
          >
            {content.opening.closing}
          </p>
        </div>
      </section>


      {/* ============================================ */}
      {/* WHO THIS IS FOR */}
      {/* ============================================ */}
      <section className="py-24 lg:py-32 px-6" style={{ backgroundColor: colors.cream }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left: Content */}
            <div>
              <SectionHeading script="the right fit">
                {content.whoFor.headline}
              </SectionHeading>

              <ul className="space-y-5">
                {content.whoFor.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span
                      className="flex-shrink-0 mt-1.5"
                      style={{ color: colors.olive, fontSize: '0.75rem' }}
                    >
                      ◆
                    </span>
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: colors.muted,
                        lineHeight: '1.75',
                      }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <div
                className="mt-10 p-6"
                style={{
                  backgroundColor: colors.oliveMuted,
                  borderLeft: `3px solid ${colors.olive}`,
                }}
              >
                <p
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontStyle: 'italic',
                    color: colors.black,
                    fontSize: '1.0625rem',
                    lineHeight: '1.7',
                  }}
                >
                  {content.whoFor.note}
                </p>
              </div>
            </div>

            {/* Right: Image */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <img
                  src="/assets/maggie-6.jpg"
                  alt="Maggie Sterling"
                  className="w-full object-cover"
                  style={{ aspectRatio: '3/4' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* WHO THIS IS NOT FOR */}
      {/* ============================================ */}
      <section className="py-24 lg:py-32 px-6" style={{ backgroundColor: colors.white }}>
        <div className="max-w-3xl mx-auto">
          <SectionHeading script="a note on fit" className="text-center">
            {content.notFor.headline}
          </SectionHeading>

          <BodyText className="text-center mb-12">
            {content.notFor.intro}
          </BodyText>

          <div className="space-y-6">
            {content.notFor.items.map((item, index) => (
              <div
                key={index}
                className="p-6"
                style={{
                  backgroundColor: colors.cream,
                  border: `1px solid ${colors.creamDark}`,
                }}
              >
                <p
                  className="mb-2"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '600',
                    color: colors.black,
                    fontSize: '1rem',
                  }}
                >
                  {item.bold}
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: colors.muted,
                    fontSize: '1rem',
                    lineHeight: '1.7',
                  }}
                  dangerouslySetInnerHTML={{ __html: item.text }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* THE WORK */}
      {/* ============================================ */}
      <section className="py-24 lg:py-32 px-6" style={{ backgroundColor: colors.cream }}>
        <div className="max-w-5xl mx-auto">
          <SectionHeading script="the work" className="text-center">
            {content.theWork.headline}
          </SectionHeading>

          <div className="max-w-3xl mx-auto mb-16">
            <BodyText className="mb-4">{content.theWork.intro}</BodyText>
            <p
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontStyle: 'italic',
                color: colors.black,
                fontSize: '1.125rem',
                lineHeight: '1.6',
              }}
            >
              {content.theWork.question}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Business Side */}
            <div
              className="p-8 lg:p-10"
              style={{ backgroundColor: colors.white }}
            >
              <h3
                className="mb-6 pb-4"
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontWeight: '500',
                  color: colors.black,
                  fontSize: '1.5rem',
                  borderBottom: `1px solid ${colors.creamDark}`,
                }}
              >
                {content.theWork.businessSide.headline}
              </h3>
              <ul className="space-y-4">
                {content.theWork.businessSide.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span style={{ color: colors.olive }}>—</span>
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: colors.muted,
                        fontSize: '0.9375rem',
                        lineHeight: '1.7',
                      }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Embodied Side */}
            <div
              className="p-8 lg:p-10"
              style={{ backgroundColor: colors.white }}
            >
              <h3
                className="mb-6 pb-4"
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontWeight: '500',
                  color: colors.black,
                  fontSize: '1.5rem',
                  borderBottom: `1px solid ${colors.creamDark}`,
                }}
              >
                {content.theWork.embodiedSide.headline}
              </h3>
              <ul className="space-y-4">
                {content.theWork.embodiedSide.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span style={{ color: colors.olive }}>—</span>
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: colors.muted,
                        fontSize: '0.9375rem',
                        lineHeight: '1.7',
                      }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p
            className="text-center mt-12 py-6 px-8"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              color: colors.black,
              fontSize: '1.25rem',
              lineHeight: '1.5',
              backgroundColor: colors.oliveMuted,
            }}
          >
            {content.theWork.closing}
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* ABOUT MAGGIE */}
      {/* ============================================ */}
      <section className="py-24 lg:py-32 px-6" style={{ backgroundColor: colors.white }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div className="order-2 lg:order-1">
              <SectionHeading script="about">
                {content.about.headline}
              </SectionHeading>

              {content.about.paragraphs.map((paragraph, index) => (
                <BodyText key={index} className="mb-5">
                  {paragraph}
                </BodyText>
              ))}

              <div
                className="mt-10 pt-8"
                style={{ borderTop: `1px solid ${colors.creamDark}` }}
              >
                <p
                  className="mb-4"
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontStyle: 'italic',
                    color: colors.black,
                    fontSize: '1.375rem',
                  }}
                >
                  {content.about.breakdown.intro}
                </p>
                <BodyText>{content.about.breakdown.text}</BodyText>
              </div>

              <p
                className="mt-8 pt-6"
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  color: colors.olive,
                  fontSize: '1.125rem',
                  lineHeight: '1.6',
                  borderTop: `1px solid ${colors.creamDark}`,
                }}
              >
                {content.about.closing}
              </p>
            </div>

            {/* Photo */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <img
                  src="/assets/maggie-18.jpg"
                  alt="Maggie Sterling"
                  className="w-full object-cover"
                  style={{ aspectRatio: '4/5' }}
                />
                {/* Decorative frame */}
                <div
                  className="absolute -bottom-4 -right-4 w-full h-full -z-10"
                  style={{ border: `1px solid ${colors.olive}` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* ROI NOTE */}
      {/* ============================================ */}
      <section
        className="py-24 lg:py-32 px-6"
        style={{ backgroundColor: colors.olive }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="mb-8"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: '500',
              color: colors.white,
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              lineHeight: '1.2',
            }}
          >
            {content.roi.headline}
          </h2>

          {content.roi.paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="mb-5"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '1rem',
                lineHeight: '1.85',
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* ============================================ */}
      {/* THE CONTAINER */}
      {/* ============================================ */}
      <section className="py-24 lg:py-32 px-6" style={{ backgroundColor: colors.cream }}>
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeading script="what's included" className="text-center">
            {content.container.headline}
          </SectionHeading>

          <p
            className="mb-12"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              color: colors.olive,
              fontSize: '1.5rem',
            }}
          >
            {content.container.duration}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.container.items.map((item, index) => (
              <div
                key={index}
                className="p-6 text-center"
                style={{
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.creamDark}`,
                }}
              >
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: colors.muted,
                    fontSize: '0.9375rem',
                    lineHeight: '1.6',
                  }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* INVESTMENT */}
      {/* ============================================ */}
      <section className="py-24 lg:py-32 px-6" style={{ backgroundColor: colors.white }}>
        <div className="max-w-3xl mx-auto text-center">
          <SectionHeading script="investment" className="text-center">
            {content.investment.headline}
          </SectionHeading>

          <p
            className="mb-8"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              color: colors.black,
              fontSize: 'clamp(3.5rem, 10vw, 5rem)',
              fontWeight: '400',
              letterSpacing: '-0.02em',
            }}
          >
            {content.investment.price}
          </p>

          <p
            className="mb-10 max-w-xl mx-auto"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: colors.muted,
              fontSize: '1rem',
              lineHeight: '1.85',
            }}
          >
            {content.investment.note}
          </p>

          <p
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              color: colors.olive,
              fontSize: '1.25rem',
            }}
          >
            {content.investment.closing}
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* THE PROCESS */}
      {/* ============================================ */}
      <section className="py-24 lg:py-32 px-6" style={{ backgroundColor: colors.cream }}>
        <div className="max-w-4xl mx-auto">
          <SectionHeading script="next steps" className="text-center">
            {content.process.headline}
          </SectionHeading>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {content.process.steps.map((step, index) => (
              <div key={index} className="text-center">
                <div
                  className="w-14 h-14 mx-auto mb-5 flex items-center justify-center"
                  style={{
                    border: `1px solid ${colors.olive}`,
                    borderRadius: '50%',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      color: colors.olive,
                      fontSize: '1.5rem',
                    }}
                  >
                    {step.number}
                  </span>
                </div>
                <h3
                  className="mb-3"
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontWeight: '500',
                    color: colors.black,
                    fontSize: '1.375rem',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: colors.muted,
                    fontSize: '0.9375rem',
                    lineHeight: '1.7',
                  }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <p
            className="text-center mt-12"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              color: colors.olive,
              fontSize: '1.0625rem',
            }}
          >
            {content.process.note}
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* FAQ */}
      {/* ============================================ */}
      <section className="py-24 lg:py-32 px-6" style={{ backgroundColor: colors.white }}>
        <div className="max-w-3xl mx-auto">
          <SectionHeading script="questions" className="text-center">
            {content.faq.headline}
          </SectionHeading>

          <div className="space-y-4 mt-12">
            {content.faq.items.map((item, index) => (
              <details key={index} className="group">
                <summary
                  className="flex items-center justify-between p-6 cursor-pointer list-none"
                  style={{
                    backgroundColor: colors.cream,
                    fontFamily: 'Cormorant Garamond, serif',
                    fontWeight: '500',
                    color: colors.black,
                    fontSize: '1.125rem',
                  }}
                >
                  {item.question}
                  <span
                    className="ml-4 transition-transform duration-200 group-open:rotate-45"
                    style={{ color: colors.olive }}
                  >
                    +
                  </span>
                </summary>
                <div
                  className="px-6 pb-6 -mt-1"
                  style={{ backgroundColor: colors.cream }}
                >
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      color: colors.muted,
                      fontSize: '0.9375rem',
                      lineHeight: '1.7',
                    }}
                  >
                    {item.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER CTA */}
      {/* ============================================ */}
      <section
        className="py-28 lg:py-36 px-6"
        style={{ backgroundColor: colors.olive }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p
            className="mb-4"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              color: 'rgba(255, 255, 255, 0.75)',
              fontSize: '1.25rem',
            }}
          >
            ready to begin?
          </p>

          <h2
            className="mb-6"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: '500',
              color: colors.white,
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              lineHeight: '1.15',
            }}
          >
            {content.footerCta.headline}
          </h2>

          <p
            className="mb-10"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: 'rgba(255, 255, 255, 0.75)',
              fontSize: '1rem',
            }}
          >
            {content.footerCta.subhead}
          </p>

          <CTAButton to="/apply/form" variant="secondary">
            {content.footerCta.ctaText}
          </CTAButton>
        </div>
      </section>
    </div>
  );
}
