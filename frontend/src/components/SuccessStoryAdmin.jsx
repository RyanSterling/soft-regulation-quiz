import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const colors = {
  cream: '#FAF9F7',
  white: '#FFFFFF',
  black: '#1E1F1C',
  muted: '#6D6B6B',
  error: '#DC2626',
};

export default function SuccessStoryAdmin() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('success_stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (err) {
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'mostly_recovered': return 'Mostly Recovered';
      case 'doing_well': return 'Doing Well';
      case 'still_working': return 'Still Working Through It';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'mostly_recovered': return '#059669';
      case 'doing_well': return '#3B82F6';
      case 'still_working': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.cream }}>
        <p style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: colors.cream }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Cormorant Garamond, serif', color: colors.black }}>
          Success Story Submissions
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4" style={{ backgroundColor: colors.white }}>
            <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Total</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Inter, sans-serif', color: colors.black }}>{stories.length}</p>
          </div>
          <div className="p-4" style={{ backgroundColor: colors.white }}>
            <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Mostly Recovered</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Inter, sans-serif', color: '#059669' }}>
              {stories.filter(s => s.recovery_status === 'mostly_recovered').length}
            </p>
          </div>
          <div className="p-4" style={{ backgroundColor: colors.white }}>
            <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Camera OK</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Inter, sans-serif', color: '#059669' }}>
              {stories.filter(s => s.camera_consent).length}
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: colors.white }}>
          <table className="min-w-full">
            <thead style={{ borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Camera</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((story) => (
                <tr key={story.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td className="px-6 py-4 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: colors.black }}>{story.name}</td>
                  <td className="px-6 py-4 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <a href={`mailto:${story.email}`} style={{ color: '#3B82F6' }}>{story.email}</a>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: `${getStatusColor(story.recovery_status)}20`, color: getStatusColor(story.recovery_status), fontFamily: 'Inter, sans-serif' }}>
                      {getStatusLabel(story.recovery_status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: story.camera_consent ? '#059669' : colors.error }}>
                    {story.camera_consent ? '✓ Yes' : '✗ No'}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                    {new Date(story.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedStory(story)}
                      className="text-sm font-medium"
                      style={{ fontFamily: 'Inter, sans-serif', color: '#3B82F6' }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedStory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedStory(null)}>
            <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8" style={{ backgroundColor: colors.white }} onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Cormorant Garamond, serif', color: colors.black }}>
                {selectedStory.name}
              </h2>

              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Email</p>
                  <a href={`mailto:${selectedStory.email}`} style={{ fontFamily: 'Inter, sans-serif', color: '#3B82F6' }}>
                    {selectedStory.email}
                  </a>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Life Before</p>
                  <div className="p-4" style={{ backgroundColor: colors.cream }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', color: colors.black, whiteSpace: 'pre-wrap' }}>
                      {selectedStory.life_before}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Symptoms</p>
                  <div className="p-4" style={{ backgroundColor: colors.cream }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', color: colors.black, whiteSpace: 'pre-wrap' }}>
                      {selectedStory.symptoms || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Life Now</p>
                  <div className="p-4" style={{ backgroundColor: colors.cream }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', color: colors.black, whiteSpace: 'pre-wrap' }}>
                      {selectedStory.life_now}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>What Helped from the Course</p>
                  <div className="p-4" style={{ backgroundColor: colors.cream }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', color: colors.black, whiteSpace: 'pre-wrap' }}>
                      {selectedStory.what_helped || 'Not provided'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStory(null)}
                  className="px-6 py-2 font-medium"
                  style={{ backgroundColor: colors.black, color: colors.white, fontFamily: 'Inter, sans-serif' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
