import { useState, useEffect } from 'react';
import { getAllResponses } from '../lib/supabase';

export default function Responses() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filters, setFilters] = useState({
    result: '',
    has_chronic_pain: '',
    medical_clearance: ''
  });

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async (filterOverride = null) => {
    setLoading(true);
    try {
      const filterToUse = filterOverride || filters;

      // Build clean filters object (only include non-empty values)
      const cleanFilters = {};
      if (filterToUse.result) cleanFilters.result = filterToUse.result;
      if (filterToUse.has_chronic_pain !== '') {
        cleanFilters.has_chronic_pain = filterToUse.has_chronic_pain === 'true';
      }
      if (filterToUse.medical_clearance) cleanFilters.medical_clearance = filterToUse.medical_clearance;

      const { data, error } = await getAllResponses(cleanFilters);
      if (error) {
        console.error('Error fetching responses:', error);
        return;
      }
      console.log('Loaded responses:', data?.length || 0);
      setResponses(data || []);
    } catch (error) {
      console.error('Error loading responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (newFilters) => {
    loadResponses(newFilters);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}>
          Loading responses...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3
          className="text-lg font-bold mb-4"
          style={{
            fontFamily: 'Libre Baskerville, serif',
            color: '#101827',
            letterSpacing: '-0.02em'
          }}
        >
          Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              className="block mb-2 text-sm font-medium"
              style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}
            >
              Result
            </label>
            <select
              value={filters.result}
              onChange={(e) => {
                const newFilters = { ...filters, result: e.target.value };
                setFilters(newFilters);
                applyFilters(newFilters);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}
            >
              <option value="">All</option>
              <option value="sensitized">Sensitized</option>
              <option value="not_sensitized">Not Sensitized</option>
            </select>
          </div>

          <div>
            <label
              className="block mb-2 text-sm font-medium"
              style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}
            >
              Chronic Pain
            </label>
            <select
              value={filters.has_chronic_pain}
              onChange={(e) => {
                const newFilters = { ...filters, has_chronic_pain: e.target.value };
                setFilters(newFilters);
                applyFilters(newFilters);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}
            >
              <option value="">All</option>
              <option value="true">Has Pain</option>
              <option value="false">No Pain</option>
            </select>
          </div>

          <div>
            <label
              className="block mb-2 text-sm font-medium"
              style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}
            >
              Medical Clearance
            </label>
            <select
              value={filters.medical_clearance}
              onChange={(e) => {
                const newFilters = { ...filters, medical_clearance: e.target.value };
                setFilters(newFilters);
                applyFilters(newFilters);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}
            >
              <option value="">All</option>
              <option value="yes_confident">Confident</option>
              <option value="seen_but_unsure">Unsure</option>
              <option value="not_evaluated">Not Evaluated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p
          className="text-sm font-medium"
          style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}
        >
          Showing <span style={{ color: '#101827', fontWeight: 'bold' }}>{responses.length}</span> responses
        </p>
      </div>

      {/* Responses List */}
      <div className="space-y-4">
        {responses.map((response) => (
          <ResponseCard
            key={response.id}
            response={response}
            isExpanded={expandedId === response.id}
            onToggle={() => toggleExpand(response.id)}
            formatDate={formatDate}
          />
        ))}

        {responses.length === 0 && (
          <div className="bg-white rounded-xl p-12 shadow-sm text-center">
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}>
              No responses found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ResponseCard({ response, isExpanded, onToggle, formatDate }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header - Always visible */}
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <p
                className="font-semibold"
                style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}
              >
                {response.email}
              </p>
              <Badge
                text={response.result === 'sensitized' ? 'Sensitized' : 'Not Sensitized'}
                color={response.result === 'sensitized' ? 'red' : 'blue'}
              />
              {response.has_chronic_pain && (
                <Badge text="Has Pain" color="orange" />
              )}
              {response.free_text_response && (
                <Badge text="Has Context" color="green" />
              )}
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: '#6D6B6B' }}>
              <span style={{ fontFamily: 'Inter, sans-serif' }}>
                {formatDate(response.created_at)}
              </span>
              <span style={{ fontFamily: 'Inter, sans-serif' }}>
                Score: {response.score_total}/36
              </span>
              {response.utm_source && (
                <span style={{ fontFamily: 'Inter, sans-serif' }}>
                  Source: {response.utm_source}
                  {response.utm_campaign && ` (${response.utm_campaign})`}
                </span>
              )}
            </div>
          </div>
          <div className="ml-4">
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              style={{ color: '#6D6B6B' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-6 border-t" style={{ borderColor: '#E5E7EB' }}>
          {/* Free Text Response */}
          <div className="pt-6">
            <h4
              className="text-sm font-bold mb-3 flex items-center gap-2"
              style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}
            >
              <span>📝</span>
              User's Context
            </h4>
            {response.free_text_response ? (
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: '#F9FAFB',
                  fontFamily: 'Inter, sans-serif',
                  color: '#374151',
                  lineHeight: '1.6',
                  fontSize: '0.9375rem'
                }}
              >
                {response.free_text_response}
              </div>
            ) : (
              <p
                className="italic"
                style={{ fontFamily: 'Inter, sans-serif', color: '#9CA3AF', fontSize: '0.9375rem' }}
              >
                No context provided
              </p>
            )}
          </div>

          {/* AI Generated Content */}
          {response.ai_insight && (
            <div>
              <h4
                className="text-sm font-bold mb-3 flex items-center gap-2"
                style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}
              >
                <span>🤖</span>
                AI Generated Insight
              </h4>
              <div
                className="p-4 rounded-lg space-y-4"
                style={{
                  backgroundColor: '#FEF3C7',
                  fontFamily: 'Inter, sans-serif',
                  color: '#374151',
                  lineHeight: '1.6',
                  fontSize: '0.9375rem'
                }}
              >
                {(() => {
                  try {
                    const parsed = JSON.parse(response.ai_insight);
                    return (
                      <>
                        {parsed.whatThisMeans && (
                          <div>
                            <p className="font-semibold mb-2" style={{ color: '#92400E' }}>
                              What This Means:
                            </p>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{parsed.whatThisMeans}</p>
                          </div>
                        )}
                        {parsed.whatToDo && (
                          <div>
                            <p className="font-semibold mb-2" style={{ color: '#92400E' }}>
                              What To Do:
                            </p>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{parsed.whatToDo}</p>
                          </div>
                        )}
                        {parsed.closingMessage && (
                          <div>
                            <p className="font-semibold mb-2" style={{ color: '#92400E' }}>
                              Closing Message:
                            </p>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{parsed.closingMessage}</p>
                          </div>
                        )}
                      </>
                    );
                  } catch {
                    return <p>{response.ai_insight}</p>;
                  }
                })()}
              </div>
            </div>
          )}

          {/* Scores Breakdown */}
          <div>
            <h4
              className="text-sm font-bold mb-3"
              style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}
            >
              Score Breakdown
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <ScoreBox label="Trigger" score={response.score_trigger} max={12} />
              <ScoreBox label="Recovery" score={response.score_recovery} max={12} />
              <ScoreBox label="Baseline" score={response.score_baseline} max={12} />
            </div>
          </div>

          {/* Medical Info */}
          {response.has_chronic_pain && (
            <div>
              <h4
                className="text-sm font-bold mb-3"
                style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}
              >
                Medical Information
              </h4>
              <p style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '0.9375rem' }}>
                <span className="font-medium">Medical Clearance:</span>{' '}
                {response.medical_clearance === 'yes_confident' && 'Confident (cleared)'}
                {response.medical_clearance === 'seen_but_unsure' && 'Seen doctors but unsure'}
                {response.medical_clearance === 'not_evaluated' && 'Not evaluated yet'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Badge({ text, color }) {
  const colors = {
    red: { bg: '#FEE2E2', text: '#991B1B' },
    blue: { bg: '#E0E7FF', text: '#3730A3' },
    orange: { bg: '#FED7AA', text: '#9A3412' },
    green: { bg: '#D1FAE5', text: '#065F46' }
  };

  const style = colors[color] || colors.blue;

  return (
    <span
      className="px-2 py-1 rounded text-xs font-medium"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {text}
    </span>
  );
}

function ScoreBox({ label, score, max }) {
  return (
    <div
      className="p-3 rounded-lg"
      style={{ backgroundColor: '#F3F4F6' }}
    >
      <p
        className="text-xs font-medium mb-1"
        style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}
      >
        {label}
      </p>
      <p
        className="text-xl font-bold"
        style={{ fontFamily: 'Libre Baskerville, serif', color: '#101827' }}
      >
        {score}<span className="text-sm" style={{ color: '#9CA3AF' }}>/{max}</span>
      </p>
    </div>
  );
}
