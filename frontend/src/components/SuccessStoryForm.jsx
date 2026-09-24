import { useState } from 'react';
import { supabase } from '../lib/supabase';

// Match Maggie's brand colors
const colors = {
  cream: '#FAF9F7',
  creamDark: '#E8E6E3',
  white: '#FFFFFF',
  black: '#1E1F1C',
  olive: '#545B47',
  muted: '#6D6B6B',
  error: '#DC2626',
  success: '#059669',
};

export default function SuccessStoryForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    life_before: '',
    life_now: '',
    recovery_status: '',
    camera_consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.life_before || !formData.life_now || !formData.recovery_status) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.camera_consent) {
      setError('Please confirm you are comfortable being on camera');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: dbError } = await supabase
        .from('success_stories')
        .insert([{
          name: formData.name,
          email: formData.email,
          life_before: formData.life_before,
          life_now: formData.life_now,
          recovery_status: formData.recovery_status,
          camera_consent: formData.camera_consent,
        }]);

      if (dbError) throw dbError;

      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: colors.cream }}>
        <div className="max-w-md w-full p-8 text-center" style={{ backgroundColor: colors.white }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${colors.success}20` }}>
            <svg className="w-8 h-8" fill="none" stroke={colors.success} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: colors.black }}>
            Thank you!
          </h2>
          <p className="mb-6" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted, lineHeight: '1.75' }}>
            Your success story has been submitted. Maggie will review it and reach out if it's a good fit for the channel.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 font-medium transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: colors.olive, color: colors.white, fontFamily: 'Inter, sans-serif' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: colors.cream }}>
      <div className="max-w-3xl mx-auto">
        <div className="p-8" style={{ backgroundColor: colors.white }}>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: colors.black, letterSpacing: '-0.02em' }}>
            Share Your Success Story
          </h1>
          <p className="mb-8" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted, fontSize: '1.125rem', lineHeight: '1.75' }}>
            Have you made progress with Soft Regulation? Maggie would love to hear from you and potentially feature your story on YouTube!
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                Name <span style={{ color: colors.error }}>*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3"
                style={{
                  backgroundColor: colors.creamDark,
                  border: `1px solid ${colors.creamDark}`,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1rem',
                  color: colors.black,
                  outline: 'none'
                }}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                Email <span style={{ color: colors.error }}>*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3"
                style={{
                  backgroundColor: colors.creamDark,
                  border: `1px solid ${colors.creamDark}`,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1rem',
                  color: colors.black,
                  outline: 'none'
                }}
                required
              />
            </div>

            {/* Life Before */}
            <div>
              <label htmlFor="life_before" className="block mb-2 text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                What was life like when you started the course? <span style={{ color: colors.error }}>*</span>
              </label>
              <p className="text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                A few sentences is perfect. Specifics help, like what you were avoiding or what your days looked like.
              </p>
              <textarea
                id="life_before"
                name="life_before"
                value={formData.life_before}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 resize-none"
                style={{
                  backgroundColor: colors.creamDark,
                  border: `1px solid ${colors.creamDark}`,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1rem',
                  color: colors.black,
                  outline: 'none'
                }}
                required
              />
            </div>

            {/* Life Now */}
            <div>
              <label htmlFor="life_now" className="block mb-2 text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                What's life like now? <span style={{ color: colors.error }}>*</span>
              </label>
              <p className="text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                What's different day to day? What can you do now that you couldn't do before? Things like trips, work, activities, or everyday stuff that used to feel hard.
              </p>
              <textarea
                id="life_now"
                name="life_now"
                value={formData.life_now}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 resize-none"
                style={{
                  backgroundColor: colors.creamDark,
                  border: `1px solid ${colors.creamDark}`,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1rem',
                  color: colors.black,
                  outline: 'none'
                }}
                required
              />
            </div>

            {/* Recovery Status */}
            <div>
              <label htmlFor="recovery_status" className="block mb-2 text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                How are you doing these days? <span style={{ color: colors.error }}>*</span>
              </label>
              <select
                id="recovery_status"
                name="recovery_status"
                value={formData.recovery_status}
                onChange={handleChange}
                className="w-full px-4 py-3"
                style={{
                  backgroundColor: colors.creamDark,
                  border: `1px solid ${colors.creamDark}`,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1rem',
                  color: formData.recovery_status ? colors.black : colors.muted,
                  outline: 'none'
                }}
                required
              >
                <option value="">Select an option</option>
                <option value="mostly_recovered">Mostly recovered</option>
                <option value="doing_well">Doing well with occasional setbacks</option>
                <option value="still_working">Still working through it</option>
              </select>
            </div>

            {/* Camera Consent */}
            <div className="p-4" style={{ backgroundColor: `${colors.olive}10`, border: `1px solid ${colors.olive}30` }}>
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  name="camera_consent"
                  checked={formData.camera_consent}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 cursor-pointer"
                  style={{ accentColor: colors.olive }}
                  required
                />
                <span className="ml-3 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: colors.black }}>
                  I'm comfortable being on camera in an interview that will be published on YouTube. <span style={{ color: colors.error }}>*</span>
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4" style={{ backgroundColor: `${colors.error}10`, border: `1px solid ${colors.error}30` }}>
                <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: colors.error }}>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: colors.olive,
                color: colors.white,
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit My Story'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
          Your information will only be used to contact you about potentially featuring your story on YouTube.
        </p>
      </div>
    </div>
  );
}
