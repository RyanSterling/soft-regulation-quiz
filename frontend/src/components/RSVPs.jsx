import { useState, useEffect } from 'react';
import {
  getAllEvents,
  getRSVPsForEvent,
  deleteRSVP,
} from '../lib/supabase';

export default function RSVPs() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('all');
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchRSVPs();
  }, [selectedEventId]);

  async function fetchEvents() {
    const { data } = await getAllEvents();
    setEvents(data || []);
    if (data && data.length > 0) {
      // Default to most recent future event or first event
      const futureEvents = data.filter(
        (e) => new Date(e.event_date) >= new Date()
      );
      const defaultEvent = futureEvents.length > 0 ? futureEvents[0] : data[0];
      setSelectedEventId(defaultEvent.id);
    }
  }

  async function fetchRSVPs() {
    setLoading(true);
    if (selectedEventId && selectedEventId !== 'all') {
      const { data } = await getRSVPsForEvent(selectedEventId);
      setRsvps(data || []);
    } else if (selectedEventId === 'all') {
      // Fetch RSVPs for all events
      let allRsvps = [];
      for (const event of events) {
        const { data } = await getRSVPsForEvent(event.id);
        if (data) {
          allRsvps = [
            ...allRsvps,
            ...data.map((r) => ({
              ...r,
              eventTitle: event.title,
              eventDate: event.event_date,
            })),
          ];
        }
      }
      // Sort by created_at descending
      allRsvps.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setRsvps(allRsvps);
    }
    setLoading(false);
  }

  const handleDelete = async (rsvpId) => {
    if (!window.confirm('Are you sure you want to delete this RSVP?')) {
      return;
    }
    const { error } = await deleteRSVP(rsvpId);
    if (!error) {
      fetchRSVPs();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Filter RSVPs by search term
  const filteredRsvps = rsvps.filter((rsvp) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      rsvp.name.toLowerCase().includes(term) ||
      rsvp.email.toLowerCase().includes(term)
    );
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'RSVP Date', 'UTM Source', 'UTM Campaign'];
    const rows = filteredRsvps.map((rsvp) => [
      rsvp.name,
      rsvp.email,
      formatDate(rsvp.created_at),
      rsvp.utm_source || '',
      rsvp.utm_campaign || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rsvps-${selectedEvent?.title || 'all'}-${
      new Date().toISOString().split('T')[0]
    }.csv`;
    link.click();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2
          style={{
            fontFamily: 'Libre Baskerville, serif',
            fontSize: '1.5rem',
            color: '#101827',
          }}
        >
          RSVPs
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D1E22]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <option value="all">All Events</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} (
                {new Date(event.event_date).toLocaleDateString()})
              </option>
            ))}
          </select>
          <button
            onClick={exportToCSV}
            disabled={filteredRsvps.length === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div
        className="bg-white rounded-lg p-6 mb-6"
        style={{ border: '1px solid #E5E7EB' }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p
              className="text-3xl font-bold"
              style={{ color: '#4D1E22', fontFamily: 'Libre Baskerville, serif' }}
            >
              {filteredRsvps.length}
            </p>
            <p
              className="text-sm text-gray-500"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Total RSVPs
            </p>
          </div>
          {selectedEvent && (
            <>
              <div>
                <p
                  className="text-lg font-medium"
                  style={{ color: '#101827', fontFamily: 'Inter, sans-serif' }}
                >
                  {selectedEvent.title}
                </p>
                <p
                  className="text-sm text-gray-500"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Selected Event
                </p>
              </div>
              <div>
                <p
                  className="text-lg font-medium"
                  style={{ color: '#101827', fontFamily: 'Inter, sans-serif' }}
                >
                  {new Date(selectedEvent.event_date).toLocaleDateString()}
                </p>
                <p
                  className="text-sm text-gray-500"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Event Date
                </p>
              </div>
              <div>
                <p
                  className="text-lg font-medium"
                  style={{
                    color: selectedEvent.is_active ? '#059669' : '#6B7280',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {selectedEvent.is_active ? 'Active' : 'Inactive'}
                </p>
                <p
                  className="text-sm text-gray-500"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Status
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D1E22]"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
      </div>

      {/* RSVP List */}
      {loading ? (
        <div className="text-center py-12">
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#6D6B6B' }}>
            Loading RSVPs...
          </p>
        </div>
      ) : filteredRsvps.length === 0 ? (
        <div
          className="text-center py-12 bg-white rounded-lg"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <p className="text-gray-500">
            {searchTerm
              ? 'No RSVPs match your search'
              : 'No RSVPs yet for this event'}
          </p>
        </div>
      ) : (
        <div
          className="bg-white rounded-lg overflow-hidden"
          style={{ border: '1px solid #E5E7EB' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB' }}>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Name
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Email
                  </th>
                  {selectedEventId === 'all' && (
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Event
                    </th>
                  )}
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    RSVP Date
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Source
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="hover:bg-gray-50">
                    <td
                      className="px-4 py-3 whitespace-nowrap"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {rsvp.name}
                    </td>
                    <td
                      className="px-4 py-3 whitespace-nowrap text-sm text-gray-600"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {rsvp.email}
                    </td>
                    {selectedEventId === 'all' && (
                      <td
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-600"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {rsvp.eventTitle}
                      </td>
                    )}
                    <td
                      className="px-4 py-3 whitespace-nowrap text-sm text-gray-500"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {formatDate(rsvp.created_at)}
                    </td>
                    <td
                      className="px-4 py-3 whitespace-nowrap text-sm text-gray-500"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {rsvp.utm_source || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete(rsvp.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
