import { useState, useEffect } from 'react';
import { getAllResponses } from '../lib/supabase';

export default function FacebookAds() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showAllResponses, setShowAllResponses] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data, error } = await getAllResponses();
      if (error) {
        console.error('Error fetching responses:', error);
        return;
      }

      // Filter to Facebook traffic only
      const fbResponses = (data || []).filter(r =>
        r.utm_source?.toLowerCase() === 'facebook' ||
        r.utm_source?.toLowerCase() === 'fb'
      );

      setResponses(fbResponses);
      calculateStats(fbResponses);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const sensitized = data.filter(r => r.result === 'sensitized').length;
    const notSensitized = total - sensitized;

    // Campaign breakdown
    const campaigns = data.reduce((acc, r) => {
      const campaign = r.utm_campaign || 'No Campaign';
      if (!acc[campaign]) {
        acc[campaign] = { total: 0, sensitized: 0 };
      }
      acc[campaign].total++;
      if (r.result === 'sensitized') acc[campaign].sensitized++;
      return acc;
    }, {});

    // Content (Ad) breakdown
    const content = data.reduce((acc, r) => {
      const ad = r.utm_content || 'No Ad ID';
      if (!acc[ad]) {
        acc[ad] = { total: 0, sensitized: 0 };
      }
      acc[ad].total++;
      if (r.result === 'sensitized') acc[ad].sensitized++;
      return acc;
    }, {});

    // Term (Keyword/Audience) breakdown
    const terms = data.reduce((acc, r) => {
      const term = r.utm_term || 'No Term';
      if (!acc[term]) {
        acc[term] = { total: 0, sensitized: 0 };
      }
      acc[term].total++;
      if (r.result === 'sensitized') acc[term].sensitized++;
      return acc;
    }, {});

    setStats({
      total,
      sensitized,
      notSensitized,
      sensitizedRate: total > 0 ? ((sensitized / total) * 100).toFixed(1) : 0,
      campaigns,
      content,
      terms
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}>
          Loading Facebook Ads data...
        </p>
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ fontFamily: 'Libre Baskerville, serif', color: '#101827' }}
        >
          No Facebook Ads Data Yet
        </h3>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}>
          When users arrive via Facebook ads with UTM parameters, their data will appear here.
        </p>
        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#F3F4F6' }}>
          <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}>
            <strong>Test URL format:</strong><br />
            <code className="text-xs">your-quiz.com/?utm_source=facebook&utm_campaign=test&utm_content=ad_123&utm_term=audience_1</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total FB Conversions"
          value={stats.total}
          subtitle="Quiz completions from Facebook"
        />
        <StatCard
          title="Sensitized"
          value={stats.sensitized}
          subtitle={`${stats.sensitizedRate}% of FB traffic`}
          color="#991B1B"
        />
        <StatCard
          title="Not Sensitized"
          value={stats.notSensitized}
          subtitle={`${(100 - stats.sensitizedRate).toFixed(1)}% of FB traffic`}
          color="#3730A3"
        />
        <StatCard
          title="Campaigns"
          value={Object.keys(stats.campaigns).filter(k => k !== 'No Campaign').length}
          subtitle="Active campaigns tracked"
        />
      </div>

      {/* Campaign Breakdown */}
      <Card title="Performance by Campaign (utm_campaign)">
        <BreakdownTable
          data={stats.campaigns}
          columns={['Campaign', 'Conversions', 'Sensitized', 'Rate']}
        />
      </Card>

      {/* Ad Content Breakdown */}
      <Card title="Performance by Ad (utm_content)">
        <BreakdownTable
          data={stats.content}
          columns={['Ad ID', 'Conversions', 'Sensitized', 'Rate']}
        />
      </Card>

      {/* Term/Audience Breakdown */}
      <Card title="Performance by Audience/Keyword (utm_term)">
        <BreakdownTable
          data={stats.terms}
          columns={['Term', 'Conversions', 'Sensitized', 'Rate']}
        />
      </Card>

      {/* Individual Responses */}
      <Card title="Individual Conversions">
        <ResponsesTable
          responses={responses}
          showAll={showAllResponses}
          onToggle={() => setShowAllResponses(!showAllResponses)}
        />
      </Card>
    </div>
  );
}

function StatCard({ title, value, subtitle, color }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3
        className="text-sm font-medium mb-2"
        style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}
      >
        {title}
      </h3>
      <p
        className="text-3xl font-bold mb-1"
        style={{
          fontFamily: 'Libre Baskerville, serif',
          color: color || '#101827'
        }}
      >
        {value}
      </p>
      <p
        className="text-xs"
        style={{ fontFamily: 'Inter, sans-serif', color: '#9CA3AF' }}
      >
        {subtitle}
      </p>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3
        className="text-lg font-bold mb-4"
        style={{
          fontFamily: 'Libre Baskerville, serif',
          color: '#101827',
          letterSpacing: '-0.02em'
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function BreakdownTable({ data, columns }) {
  const sorted = Object.entries(data)
    .map(([name, stats]) => ({
      name,
      ...stats,
      rate: stats.total > 0 ? ((stats.sensitized / stats.total) * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.total - a.total);

  if (sorted.length === 0) {
    return (
      <p style={{ fontFamily: 'Inter, sans-serif', color: '#9CA3AF', fontStyle: 'italic' }}>
        No data available
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
            {columns.map((col, i) => (
              <th
                key={i}
                className={`py-3 px-4 font-medium ${i === 0 ? 'text-left' : 'text-right'}`}
                style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '0.75rem' }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, index) => (
            <tr
              key={row.name}
              style={{ borderBottom: index < sorted.length - 1 ? '1px solid #F3F4F6' : 'none' }}
            >
              <td
                className="py-3 px-4"
                style={{ fontFamily: 'Inter, sans-serif', color: '#101827', fontSize: '0.875rem' }}
              >
                {row.name}
              </td>
              <td
                className="py-3 px-4 text-right font-semibold"
                style={{ fontFamily: 'Inter, sans-serif', color: '#101827', fontSize: '0.875rem' }}
              >
                {row.total}
              </td>
              <td
                className="py-3 px-4 text-right"
                style={{ fontFamily: 'Inter, sans-serif', color: '#991B1B', fontSize: '0.875rem' }}
              >
                {row.sensitized}
              </td>
              <td
                className="py-3 px-4 text-right"
                style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '0.875rem' }}
              >
                {row.rate}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResponsesTable({ responses, showAll, onToggle }) {
  const displayed = showAll ? responses : responses.slice(0, 15);
  const hasMore = responses.length > 15;

  return (
    <div>
      <p
        className="text-sm mb-4"
        style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}
      >
        {responses.length} total conversions from Facebook
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
              <th className="text-left py-3 px-3 font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '0.75rem' }}>
                Date
              </th>
              <th className="text-left py-3 px-3 font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '0.75rem' }}>
                Email
              </th>
              <th className="text-left py-3 px-3 font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '0.75rem' }}>
                Campaign
              </th>
              <th className="text-left py-3 px-3 font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '0.75rem' }}>
                Ad (Content)
              </th>
              <th className="text-left py-3 px-3 font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '0.75rem' }}>
                Term
              </th>
              <th className="text-left py-3 px-3 font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '0.75rem' }}>
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((r, index) => (
              <tr
                key={r.id}
                style={{ borderBottom: index < displayed.length - 1 ? '1px solid #F3F4F6' : 'none' }}
              >
                <td className="py-2 px-3" style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '0.8125rem' }}>
                  {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
                <td className="py-2 px-3" style={{ fontFamily: 'Inter, sans-serif', color: '#101827', fontSize: '0.8125rem' }}>
                  {r.email}
                </td>
                <td className="py-2 px-3" style={{ fontFamily: 'Inter, sans-serif', color: '#101827', fontSize: '0.8125rem' }}>
                  {r.utm_campaign || '-'}
                </td>
                <td className="py-2 px-3" style={{ fontFamily: 'Inter, sans-serif', color: '#101827', fontSize: '0.8125rem' }}>
                  {r.utm_content || '-'}
                </td>
                <td className="py-2 px-3" style={{ fontFamily: 'Inter, sans-serif', color: '#101827', fontSize: '0.8125rem' }}>
                  {r.utm_term || '-'}
                </td>
                <td className="py-2 px-3">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: r.result === 'sensitized' ? '#FEE2E2' : '#E0E7FF',
                      color: r.result === 'sensitized' ? '#991B1B' : '#3730A3',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {r.result === 'sensitized' ? 'Sensitized' : 'Not Sens.'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid #E5E7EB' }}>
          <button
            onClick={onToggle}
            className="text-sm font-medium hover:underline"
            style={{ fontFamily: 'Inter, sans-serif', color: '#4D1E22' }}
          >
            {showAll ? 'Show recent 15 only' : `View all ${responses.length} conversions`}
          </button>
        </div>
      )}
    </div>
  );
}
