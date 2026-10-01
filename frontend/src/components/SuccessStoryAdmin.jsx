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
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('success_stories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setStories(stories.filter(s => s.id !== id));
      setDeleteConfirm(null);
      setSelectedStory(null);
    } catch (err) {
      console.error('Error deleting story:', err);
    }
  };

  const toggleOutreach = async (id, field, currentValue) => {
    try {
      const { error } = await supabase
        .from('success_stories')
        .update({ [field]: !currentValue })
        .eq('id', id);

      if (error) throw error;
      setStories(stories.map(s =>
        s.id === id ? { ...s, [field]: !currentValue } : s
      ));
    } catch (err) {
      console.error('Error updating outreach status:', err);
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

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
          <div className="p-4" style={{ backgroundColor: colors.white }}>
            <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>YouTube Reached</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Inter, sans-serif', color: '#8B5CF6' }}>
              {stories.filter(s => s.youtube_outreach).length}
            </p>
          </div>
          <div className="p-4" style={{ backgroundColor: colors.white }}>
            <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Testimonial Reached</p>
            <p className="text-2xl font-bold" style={{ fontFamily: 'Inter, sans-serif', color: '#EC4899' }}>
              {stories.filter(s => s.testimonial_outreach).length}
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: colors.white }} className="overflow-x-auto">
          <table className="min-w-full">
            <thead style={{ borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Camera</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>YouTube</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Testimonial</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((story) => (
                <tr key={story.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td className="px-4 py-4 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: colors.black }}>{story.name}</td>
                  <td className="px-4 py-4 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <a href={`mailto:${story.email}`} style={{ color: '#3B82F6' }}>{story.email}</a>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: `${getStatusColor(story.recovery_status)}20`, color: getStatusColor(story.recovery_status), fontFamily: 'Inter, sans-serif' }}>
                      {getStatusLabel(story.recovery_status)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: story.camera_consent ? '#059669' : colors.error }}>
                    {story.camera_consent ? '✓ Yes' : '✗ No'}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={story.youtube_outreach || false}
                      onChange={() => toggleOutreach(story.id, 'youtube_outreach', story.youtube_outreach)}
                      className="w-5 h-5 cursor-pointer"
                      style={{ accentColor: '#8B5CF6' }}
                      title="YouTube interview outreach"
                    />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={story.testimonial_outreach || false}
                      onChange={() => toggleOutreach(story.id, 'testimonial_outreach', story.testimonial_outreach)}
                      className="w-5 h-5 cursor-pointer"
                      style={{ accentColor: '#EC4899' }}
                      title="Website testimonial outreach"
                    />
                  </td>
                  <td className="px-4 py-4 text-sm" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                    {new Date(story.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedStory(story)}
                        className="text-sm font-medium"
                        style={{ fontFamily: 'Inter, sans-serif', color: '#3B82F6' }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(story.id)}
                        className="text-sm font-medium"
                        style={{ fontFamily: 'Inter, sans-serif', color: colors.error }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setDeleteConfirm(null)}>
            <div className="max-w-md w-full p-8" style={{ backgroundColor: colors.white }} onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: colors.black }}>
                Delete Submission?
              </h2>
              <p className="mb-6" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>
                This action cannot be undone. The submission will be permanently deleted.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 font-medium border"
                  style={{ fontFamily: 'Inter, sans-serif', color: colors.black, borderColor: '#E5E7EB' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 font-medium"
                  style={{ backgroundColor: colors.error, color: colors.white, fontFamily: 'Inter, sans-serif' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {selectedStory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedStory(null)}>
            <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8" style={{ backgroundColor: colors.white }} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'Cormorant Garamond, serif', color: colors.black }}>
                  {selectedStory.name}
                </h2>
                <button
                  onClick={() => {
                    setDeleteConfirm(selectedStory.id);
                  }}
                  className="text-sm font-medium px-3 py-1"
                  style={{ fontFamily: 'Inter, sans-serif', color: colors.error, border: `1px solid ${colors.error}` }}
                >
                  Delete
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex gap-6 flex-wrap">
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Email</p>
                    <a href={`mailto:${selectedStory.email}`} style={{ fontFamily: 'Inter, sans-serif', color: '#3B82F6' }}>
                      {selectedStory.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Camera Consent</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', color: selectedStory.camera_consent ? '#059669' : colors.error }}>
                      {selectedStory.camera_consent ? '✓ Yes' : '✗ No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Status</p>
                    <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: `${getStatusColor(selectedStory.recovery_status)}20`, color: getStatusColor(selectedStory.recovery_status), fontFamily: 'Inter, sans-serif' }}>
                      {getStatusLabel(selectedStory.recovery_status)}
                    </span>
                  </div>
                </div>

                <div className="p-4 border" style={{ borderColor: '#E5E7EB' }}>
                  <p className="text-sm font-medium mb-3" style={{ fontFamily: 'Inter, sans-serif', color: colors.muted }}>Outreach Status</p>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStory.youtube_outreach || false}
                        onChange={() => {
                          toggleOutreach(selectedStory.id, 'youtube_outreach', selectedStory.youtube_outreach);
                          setSelectedStory({ ...selectedStory, youtube_outreach: !selectedStory.youtube_outreach });
                        }}
                        className="w-5 h-5"
                        style={{ accentColor: '#8B5CF6' }}
                      />
                      <span style={{ fontFamily: 'Inter, sans-serif', color: colors.black }}>YouTube Interview</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStory.testimonial_outreach || false}
                        onChange={() => {
                          toggleOutreach(selectedStory.id, 'testimonial_outreach', selectedStory.testimonial_outreach);
                          setSelectedStory({ ...selectedStory, testimonial_outreach: !selectedStory.testimonial_outreach });
                        }}
                        className="w-5 h-5"
                        style={{ accentColor: '#EC4899' }}
                      />
                      <span style={{ fontFamily: 'Inter, sans-serif', color: colors.black }}>Website Testimonial</span>
                    </label>
                  </div>
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
