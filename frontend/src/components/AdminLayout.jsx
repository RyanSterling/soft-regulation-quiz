import { useState } from 'react';
import Responses from './Responses';
import Analytics from './Analytics';
import AIAnalyzer from './AIAnalyzer';
import Settings from './Settings';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export default function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('responses');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#EFEDEC' }}
      >
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
          <h1
            className="text-2xl font-bold mb-6"
            style={{
              fontFamily: 'Libre Baskerville, serif',
              color: '#101827',
              letterSpacing: '-0.02em'
            }}
          >
            Admin Login
          </h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label
                className="block mb-2"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#6D6B6B',
                  fontSize: '0.9375rem'
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  borderColor: error ? '#EF4444' : '#D1D5DB'
                }}
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm" style={{ color: '#EF4444' }}>
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold text-white transition-colors"
              style={{
                backgroundColor: '#4D1E22',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#EFEDEC' }}
    >
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1
              className="text-3xl font-bold"
              style={{
                fontFamily: 'Libre Baskerville, serif',
                color: '#101827',
                letterSpacing: '-0.02em'
              }}
            >
              Admin Dashboard
            </h1>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 rounded-lg"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#6D6B6B',
                border: '1px solid #D1D5DB'
              }}
            >
              Logout
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-8 border-b" style={{ borderColor: '#E5E7EB' }}>
            <button
              onClick={() => setActiveTab('responses')}
              className="pb-4 px-1 font-medium transition-colors"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: activeTab === 'responses' ? '#4D1E22' : '#6D6B6B',
                borderBottom: activeTab === 'responses' ? '2px solid #4D1E22' : 'none'
              }}
            >
              Responses
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className="pb-4 px-1 font-medium transition-colors"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: activeTab === 'analytics' ? '#4D1E22' : '#6D6B6B',
                borderBottom: activeTab === 'analytics' ? '2px solid #4D1E22' : 'none'
              }}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('ai-analyzer')}
              className="pb-4 px-1 font-medium transition-colors"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: activeTab === 'ai-analyzer' ? '#4D1E22' : '#6D6B6B',
                borderBottom: activeTab === 'ai-analyzer' ? '2px solid #4D1E22' : 'none'
              }}
            >
              AI Analyzer
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className="pb-4 px-1 font-medium transition-colors"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: activeTab === 'settings' ? '#4D1E22' : '#6D6B6B',
                borderBottom: activeTab === 'settings' ? '2px solid #4D1E22' : 'none'
              }}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'responses' && <Responses />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'ai-analyzer' && <AIAnalyzer />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  );
}
