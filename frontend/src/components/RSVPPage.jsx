import { useState, useEffect } from 'react';
import { getActiveEvent, saveRSVP } from '../lib/supabase';

// Design system matching the quiz
const colors = {
  cream: '#FAF8F5',
  creamDark: '#F0EDE8',
  olive: '#9C8B75',
  oliveMuted: 'rgba(156, 139, 117, 0.15)',
  black: '#1A1A1A',
  muted: '#6B6B6B',
  white: '#FFFFFF',
  error: '#DC2626',
  success: '#059669',
};

export default function RSVPPage() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
  });

  // Get UTM params from URL
  const getUtmParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || null,
      utm_campaign: params.get('utm_campaign') || null,
    };
  };

  useEffect(() => {
    async function fetchEvent() {
      const { data, error } = await getActiveEvent();
      if (!error && data) {
        setEvent(data);
      }
      setLoading(false);
    }
    fetchEvent();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Basic validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      setSubmitting(false);
      return;
    }

    const utmParams = getUtmParams();

    const { error: saveError } = await saveRSVP({
      event_id: event.id,
      name: formData.name.trim(),
      ...utmParams,
    });

    if (saveError) {
      setError(saveError.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  // Loading state
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.cream }}
      >
        <div
          className="animate-pulse"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '1.5rem',
            color: colors.muted,
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  // No active event state
  if (!event) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: colors.cream }}
      >
        <div className="max-w-lg text-center">
          <h1
            className="mb-6"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: '500',
              fontSize: 'clamp(2rem, 5vw, 2.75rem)',
              color: colors.black,
              lineHeight: '1.2',
            }}
          >
            No Upcoming Events
          </h1>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              color: colors.muted,
              fontSize: '1.0625rem',
              lineHeight: '1.8',
            }}
          >
            There are no live Q&A sessions scheduled right now. Check back soon
            or keep an eye on your email for announcements!
          </p>
          <p
            className="mt-8"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              color: colors.olive,
              fontSize: '1.125rem',
            }}
          >
            xo Maggie
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: colors.cream }}
      >
        <div className="max-w-lg text-center">
          <div
            className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full"
            style={{ backgroundColor: colors.oliveMuted }}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke={colors.olive}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1
            className="mb-4"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: '500',
              fontSize: 'clamp(2rem, 5vw, 2.75rem)',
              color: colors.black,
              lineHeight: '1.2',
            }}
          >
            You're In, {formData.name}!
          </h1>
          <p
            className="mb-6"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: colors.muted,
              fontSize: '1.0625rem',
              lineHeight: '1.8',
            }}
          >
            We'll send the Zoom link to{' '}
            <span style={{ color: colors.black, fontWeight: '500' }}>
              the email you used to purchase the course
            </span>{' '}
            24 hours before the call, and again as it's starting.
          </p>
          <div
            className="p-6 mb-6"
            style={{
              backgroundColor: colors.white,
              border: `1px solid ${colors.creamDark}`,
            }}
          >
            <p
              className="mb-2"
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: '500',
                color: colors.black,
                fontSize: '1.25rem',
              }}
            >
              {event.title}
            </p>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                color: colors.muted,
                fontSize: '0.9375rem',
              }}
            >
              {event.time_pacific} / {event.time_eastern} / {event.time_uk} /{' '}
              {event.time_europe}
            </p>
          </div>
          <p
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              color: colors.olive,
              fontSize: '1.125rem',
            }}
          >
            Looking forward to being with you live.
          </p>
          <p
            className="mt-4"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              color: colors.olive,
              fontSize: '1.125rem',
            }}
          >
            xo Maggie
          </p>
        </div>
      </div>
    );
  }

  // Format date for display
  const eventDate = new Date(event.event_date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Main RSVP form
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.cream }}>
      <div className="max-w-2xl mx-auto px-6 py-16 lg:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <p
            className="mb-4"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              fontSize: '1.25rem',
              color: colors.olive,
            }}
          >
            you're invited
          </p>
          <h1
            className="mb-6"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontWeight: '500',
              fontSize: 'clamp(2rem, 5vw, 2.75rem)',
              color: colors.black,
              lineHeight: '1.2',
              letterSpacing: '-0.02em',
            }}
          >
            {event.title}
          </h1>
        </div>

        {/* Event Details Card */}
        <div
          className="p-8 mb-10"
          style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.creamDark}`,
          }}
        >
          <div className="text-center mb-6">
            <p
              className="mb-2"
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontWeight: '500',
                color: colors.black,
                fontSize: '1.375rem',
              }}
            >
              {formattedDate}
            </p>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                color: colors.muted,
                fontSize: '1rem',
                lineHeight: '1.6',
              }}
            >
              {event.time_pacific} / {event.time_eastern}
              <br />
              {event.time_uk} / {event.time_europe}
            </p>
          </div>

          {event.description && (
            <p
              className="text-center mb-6"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: colors.muted,
                fontSize: '0.9375rem',
                lineHeight: '1.75',
              }}
            >
              {event.description}
            </p>
          )}

          <p
            className="text-center"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: colors.muted,
              fontSize: '0.875rem',
              lineHeight: '1.7',
            }}
          >
            Zoom link sent 24 hours before and again as it starts.
            <br />
            Can't make it? The replay will be in your coaching feed.
          </p>
        </div>

        {/* RSVP Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <div>
              <label
                htmlFor="name"
                className="block mb-2"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: colors.muted,
                  fontSize: '0.875rem',
                }}
              >
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border rounded-none focus:outline-none focus:ring-2"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  borderColor: colors.creamDark,
                  backgroundColor: colors.white,
                  fontSize: '1rem',
                }}
                placeholder="First name is fine"
              />
            </div>
          </div>

          {error && (
            <p
              className="mb-4 text-center"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: colors.error,
                fontSize: '0.9375rem',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              fontSize: '1rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              backgroundColor: colors.olive,
              color: colors.white,
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Submitting...' : 'RSVP Now'}
          </button>
        </form>

        {/* Closing */}
        <p
          className="text-center mt-10"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            color: colors.olive,
            fontSize: '1.125rem',
          }}
        >
          Looking forward to being with you live.
        </p>
        <p
          className="text-center mt-3"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic',
            color: colors.olive,
            fontSize: '1.125rem',
          }}
        >
          xo Maggie
        </p>
      </div>
    </div>
  );
}
