import { useState, useEffect } from 'react';
import { getCtaConfig, updateCtaConfig } from '../lib/supabase';

export default function Settings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await getCtaConfig();
      setConfig(data);
    } catch (error) {
      console.error('Error loading config:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await updateCtaConfig(config);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const toggleMode = () => {
    setConfig(prev => ({
      ...prev,
      mode: prev.mode === 'waitlist' ? 'live' : 'waitlist'
    }));
  };

  const updateLiveUrl = (url) => {
    setConfig(prev => ({
      ...prev,
      live: {
        ...prev.live,
        buttonUrl: url
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}>
          Loading settings...
        </p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center py-12">
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}>
          Failed to load settings
        </p>
      </div>
    );
  }

  const isLiveMode = config.mode === 'live';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        {/* Header */}
        <h2
          className="text-2xl font-bold mb-2"
          style={{
            fontFamily: 'Libre Baskerville, serif',
            color: '#101827',
            letterSpacing: '-0.02em'
          }}
        >
          CTA Configuration
        </h2>
        <p
          className="mb-8"
          style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '1.0625rem' }}
        >
          Control how your quiz directs users to your program or waitlist
        </p>

        {/* Current Mode Display */}
        <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: '#EFEDEC' }}>
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium mb-1"
                style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}
              >
                Current Mode
              </p>
              <p
                className="text-lg font-bold"
                style={{ fontFamily: 'Libre Baskerville, serif', color: '#101827' }}
              >
                {isLiveMode ? 'Live Mode' : 'Waitlist Mode'}
              </p>
            </div>
            <div
              className="px-4 py-2 rounded-full font-semibold text-sm"
              style={{
                backgroundColor: isLiveMode ? '#059669' : '#4D1E22',
                color: 'white',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {isLiveMode ? '● LIVE' : '● WAITLIST'}
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="mb-8">
          <h3
            className="text-lg font-bold mb-4"
            style={{ fontFamily: 'Libre Baskerville, serif', color: '#101827' }}
          >
            Mode Settings
          </h3>

          <div className="space-y-4">
            {/* Waitlist Mode */}
            <label
              className="flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all"
              style={{
                borderColor: !isLiveMode ? '#4D1E22' : '#E5E7EB',
                backgroundColor: !isLiveMode ? '#FEF2F2' : 'white'
              }}
            >
              <input
                type="radio"
                name="mode"
                checked={!isLiveMode}
                onChange={() => !isLiveMode || toggleMode()}
                className="mt-1 mr-3"
                style={{ accentColor: '#4D1E22' }}
              />
              <div>
                <p
                  className="font-bold mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}
                >
                  Waitlist Mode
                </p>
                <p
                  className="text-sm"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}
                >
                  All CTAs direct users to join the waitlist (pre-launch)
                </p>
              </div>
            </label>

            {/* Live Mode */}
            <label
              className="flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all"
              style={{
                borderColor: isLiveMode ? '#4D1E22' : '#E5E7EB',
                backgroundColor: isLiveMode ? '#FEF2F2' : 'white'
              }}
            >
              <input
                type="radio"
                name="mode"
                checked={isLiveMode}
                onChange={() => isLiveMode || toggleMode()}
                className="mt-1 mr-3"
                style={{ accentColor: '#4D1E22' }}
              />
              <div className="flex-1">
                <p
                  className="font-bold mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}
                >
                  Live Mode
                </p>
                <p
                  className="text-sm mb-3"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}
                >
                  Default CTA directs to your program; soft CTAs still go to waitlist
                </p>

                {isLiveMode && (
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}
                    >
                      Program URL
                    </label>
                    <input
                      type="url"
                      value={config.live.buttonUrl}
                      onChange={(e) => updateLiveUrl(e.target.value)}
                      placeholder="https://your-program-url.com"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        borderColor: '#D1D5DB'
                      }}
                    />
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSave}
            disabled={saving || (isLiveMode && !config.live.buttonUrl)}
            className="px-6 py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
            style={{
              backgroundColor: '#4D1E22',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          {message && (
            <p
              className="text-sm font-medium"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: message.type === 'success' ? '#059669' : '#EF4444'
              }}
            >
              {message.text}
            </p>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: '#EFF6FF' }}>
          <p
            className="text-sm"
            style={{ fontFamily: 'Inter, sans-serif', color: '#1E40AF' }}
          >
            <strong>Note:</strong> Changes take effect immediately. Users who complete the quiz
            after you save will see the updated CTA configuration.
          </p>
        </div>
      </div>
    </div>
  );
}
