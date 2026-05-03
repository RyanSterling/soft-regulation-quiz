import { useState, useEffect } from 'react';
import { QUESTIONS, getQuestionText, getOptionLabel } from '../data/coachingQuestions';
import { FAIL_REASON_LABELS } from '../data/coachingContent';
import {
  getCoachingScoringConfig,
  updateFullCoachingConfig,
  getCoachingResponses,
  getCoachingAnalytics,
  DEFAULT_CONFIG
} from '../lib/coachingConfig';
import { getOutcomeDisplay } from '../lib/coachingScoring';

const ADMIN_PASSWORD = import.meta.env.VITE_COACHING_ADMIN_PASSWORD || 'coaching-admin-2024';

export default function CoachingAdmin() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Config state
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Responses state
  const [responses, setResponses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);

  // Tab state
  const [activeTab, setActiveTab] = useState('scoring');

  // Load data on mount (if authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [configData, responsesData, analyticsData] = await Promise.all([
        getCoachingScoringConfig(),
        getCoachingResponses({}, 50),
        getCoachingAnalytics()
      ]);

      setConfig(configData);
      setResponses(responsesData.data || []);
      setAnalytics(analyticsData.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect password');
    }
  };

  const handleScoreChange = (questionId, optionIndex, newScore) => {
    setConfig(prev => ({
      ...prev,
      question_scores: {
        ...prev.question_scores,
        [questionId]: prev.question_scores[questionId].map((score, idx) =>
          idx === optionIndex ? parseInt(newScore) || 0 : score
        )
      }
    }));
  };

  const handleThresholdChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [key]: parseInt(value) || 0
      }
    }));
  };

  const handleAutoFailToggle = (questionId, optionIndex) => {
    setConfig(prev => {
      const currentFails = prev.auto_fail_options[questionId] || [];
      const isCurrentlyFail = currentFails.includes(optionIndex);

      return {
        ...prev,
        auto_fail_options: {
          ...prev.auto_fail_options,
          [questionId]: isCurrentlyFail
            ? currentFails.filter(idx => idx !== optionIndex)
            : [...currentFails, optionIndex]
        }
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      // Clean up empty arrays from auto_fail_options before saving
      const cleanedConfig = {
        ...config,
        auto_fail_options: Object.fromEntries(
          Object.entries(config.auto_fail_options).filter(([, arr]) => arr.length > 0)
        )
      };

      const result = await updateFullCoachingConfig(cleanedConfig, 'admin');
      if (result.error) {
        setSaveMessage('Error saving configuration');
      } else {
        setSaveMessage('Configuration saved successfully');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setSaveMessage('Error saving configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all scoring configuration to defaults?')) {
      setConfig(DEFAULT_CONFIG);
    }
  };

  // ============================================
  // LOGIN SCREEN
  // ============================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#EFEDEC' }}>
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h1
              className="text-2xl mb-6 text-center"
              style={{ fontFamily: 'Libre Baskerville, serif', color: '#101827' }}
            >
              Coaching Admin
            </h1>

            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setAuthError(''); }}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3"
                  style={{
                    backgroundColor: '#E6E4E1',
                    borderRadius: '12px',
                    border: authError ? '2px solid #DC2626' : 'none',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '1rem',
                    color: '#1E1F1C',
                    outline: 'none'
                  }}
                />
                {authError && (
                  <p className="text-sm" style={{ color: '#DC2626', fontFamily: 'Inter, sans-serif' }}>
                    {authError}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full px-6 py-3 font-medium"
                  style={{
                    backgroundColor: '#4D1E22',
                    color: 'white',
                    borderRadius: '27px',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // LOADING STATE
  // ============================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EFEDEC' }}>
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 mx-auto mb-4"
            style={{ borderTopColor: '#4D1E22' }}
          />
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN ADMIN PANEL
  // ============================================
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EFEDEC' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1
            className="text-3xl"
            style={{ fontFamily: 'Libre Baskerville, serif', color: '#101827' }}
          >
            Coaching Pre-Screening Admin
          </h1>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 text-sm"
            style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}
          >
            Logout
          </button>
        </div>

        {/* Analytics Summary */}
        {analytics && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Submissions" value={analytics.total} />
            <StatCard label="Approved" value={analytics.pass} color="#166534" />
            <StatCard label="Under Review" value={analytics.review} color="#92400E" />
            <StatCard label="Not Approved" value={analytics.fail} color="#991B1B" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b" style={{ borderColor: '#E6E4E1' }}>
          <TabButton active={activeTab === 'scoring'} onClick={() => setActiveTab('scoring')}>
            Scoring Configuration
          </TabButton>
          <TabButton active={activeTab === 'responses'} onClick={() => setActiveTab('responses')}>
            Recent Submissions
          </TabButton>
        </div>

        {/* Tab Content */}
        {activeTab === 'scoring' && (
          <ScoringConfigTab
            config={config}
            onScoreChange={handleScoreChange}
            onThresholdChange={handleThresholdChange}
            onAutoFailToggle={handleAutoFailToggle}
            onSave={handleSave}
            onReset={handleReset}
            isSaving={isSaving}
            saveMessage={saveMessage}
          />
        )}

        {activeTab === 'responses' && (
          <ResponsesTab
            responses={responses}
            selectedResponse={selectedResponse}
            onSelectResponse={setSelectedResponse}
            onRefresh={loadData}
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function StatCard({ label, value, color = '#101827' }) {
  return (
    <div className="bg-white rounded-xl p-4">
      <p className="text-sm mb-1" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
        {label}
      </p>
      <p className="text-3xl font-bold" style={{ fontFamily: 'Inter, sans-serif', color }}>
        {value}
      </p>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-3 text-sm font-medium transition-colors"
      style={{
        fontFamily: 'Inter, sans-serif',
        color: active ? '#4D1E22' : '#77716E',
        borderBottom: active ? '2px solid #4D1E22' : '2px solid transparent',
        marginBottom: '-1px'
      }}
    >
      {children}
    </button>
  );
}

function ScoringConfigTab({ config, onScoreChange, onThresholdChange, onAutoFailToggle, onSave, onReset, isSaving, saveMessage }) {
  return (
    <div className="space-y-8">
      {/* Thresholds Section */}
      <div className="bg-white rounded-xl p-6">
        <h2 className="text-lg font-medium mb-4" style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}>
          Outcome Thresholds
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
              PASS (score ≤)
            </label>
            <input
              type="number"
              value={config.thresholds.pass_max}
              onChange={(e) => onThresholdChange('pass_max', e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{ backgroundColor: '#E6E4E1', fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
              REVIEW (score ≤)
            </label>
            <input
              type="number"
              value={config.thresholds.review_max}
              onChange={(e) => onThresholdChange('review_max', e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{ backgroundColor: '#E6E4E1', fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
              FAIL (score >)
            </label>
            <input
              type="number"
              value={config.thresholds.review_max}
              disabled
              className="w-full px-3 py-2 rounded-lg opacity-50"
              style={{ backgroundColor: '#E6E4E1', fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        </div>
      </div>

      {/* Question Scores Section */}
      <div className="bg-white rounded-xl p-6">
        <h2 className="text-lg font-medium mb-4" style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}>
          Question Scoring
        </h2>
        <p className="text-sm mb-6" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
          Edit point values for each option. Toggle "Auto-Fail" to make an option immediately disqualifying.
        </p>

        <div className="space-y-6">
          {QUESTIONS.filter(q => q.id !== 'q13').map(question => (
            <QuestionScoreEditor
              key={question.id}
              question={question}
              scores={config.question_scores[question.id] || []}
              autoFails={config.auto_fail_options[question.id] || []}
              onScoreChange={(optionIndex, newScore) => onScoreChange(question.id, optionIndex, newScore)}
              onAutoFailToggle={(optionIndex) => onAutoFailToggle(question.id, optionIndex)}
            />
          ))}
        </div>
      </div>

      {/* Q13 Hard Gate Section */}
      <div className="bg-white rounded-xl p-6">
        <h2 className="text-lg font-medium mb-4" style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}>
          Q13: Commitment Gate (Hard Gate)
        </h2>
        <p className="text-sm mb-4" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
          This question is not scored. Only "Yes, I'm 100% certain" passes — all other answers result in automatic FAIL.
        </p>
        <div className="border-b pb-4" style={{ borderColor: '#E6E4E1' }}>
          <h3 className="font-medium mb-3" style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}>
            Are you 100% certain that the symptoms or condition you're dealing with are nervous system related?
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#DCFCE7', color: '#166534', fontFamily: 'Inter, sans-serif' }}>
                PASS
              </span>
              <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}>
                Yes, I'm 100% certain
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', fontFamily: 'Inter, sans-serif' }}>
                FAIL
              </span>
              <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#991B1B' }}>
                I'm mostly sure but still have some doubt
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', fontFamily: 'Inter, sans-serif' }}>
                FAIL
              </span>
              <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#991B1B' }}>
                I think so but I'm not certain
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#FEE2E2', color: '#991B1B', fontFamily: 'Inter, sans-serif' }}>
                FAIL
              </span>
              <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#991B1B' }}>
                No, I'm still trying to figure out what's wrong
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Save/Reset Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-6 py-3 font-medium disabled:opacity-50"
          style={{
            backgroundColor: '#4D1E22',
            color: 'white',
            borderRadius: '27px',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 font-medium"
          style={{
            backgroundColor: '#E6E4E1',
            color: '#77716E',
            borderRadius: '27px',
            fontFamily: 'Inter, sans-serif'
          }}
        >
          Reset to Defaults
        </button>
        {saveMessage && (
          <span
            className="text-sm"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: saveMessage.includes('Error') ? '#DC2626' : '#166534'
            }}
          >
            {saveMessage}
          </span>
        )}
      </div>

      {/* Config Debug Section */}
      <details className="bg-white rounded-xl p-6">
        <summary className="cursor-pointer font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}>
          🔍 Config Debug (click to expand)
        </summary>
        <div className="mt-4 space-y-4">
          <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
            These are the current config values loaded from the database. After saving, refresh the page to verify changes are persisted.
          </p>
          <div>
            <h4 className="text-sm font-medium mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}>
              Question Scores:
            </h4>
            <pre className="text-xs p-3 rounded overflow-x-auto" style={{ backgroundColor: '#F5F5F4', fontFamily: 'monospace', color: '#374151' }}>
              {JSON.stringify(config.question_scores, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}>
              Thresholds:
            </h4>
            <pre className="text-xs p-3 rounded overflow-x-auto" style={{ backgroundColor: '#F5F5F4', fontFamily: 'monospace', color: '#374151' }}>
              {JSON.stringify(config.thresholds, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}>
              Auto-Fail Options:
            </h4>
            <pre className="text-xs p-3 rounded overflow-x-auto" style={{ backgroundColor: '#F5F5F4', fontFamily: 'monospace', color: '#374151' }}>
              {JSON.stringify(config.auto_fail_options, null, 2)}
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
}

function QuestionScoreEditor({ question, scores, autoFails, onScoreChange, onAutoFailToggle }) {
  return (
    <div className="border-b pb-6" style={{ borderColor: '#E6E4E1' }}>
      <h3 className="font-medium mb-4" style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}>
        Q{question.questionNumber}: {question.text}
      </h3>

      {/* Column headers */}
      <div className="flex items-center gap-4 mb-2 px-1">
        <span
          className="w-14 text-xs font-medium text-center"
          style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}
        >
          Score
        </span>
        <span
          className="flex-1 text-xs font-medium"
          style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}
        >
          Option
        </span>
        <span
          className="w-20 text-xs font-medium text-center"
          style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}
        >
          Auto-Fail
        </span>
      </div>

      <div className="grid gap-2">
        {question.options.map((option, idx) => {
          const isAutoFail = autoFails.includes(idx);
          return (
            <div key={idx} className="flex items-center gap-4">
              <input
                type="number"
                value={scores[idx] ?? 0}
                onChange={(e) => onScoreChange(idx, e.target.value)}
                className="w-14 px-2 py-1 rounded text-center"
                style={{
                  backgroundColor: isAutoFail ? '#FEE2E2' : '#E6E4E1',
                  fontFamily: 'Inter, sans-serif',
                  color: isAutoFail ? '#991B1B' : '#1E1F1C'
                }}
                disabled={isAutoFail}
              />
              <span
                className="flex-1 text-sm"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: isAutoFail ? '#991B1B' : '#6D6B6B'
                }}
              >
                {option.label}
              </span>
              <label className="w-20 flex items-center justify-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAutoFail}
                  onChange={() => onAutoFailToggle(idx)}
                  style={{ accentColor: '#DC2626' }}
                />
                <span
                  className="text-xs"
                  style={{ fontFamily: 'Inter, sans-serif', color: isAutoFail ? '#DC2626' : '#77716E' }}
                >
                  {isAutoFail ? 'Yes' : 'No'}
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResponsesTab({ responses, selectedResponse, onSelectResponse, onRefresh }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Responses List */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}>
            Recent Submissions
          </h2>
          <button
            onClick={onRefresh}
            className="text-sm px-3 py-1 rounded"
            style={{ backgroundColor: '#E6E4E1', fontFamily: 'Inter, sans-serif', color: '#77716E' }}
          >
            Refresh
          </button>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {responses.map(response => {
            const outcomeDisplay = getOutcomeDisplay(response.outcome);
            const isSelected = selectedResponse?.id === response.id;

            return (
              <button
                key={response.id}
                onClick={() => onSelectResponse(response)}
                className="w-full text-left p-3 rounded-lg transition-colors"
                style={{
                  backgroundColor: isSelected ? '#4D1E22' : '#F9FAFB',
                  color: isSelected ? 'white' : '#101827'
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p
                      className="font-medium text-sm truncate"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {response.email}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: isSelected ? 'rgba(255,255,255,0.7)' : '#77716E'
                      }}
                    >
                      {new Date(response.created_at).toLocaleDateString()} {new Date(response.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span
                    className="px-2 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : outcomeDisplay.bgColor,
                      color: isSelected ? 'white' : outcomeDisplay.color,
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {outcomeDisplay.text}
                  </span>
                </div>
              </button>
            );
          })}

          {responses.length === 0 && (
            <p className="text-center py-8" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
              No submissions yet
            </p>
          )}
        </div>
      </div>

      {/* Response Detail */}
      <div className="bg-white rounded-xl p-6">
        {selectedResponse ? (
          <ResponseDetail response={selectedResponse} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
              Select a submission to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ResponseDetail({ response }) {
  const outcomeDisplay = getOutcomeDisplay(response.outcome);
  const answers = response.answers || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span
            className="px-3 py-1 rounded-full text-sm"
            style={{
              backgroundColor: outcomeDisplay.bgColor,
              color: outcomeDisplay.color,
              fontFamily: 'Inter, sans-serif'
            }}
          >
            {outcomeDisplay.text}
          </span>
          {response.score !== null && (
            <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
              Score: {response.score}
            </span>
          )}
        </div>
        <h3 className="font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}>
          {response.email}
        </h3>
        <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
          {new Date(response.created_at).toLocaleString()}
        </p>
        {response.fail_reason && (
          <p className="text-sm mt-2" style={{ fontFamily: 'Inter, sans-serif', color: '#DC2626' }}>
            Reason: {FAIL_REASON_LABELS[response.fail_reason] || response.fail_reason}
          </p>
        )}
      </div>

      {/* Answers */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {QUESTIONS.map(question => {
          const answerValue = answers[question.id];
          const answerLabel = question.options.find(o => o.value === answerValue)?.label || 'N/A';

          return (
            <div key={question.id} className="border-b pb-3" style={{ borderColor: '#E6E4E1' }}>
              <p className="text-sm font-medium mb-1" style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}>
                Q{question.questionNumber}: {question.text}
              </p>
              <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4D1E22' }}>
                {answerLabel}
              </p>
            </div>
          );
        })}

        {/* Q12 Free Text */}
        <div className="border-b pb-3" style={{ borderColor: '#E6E4E1' }}>
          <p className="text-sm font-medium mb-1" style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}>
            Q12: What would you want to get out of this coaching program?
          </p>
          <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#4D1E22' }}>
            {response.free_text || 'N/A'}
          </p>
        </div>
      </div>

      {/* UTM Info */}
      {(response.utm_source || response.utm_campaign) && (
        <div className="pt-4 border-t" style={{ borderColor: '#E6E4E1' }}>
          <p className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: '#77716E' }}>
            Source: {response.utm_source || 'N/A'} | Campaign: {response.utm_campaign || 'N/A'}
          </p>
        </div>
      )}
    </div>
  );
}
