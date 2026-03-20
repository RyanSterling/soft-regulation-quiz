import { useState, useEffect } from 'react';
import { getAllResponses } from '../lib/supabase';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function Analytics() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showAllUtmEntries, setShowAllUtmEntries] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data, error } = await getAllResponses();
      if (error) {
        console.error('Error fetching responses:', error);
        return;
      }
      setResponses(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;

    // Chronic pain breakdown
    const withPain = data.filter(r => r.has_chronic_pain);
    const withoutPain = data.filter(r => !r.has_chronic_pain);

    // Medical clearance breakdown (of those with pain)
    const clearanceBreakdown = {
      yes_confident: withPain.filter(r => r.medical_clearance === 'yes_confident').length,
      seen_but_unsure: withPain.filter(r => r.medical_clearance === 'seen_but_unsure').length,
      not_evaluated: withPain.filter(r => r.medical_clearance === 'not_evaluated').length
    };

    // Result breakdown
    const sensitized = data.filter(r => r.result === 'sensitized');
    const notSensitized = data.filter(r => r.result === 'not_sensitized');

    // UTM source breakdown
    const utmSources = data.reduce((acc, r) => {
      const source = r.utm_source || 'Direct/Organic';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    // UTM tracking data (for Facebook ads and other sources)
    const utmTrackedResponses = data
      .filter(r => r.utm_source || r.utm_campaign || r.utm_content || r.utm_term)
      .map(r => ({
        email: r.email,
        date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        utm_source: r.utm_source || '-',
        utm_campaign: r.utm_campaign || '-',
        utm_content: r.utm_content || '-',
        utm_term: r.utm_term || '-',
        result: r.result
      }));

    // Timeline data (submissions by day)
    const timeline = calculateTimeline(data);

    setStats({
      total,
      withPain: withPain.length,
      withoutPain: withoutPain.length,
      clearanceBreakdown,
      sensitized: sensitized.length,
      notSensitized: notSensitized.length,
      utmSources,
      utmTrackedResponses,
      timeline
    });
  };

  const calculateScoreDistribution = (data, scoreField) => {
    const distribution = { '3-6': 0, '7-9': 0, '10-12': 0 };
    data.forEach(r => {
      const score = r[scoreField];
      if (score >= 3 && score <= 6) distribution['3-6']++;
      else if (score >= 7 && score <= 9) distribution['7-9']++;
      else if (score >= 10 && score <= 12) distribution['10-12']++;
    });
    return Object.entries(distribution).map(([range, count]) => ({ range, count }));
  };

  const calculateTimeline = (data) => {
    const grouped = data.reduce((acc, r) => {
      const date = new Date(r.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}>
          Loading analytics...
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}>
          No data available
        </p>
      </div>
    );
  }

  const COLORS = {
    primary: '#4D1E22',
    secondary: '#8B5A5F',
    tertiary: '#B89093',
    accent1: '#3730A3',
    accent2: '#059669',
    accent3: '#DC2626'
  };

  return (
    <div className="space-y-6">
      {/* Result Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Result Distribution">
          <div className="mb-4 text-center">
            <p
              className="text-sm font-medium"
              style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}
            >
              Total Completions: <span style={{ color: '#101827', fontWeight: 'bold' }}>{stats.total}</span>
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Sensitized', value: stats.sensitized },
                  { name: 'Not Sensitized', value: stats.notSensitized }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill={COLORS.accent3} />
                <Cell fill={COLORS.accent1} />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Chronic Pain Breakdown">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { status: 'No Pain', count: stats.withoutPain },
                { status: 'Has Pain', count: stats.withPain }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill={COLORS.primary} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* UTM Source Breakdown */}
      <ChartCard title="Traffic Sources">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={Object.entries(stats.utmSources).map(([source, count]) => ({ source, count }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="source" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill={COLORS.accent1} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* UTM Tracking Table (for Facebook Ads) */}
      {stats.utmTrackedResponses.length > 0 && (
        <ChartCard title="Ad Tracking Details">
          <UtmTrackingTable
            entries={stats.utmTrackedResponses}
            showAll={showAllUtmEntries}
            onToggle={() => setShowAllUtmEntries(!showAllUtmEntries)}
          />
        </ChartCard>
      )}

      {/* Medical Clearance Funnel */}
      <ChartCard title="Medical Clearance Status (Users with Chronic Pain)">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              { status: 'Confident', count: stats.clearanceBreakdown.yes_confident },
              { status: 'Unsure', count: stats.clearanceBreakdown.seen_but_unsure },
              { status: 'Not Evaluated', count: stats.clearanceBreakdown.not_evaluated }
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill={COLORS.primary} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Timeline */}
      <ChartCard title="Submissions Over Time">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.timeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke={COLORS.primary} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function StatCard({ title, value, subtitle }) {
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
        style={{ fontFamily: 'Libre Baskerville, serif', color: '#101827' }}
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

function ChartCard({ title, children }) {
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

function UtmTrackingTable({ entries, showAll, onToggle }) {
  const displayedEntries = showAll ? entries : entries.slice(0, 10);
  const totalEntries = entries.length;
  const hasMore = totalEntries > 10;

  return (
    <div>
      <p
        className="text-sm mb-4"
        style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}
      >
        {totalEntries} responses with UTM tracking
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
              <th className="text-left py-3 px-3 font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '0.75rem' }}>
                Date
              </th>
              <th className="text-left py-3 px-3 font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '0.75rem' }}>
                Source
              </th>
              <th className="text-left py-3 px-3 font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '0.75rem' }}>
                Campaign
              </th>
              <th className="text-left py-3 px-3 font-medium" style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '0.75rem' }}>
                Content
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
            {displayedEntries.map((entry, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: index < displayedEntries.length - 1 ? '1px solid #F3F4F6' : 'none'
                }}
              >
                <td className="py-2 px-3" style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B', fontSize: '0.8125rem' }}>
                  {entry.date}
                </td>
                <td className="py-2 px-3" style={{ fontFamily: 'Inter, sans-serif', color: '#101827', fontSize: '0.8125rem' }}>
                  {entry.utm_source}
                </td>
                <td className="py-2 px-3" style={{ fontFamily: 'Inter, sans-serif', color: '#101827', fontSize: '0.8125rem' }}>
                  {entry.utm_campaign}
                </td>
                <td className="py-2 px-3" style={{ fontFamily: 'Inter, sans-serif', color: '#101827', fontSize: '0.8125rem' }}>
                  {entry.utm_content}
                </td>
                <td className="py-2 px-3" style={{ fontFamily: 'Inter, sans-serif', color: '#101827', fontSize: '0.8125rem' }}>
                  {entry.utm_term}
                </td>
                <td className="py-2 px-3">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: entry.result === 'sensitized' ? '#FEE2E2' : '#E0E7FF',
                      color: entry.result === 'sensitized' ? '#991B1B' : '#3730A3',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {entry.result === 'sensitized' ? 'Sensitized' : 'Not Sens.'}
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
            {showAll ? 'Show recent 10 only' : `View all ${totalEntries} entries`}
          </button>
        </div>
      )}
    </div>
  );
}
