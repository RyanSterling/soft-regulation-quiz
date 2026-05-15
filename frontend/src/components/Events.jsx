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

  // Detail view state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventRsvps, setEventRsvps] = useState([]);
  const [loadingRsvps, setLoadingRsvps] = useState(false);
  const [rsvpSearch, setRsvpSearch] = useState('');

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
      const counts = {};
      for (const event of data) {
        const { count } = await getRSVPCount(event.id);
        counts[event.id] = count;
      }
      setRsvpCounts(counts);
    }
    setLoading(false);
  }

  const handleSelectEvent = async (event) => {
    setSelectedEvent(event);
    setLoadingRsvps(true);
    setRsvpSearch('');
    const { data } = await getRSVPsForEvent(event.id);
    setEventRsvps(data || []);
    setLoadingRsvps(false);
  };

  const handleBackToList = () => {
    setSelectedEvent(null);
    setEventRsvps([]);
    setRsvpSearch('');
  };

  const handleDeleteRsvp = async (rsvpId) => {
    if (!window.confirm('Delete this RSVP?')) return;

    const { error } = await deleteRSVP(rsvpId);
    if (!error) {
      const { data } = await getRSVPsForEvent(selectedEvent.id);
      setEventRsvps(data || []);
      const { count } = await getRSVPCount(selectedEvent.id);
      setRsvpCounts((prev) => ({ ...prev, [selectedEvent.id]: count }));
    }
  };

  const exportRsvpsCsv = () => {
    const headers = ['Name', 'RSVP Date'];
    const rows = filteredRsvps.map((rsvp) => [
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
    link.download = `rsvps-${selectedEvent.title.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleCreateNew = () => {
    setEditingEvent(null);
    setFormData(emptyForm);
    setShowForm(true);
    setError('');
  };

  const handleEdit = (event, e) => {
    e.stopPropagation();
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

  const handleDelete = async (eventId, e) => {
    e.stopPropagation();
    if (
      !window.confirm(
        'Delete this event and all its RSVPs?'
      )
    ) {
      return;
    }

    const { error } = await deleteEvent(eventId);
    if (!error) {
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(null);
        setEventRsvps([]);
      }
      fetchEvents();
    }
  };

  const handleToggleActive = async (event, e) => {
    e.stopPropagation();
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

  // Filter RSVPs by search
  const filteredRsvps = eventRsvps.filter((rsvp) => {
    if (!rsvpSearch) return true;
    return rsvp.name.toLowerCase().includes(rsvpSearch.toLowerCase());
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}>
          Loading events...
        </p>
      </div>
    );
  }

  // DETAIL VIEW - Selected Event
  if (selectedEvent) {
    const isPast = new Date(selectedEvent.event_date) < new Date();

    return (
      <div>
        {/* Back button */}
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Events
        </button>

        {/* Event Header */}
        <div
          className="bg-white rounded-lg p-6 mb-6"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2
                  style={{
                    fontFamily: 'Libre Baskerville, serif',
                    fontSize: '1.5rem',
                    color: '#101827',
                  }}
                >
                  {selectedEvent.title}
                </h2>
                {selectedEvent.is_active && !isPast && (
                  <span
                    className="px-2 py-1 text-xs rounded-full"
                    style={{ backgroundColor: '#D1FAE5', color: '#059669' }}
                  >
                    Active
                  </span>
                )}
                {isPast && (
                  <span
                    className="px-2 py-1 text-xs rounded-full"
                    style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                  >
                    Past
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-1">
                {formatDate(selectedEvent.event_date)}
                {selectedEvent.time_pacific && ` at ${selectedEvent.time_pacific}`}
              </p>
              {selectedEvent.description && (
                <p className="text-gray-500 text-sm mt-2">{selectedEvent.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleEdit(selectedEvent, e)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* RSVPs Section */}
        <div
          className="bg-white rounded-lg"
          style={{ border: '1px solid #E5E7EB' }}
        >
          {/* RSVPs Header */}
          <div className="p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3
                  style={{
                    fontFamily: 'Libre Baskerville, serif',
                    fontSize: '1.25rem',
                    color: '#101827',
                  }}
                >
                  RSVPs
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {rsvpCounts[selectedEvent.id] || 0} people registered
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={rsvpSearch}
                  onChange={(e) => setRsvpSearch(e.target.value)}
                  placeholder="Search by name..."
                  className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#4D1E22]"
                  style={{ fontFamily: 'Inter, sans-serif', width: '200px' }}
                />
                <button
                  onClick={exportRsvpsCsv}
                  disabled={filteredRsvps.length === 0}
                  className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* RSVPs List */}
          <div className="divide-y" style={{ borderColor: '#E5E7EB' }}>
            {loadingRsvps ? (
              <div className="p-8 text-center text-gray-500">Loading RSVPs...</div>
            ) : filteredRsvps.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {rsvpSearch ? 'No RSVPs match your search' : 'No RSVPs yet'}
              </div>
            ) : (
              filteredRsvps.map((rsvp) => (
                <div
                  key={rsvp.id}
                  className="px-6 py-4 flex justify-between items-center hover:bg-gray-50"
                >
                  <div>
                    <p
                      className="font-medium"
                      style={{ fontFamily: 'Inter, sans-serif', color: '#101827' }}
                    >
                      {rsvp.name}
                    </p>
                    <p
                      className="text-sm text-gray-500"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      RSVPed {formatRsvpDate(rsvp.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteRsvp(rsvp.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW - All Events
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

                {error && <p className="text-red-600 text-sm">{error}</p>}

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
        <div className="space-y-3">
          {events.map((event) => {
            const isPast = new Date(event.event_date) < new Date();
            const rsvpCount = rsvpCounts[event.id] || 0;

            return (
              <div
                key={event.id}
                onClick={() => handleSelectEvent(event)}
                className="bg-white rounded-lg p-5 cursor-pointer hover:shadow-md transition-shadow"
                style={{
                  border: '1px solid #E5E7EB',
                  opacity: isPast ? 0.7 : 1,
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3
                        style={{
                          fontFamily: 'Libre Baskerville, serif',
                          fontSize: '1.0625rem',
                          color: '#101827',
                        }}
                      >
                        {event.title}
                      </h3>
                      {event.is_active && !isPast && (
                        <span
                          className="px-2 py-0.5 text-xs rounded-full"
                          style={{ backgroundColor: '#D1FAE5', color: '#059669' }}
                        >
                          Active
                        </span>
                      )}
                      {isPast && (
                        <span
                          className="px-2 py-0.5 text-xs rounded-full"
                          style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
                        >
                          Past
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">
                      {formatDate(event.event_date)}
                      {event.time_pacific && ` at ${event.time_pacific}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className="text-sm font-medium"
                      style={{ color: '#4D1E22' }}
                    >
                      {rsvpCount} RSVPs
                    </span>
                    <div className="flex items-center gap-2">
                      {!isPast && (
                        <button
                          onClick={(e) => handleToggleActive(event, e)}
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
                        onClick={(e) => handleEdit(event, e)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDelete(event.id, e)}
                        className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
