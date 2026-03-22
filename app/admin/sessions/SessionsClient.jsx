'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SessionsClient({ sessions: initialSessions }) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [certifications, setCertifications] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSession, setNewSession] = useState({
    certification_id: '',
    session_date: '',
    format: 'Virtual',
    max_seats: 30,
    timezone: 'EST'
  });

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const response = await fetch('/api/certifications');
        if (response.ok) {
          const data = await response.json();
          setCertifications(data);
        }
      } catch (error) {
        console.error('Error fetching certifications:', error);
      }
    };
    fetchCertifications();
  }, []);

  const startEdit = (session) => {
    setEditingId(session.id);
    setEditForm({
      session_date: session.session_date,
      format: session.format,
      max_seats: session.max_seats,
      is_active: session.is_active
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          session_date: editForm.session_date,
          format: editForm.format,
          max_seats: editForm.max_seats,
          is_active: editForm.is_active
        })
      });

      if (response.ok) {
        // Update the sessions list in state instead of reloading
        setSessions(sessions.map(s => s.id === editingId ? { ...s, ...editForm, is_active: editForm.is_active } : s));
        setEditingId(null);
        setEditForm({});
      } else {
        alert('Failed to update session');
      }
    } catch (error) {
      alert('Error updating session: ' + error.message);
    }
    setLoading(false);
  };

  const deleteSession = async (id, courseTitle) => {
    if (!confirm(`Delete the session for "${courseTitle}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const response = await fetch('/api/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        setSessions(sessions.filter(s => s.id !== id));
      } else {
        const err = await response.json();
        alert('Failed to delete session: ' + (err.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error deleting session: ' + error.message);
    }
    setLoading(false);
  };

  const addNewSession = async () => {
    if (!newSession.certification_id || !newSession.session_date || !newSession.max_seats) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession)
      });

      if (response.ok) {
        const createdSession = await response.json();
        // Add the new session to the list
        setSessions([createdSession, ...sessions]);
        // Reset the form
        setNewSession({
          certification_id: '',
          session_date: '',
          format: 'Virtual',
          max_seats: 30,
          timezone: 'EST'
        });
        setShowAddForm(false);
        alert('✅ Session created successfully!');
      } else {
        const error = await response.json();
        alert('Failed to create session: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error creating session: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#0B1629', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#C9A84C', fontWeight: 'bold', fontSize: '20px' }}>AgileEdge</span>
        <button onClick={() => router.push('/admin')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>← Back</button>
      </div>
      <div style={{ padding: '32px' }}>
        <h1 style={{ color: '#0B1629', marginBottom: '8px' }}>Upcoming Sessions Management</h1>
        <p style={{ color: '#6B7280', marginBottom: '24px', fontSize: '14px' }}>
          Manage the upcoming sessions displayed on the main website. Changes are saved to the database.
        </p>

        {/* Add New Session Form */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ color: '#0B1629', margin: 0 }}>Add New Session</h2>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
            >
              {showAddForm ? '✕ Close' : '+ Add Session'}
            </button>
          </div>

          {showAddForm && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#0B1629' }}>Certification *</label>
                <select 
                  value={newSession.certification_id} 
                  onChange={(e) => setNewSession({ ...newSession, certification_id: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="">Select a certification</option>
                  {certifications.map(cert => (
                    <option key={cert.id} value={cert.id}>{cert.title} ({cert.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#0B1629' }}>Session Date *</label>
                <input 
                  type="date" 
                  value={newSession.session_date} 
                  onChange={(e) => setNewSession({ ...newSession, session_date: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#0B1629' }}>Format *</label>
                <select 
                  value={newSession.format} 
                  onChange={(e) => setNewSession({ ...newSession, format: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="Virtual">Virtual</option>
                  <option value="In-Person">In-Person</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#0B1629' }}>Max Seats *</label>
                <input 
                  type="number" 
                  min="1"
                  value={newSession.max_seats} 
                  onChange={(e) => setNewSession({ ...newSession, max_seats: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#0B1629' }}>Timezone *</label>
                <select 
                  value={newSession.timezone} 
                  onChange={(e) => setNewSession({ ...newSession, timezone: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '14px' }}
                >
                  <option value="EST">EST (Eastern Standard Time)</option>
                  <option value="CST">CST (Central Standard Time)</option>
                  <option value="PST">PST (Pacific Standard Time)</option>
                  <option value="GMT">GMT (Greenwich Mean Time)</option>
                  <option value="IST">IST (Indian Standard Time)</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setShowAddForm(false)}
                  style={{ background: '#6B7280', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={addNewSession}
                  disabled={loading}
                  style={{ background: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
                >
                  {loading ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sessions Table */}
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0B1629', color: 'white' }}>
                {['Course', 'Code', 'Date', 'Format', 'Seats', 'Booked', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.length > 0 ? (
                sessions.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #E2E8F0', background: i % 2 === 0 ? 'white' : '#F8FAFC' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{s.course_title || s.title}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}><span style={{ background: '#F5EDD6', color: '#92400E', padding: '2px 8px', borderRadius: '4px' }}>{s.code}</span></td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                    {editingId === s.id ? (
                      <input
                        type="date"
                        value={editForm.session_date ? new Date(editForm.session_date).toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditForm({ ...editForm, session_date: e.target.value })}
                        style={{ width: '120px', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    ) : (
                      new Date(s.session_date).toLocaleDateString()
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                    {editingId === s.id ? (
                      <select
                        value={editForm.format || ''}
                        onChange={(e) => setEditForm({ ...editForm, format: e.target.value })}
                        style={{ width: '100px', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                      >
                        <option value="Virtual">Virtual</option>
                        <option value="In-Person">In-Person</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    ) : (
                      s.format
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                    {editingId === s.id ? (
                      <input
                        type="number"
                        value={editForm.max_seats || ''}
                        onChange={(e) => setEditForm({ ...editForm, max_seats: parseInt(e.target.value) })}
                        style={{ width: '60px', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    ) : (
                      s.max_seats
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                    <span style={{ background: '#E0F2FE', color: '#0277BD', padding: '2px 8px', borderRadius: '4px' }}>
                      {s.booked || 0}/{s.max_seats}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                    {editingId === s.id ? (
                      <select
                        value={editForm.is_active ? 'true' : 'false'}
                        onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'true' })}
                        style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    ) : (
                      <span style={{ background: s.is_active ? '#D1FAE5' : '#FEE2E2', color: s.is_active ? '#065F46' : '#991B1B', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                    {editingId === s.id ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={saveEdit}
                          disabled={loading}
                          style={{ background: '#10B981', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{ background: '#6B7280', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => startEdit(s)}
                          style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSession(s.id, s.course_title || s.title)}
                          disabled={loading}
                          style={{ background: '#EF4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#6B7280', fontSize: '14px' }}>
                    No sessions yet. Click "Add Session" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}