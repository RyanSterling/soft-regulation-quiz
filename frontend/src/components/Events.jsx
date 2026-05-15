import { useState, useEffect } from 'react';
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getRSVPCount,
  getRSVPsForEvent,
  deleteRSVP,
} from '../lib/supabase';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [rsvpCounts, setRsvpCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // RSVP viewing state
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [eventRsvps, setEventRsvps] = useState([]);
  const [loadingRsvps, setLoadingRsvps] = useState(false);

  const emptyForm = {
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    is_active: true,
    time_pacific: '',
    time_eastern: '',
    time_uk: '',
    time_europe: '',
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data, error } = await getAllEvents();
    if (!error) {
      setEvents(data);
      // Fetch RSVP counts for each event
      const counts = {};
      for (const event of data) {
        const { count } = await getRSVPCount(event.id);
        counts[event.id] = count;
      }
      setRsvpCounts(counts);
    }
    setLoading(false);
  }

  const handleViewRsvps = async (eventId) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
      setEventRsvps([]);
      return;
    }

    setExpandedEventId(eventId);
    setLoadingRsvps(true);
    const { data } = await getRSVPsForEvent(eventId);
    setEventRsvps(data || []);
    setLoadingRsvps(false);
  };

  const handleDeleteRsvp = async (rsvpId, eventId) => {
    if (!window.confirm('Delete this RSVP?')) return;

    const { error } = await deleteRSVP(rsvpId);
    if (!error) {
      // Refresh RSVPs for this event
      const { data } = await getRSVPsForEvent(eventId);
      setEventRsvps(data || []);
      // Update count
      const { count } = await getRSVPCount(eventId);
      setRsvpCounts((prev) => ({ ...prev, [eventId]: count }));
    }
  };

  const exportRsvpsCsv = (event) => {
    const headers = ['Name', 'RSVP Date'];
    const rows = eventRsvps.map((rsvp) => [
      rsvp.name,
      new Date(rsvp.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rsvps-${event.title.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleCreateNew = () => {
    setEditingEvent(null);
    setFormData(emptyForm);
    setShowForm(true);
    setError('');
  };

  const handleEdit = (event) => {
    const eventDate = new Date(event.event_date);
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      event_date: eventDate.toISOString().split('T')[0],
      event_time: eventDate.toTimeString().slice(0, 5),
      is_active: event.is_active,
      time_pacific: event.time_pacific || '',
      time_eastern: event.time_eastern || '',
      time_uk: event.time_uk || '',
      time_europe: event.time_europe || '',
    });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    // Validate
    if (!formData.title.trim()) {
      setError('Title is required');
      setSaving(false);
      return;
    }
    if (!formData.event_date || !formData.event_time) {
      setError('Date and time are required');
      setSaving(false);
      return;
    }

    // Combine date and time into ISO string
    const eventDateTime = new Date(
      `${formData.event_date}T${formData.event_time}:00Z`
    );

    const eventData = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      event_date: eventDateTime.toISOString(),
      is_active: formData.is_active,
      time_pacific: formData.time_pacific.trim() || null,
      time_eastern: formData.time_eastern.trim() || null,
      time_uk: formData.time_uk.trim() || null,
      time_europe: formData.time_europe.trim() || null,
    };

    let result;
    if (editingEvent) {
      result = await updateEvent(editingEvent.id, eventData);
    } else {
      result = await createEvent(eventData);
    }

    if (result.error) {
      setError(result.error.message || 'Failed to save event');
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowForm(false);
    setEditingEvent(null);
    setFormData(emptyForm);
    fetchEvents();
  };

  const handleDelete = async (eventId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this event? This will also delete all RSVPs for this event.'
      )
    ) {
      return;
    }

    const { error } = await deleteEvent(eventId);
    if (!error) {
      if (expandedEventId === eventId) {
        setExpandedEventId(null);
        setEventRsvps([]);
      }
      fetchEvents();
    }
  };

  const handleToggleActive = async (event) => {
    await updateEvent(event.id, { is_active: !event.is_active });
    fetchEvents();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatRsvpDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}>
          Loading events...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2
          style={{
            fontFamily: 'Libre Baskerville, serif',
            fontSize: '1.5rem',
            color: '#101827',
          }}
        >
          Events
        </h2>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 rounded-lg text-white transition-colors hover:opacity-90"
          style={{
            fontFamily: 'Inter, sans-serif',
            backgroundColor: '#4D1E22',
          }}
        >
          + Create Event
        </button>
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3
                  style={{
                    fontFamily: 'Libre Baskerville, serif',
                    fontSize: '1.25rem',
                    color: '#101827',
                  }}
                >
                  {editingEvent ? 'Edit Event' : 'Create Event'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingEvent(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm text-gray-600">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4D1E22]"
                    placeholder="Soft Regulation Live Q+A"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm text-gray-600">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4D1E22]"
                    placeholder="A live Q&A just for those of you inside Soft Regulation..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm text-gray-600">
                      Date (UTC) *
                    </label>
                    <input
                      type="date"
                      value={formData.event_date}
                      onChange={(e) =>
                        setFormData({ ...formData, event_date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4D1E22]"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm text-gray-600">
                      Time (UTC) *
                    </label>
                    <input
                      type="time"
                      value={formData.event_time}
                      onChange={(e) =>
                        setFormData({ ...formData, event_time: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4D1E22]"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Display times (shown on RSVP page):
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm text-gray-500">
                        Pacific
                      </label>
                      <input
                        type="text"
                        value={formData.time_pacific}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            time_pacific: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4D1E22]"
                        placeholder="10:30 AM Pacific"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-500">
                        Eastern
                      </label>
                      <input
                        type="text"
                        value={formData.time_eastern}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            time_eastern: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4D1E22]"
                        placeholder="1:30 PM Eastern"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-500">
                        UK
                      </label>
                      <input
                        type="text"
                        value={formData.time_uk}
                        onChange={(e) =>
                          setFormData({ ...formData, time_uk: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4D1E22]"
                        placeholder="6:30 PM UK"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm text-gray-500">
                        Central Europe
                      </label>
                      <input
                        type="text"
                        value={formData.time_europe}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            time_europe: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4D1E22]"
                        placeholder="7:30 PM Central Europe"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-600">
                    Active (visible on RSVP page)
                  </label>
                </div>

                {error && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingEvent(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 rounded text-white disabled:opacity-50"
                    style={{ backgroundColor: '#4D1E22' }}
                  >
                    {saving
                      ? 'Saving...'
                      : editingEvent
                      ? 'Update Event'
                      : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      {events.length === 0 ? (
        <div
          className="text-center py-12 bg-white rounded-lg"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <p className="text-gray-500 mb-4">No events yet</p>
          <button
            onClick={handleCreateNew}
            className="text-[#4D1E22] hover:underline"
          >
            Create your first event
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const isPast = new Date(event.event_date) < new Date();
            const isExpanded = expandedEventId === event.id;
            const rsvpCount = rsvpCounts[event.id] || 0;

            return (
              <div
                key={event.id}
                className="bg-white rounded-lg overflow-hidden"
                style={{
                  border: '1px solid #E5E7EB',
                  opacity: isPast ? 0.7 : 1,
                }}
              >
                {/* Event Header */}
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3
                          style={{
                            fontFamily: 'Libre Baskerville, serif',
                            fontSize: '1.125rem',
                            color: '#101827',
                          }}
                        >
                          {event.title}
                        </h3>
                        {event.is_active && !isPast && (
                          <span
                            className="px-2 py-1 text-xs rounded-full"
                            style={{
                              backgroundColor: '#D1FAE5',
                              color: '#059669',
                            }}
                          >
                            Active
                          </span>
                        )}
                        {isPast && (
                          <span
                            className="px-2 py-1 text-xs rounded-full"
                            style={{
                              backgroundColor: '#F3F4F6',
                              color: '#6B7280',
                            }}
                          >
                            Past
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {formatDate(event.event_date)}
                        {event.time_pacific && ` at ${event.time_pacific}`}
                      </p>
                      {event.description && (
                        <p className="text-gray-500 text-sm line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <div className="mt-3">
                        <button
                          onClick={() => handleViewRsvps(event.id)}
                          className="text-sm font-medium hover:underline"
                          style={{ color: '#4D1E22' }}
                        >
                          {rsvpCount} RSVPs {isExpanded ? '▲' : '▼'}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!isPast && (
                        <button
                          onClick={() => handleToggleActive(event)}
                          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                          style={{
                            borderColor: event.is_active ? '#DC2626' : '#059669',
                            color: event.is_active ? '#DC2626' : '#059669',
                          }}
                        >
                          {event.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(event)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded RSVPs Section */}
                {isExpanded && (
                  <div
                    className="border-t px-6 py-4"
                    style={{ backgroundColor: '#F9FAFB' }}
                  >
                    {loadingRsvps ? (
                      <p className="text-gray-500 text-sm">Loading RSVPs...</p>
                    ) : eventRsvps.length === 0 ? (
                      <p className="text-gray-500 text-sm">No RSVPs yet for this event.</p>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-sm text-gray-600">
                            {eventRsvps.length} people RSVPed
                          </p>
                          <button
                            onClick={() => exportRsvpsCsv(event)}
                            className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-white"
                          >
                            Export CSV
                          </button>
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {eventRsvps.map((rsvp) => (
                            <div
                              key={rsvp.id}
                              className="flex justify-between items-center bg-white p-3 rounded border"
                              style={{ borderColor: '#E5E7EB' }}
                            >
                              <div>
                                <p className="font-medium text-sm">{rsvp.name}</p>
                                <p className="text-xs text-gray-500">
                                  RSVPed {formatRsvpDate(rsvp.created_at)}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeleteRsvp(rsvp.id, event.id)}
                                className="text-xs text-red-600 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
