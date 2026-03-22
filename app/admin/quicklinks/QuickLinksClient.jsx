'use client';
import { useState, useEffect } from 'react';

export default function QuickLinksClient() {
  const [quickLinks, setQuickLinks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    certId: '',
    sessionId: '',
    couponCode: '',
    campaignName: '',
    campaignSource: ''
  });
  const [certs, setCerts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [copied, setCopied] = useState(null);

  // Fetch quick links on mount
  useEffect(() => {
    const fetchQuickLinks = async () => {
      try {
        // Try to fetch from database
        const res = await fetch('/api/quicklink/list');
        if (res.ok) {
          const data = await res.json();
          setQuickLinks(data);
        }
      } catch (err) {
        console.error('Error fetching quick links:', err);
      }
    };

    fetchQuickLinks();
  }, []);

  // Fetch certifications and sessions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const certRes = await fetch('/api/certifications');
        const certData = await certRes.json();
        setCerts(certData);

        const sessRes = await fetch('/api/sessions');
        const sessData = await sessRes.json();
        setSessions(sessData);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  const createQuickLink = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const res = await fetch('/api/quicklink/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create quick link');
        console.error('Error response:', data);
        return;
      }

      setQuickLinks([data.quickLink, ...quickLinks]);
      setFormData({ certId: '', sessionId: '', couponCode: '', campaignName: '', campaignSource: '' });
      setShowForm(false);
      setSuccessMsg('✅ Quick link created successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      const errMsg = `Error: ${err.message}`;
      setErrorMsg(errMsg);
      console.error('Error creating quick link:', err);
    }
  };

  const copyToClipboard = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>Marketing Quick Links</h2>
        <p style={{ color: 'var(--slate)', fontSize: 14 }}>Create short shareable links for marketing campaigns</p>
      </div>

      {!showForm ? (
        <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ marginBottom: '20px' }}>
          + Create New Link
        </button>
      ) : (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
          <h3>Create Quick Link</h3>
          {errorMsg && <div style={{ padding: '12px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', marginBottom: '16px', fontSize: 14 }}>{errorMsg}</div>}
          {successMsg && <div style={{ padding: '12px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#15803D', borderRadius: '8px', marginBottom: '16px', fontSize: 14 }}>{successMsg}</div>}
          <form onSubmit={createQuickLink}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Certification</label>
                <select
                  className="form-input form-select"
                  value={formData.certId}
                  onChange={e => setFormData({ ...formData, certId: e.target.value, sessionId: '' })}
                  required
                >
                  <option value="">Select certification...</option>
                  {certs.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Session (Optional)</label>
                <select
                  className="form-input form-select"
                  value={formData.sessionId}
                  onChange={e => setFormData({ ...formData, sessionId: e.target.value })}
                >
                  <option value="">All sessions</option>
                  {sessions.filter(s => !formData.certId || s.certification_id === formData.certId).map(s => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.session_date).toLocaleDateString()} - {s.format} ({s.timezone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Coupon Code (Optional)</label>
                <input
                  className="form-input"
                  placeholder="e.g., HALF50"
                  value={formData.couponCode}
                  onChange={e => setFormData({ ...formData, couponCode: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Campaign Name</label>
                <input
                  className="form-input"
                  placeholder="e.g., Q2 Marketing Push"
                  value={formData.campaignName}
                  onChange={e => setFormData({ ...formData, campaignName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Campaign Source (for tracking)</label>
                <input
                  className="form-input"
                  placeholder="e.g., LinkedIn, Email, Twitter"
                  value={formData.campaignSource}
                  onChange={e => setFormData({ ...formData, campaignSource: e.target.value })}
                />
              </div>
            </div>

            {/* Preview section */}
            {formData.certId && (
              <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>📋 Link Preview:</div>
                <div style={{ fontSize: 13, color: 'var(--slate)' }}>
                  <div><strong>Certification:</strong> {certs.find(c => c.id === formData.certId)?.title}</div>
                  {formData.sessionId && sessions.find(s => s.id === parseInt(formData.sessionId)) && (
                    <div><strong>Date:</strong> {new Date(sessions.find(s => s.id === parseInt(formData.sessionId)).session_date).toLocaleDateString()}</div>
                  )}
                  {!formData.sessionId && (
                    <div><strong>Date:</strong> {sessions.filter(s => s.certification_id === formData.certId).length > 0 ? `${sessions.filter(s => s.certification_id === formData.certId).length} available sessions` : 'No sessions available'}</div>
                  )}
                  {formData.couponCode && <div><strong>Coupon:</strong> {formData.couponCode}</div>}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary">Create Link</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Links Table */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Short Link</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Certification</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Session Date</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Campaign</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Clicks</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Created</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: 13 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {quickLinks.map((link, idx) => {
              const cert = certs.find(c => c.id === link.cert_id);
              const session = link.session_id ? sessions.find(s => s.id === link.session_id) : null;
              const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/q/${link.short_code}`;
              return (
                <tr key={link.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: 12, color: 'var(--navy)', fontWeight: 600 }}>
                    /q/{link.short_code}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{cert?.title || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontSize: 13 }}>
                      {session ? new Date(session.session_date).toLocaleDateString() : 'Any date'}
                    </div>
                    {session && <div style={{ fontSize: 11, color: 'var(--slate)' }}>{session.format} ({session.timezone})</div>}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontSize: 13 }}>{link.campaign_name}</div>
                    {link.campaign_source && <div style={{ fontSize: 12, color: 'var(--slate)' }}>{link.campaign_source}</div>}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{link.clicks}</td>
                  <td style={{ padding: '12px', fontSize: 12, color: 'var(--slate)' }}>
                    {new Date(link.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      className="btn btn-sm"
                      style={{ background: copied === link.id ? '#D1FAE5' : '#E0E7FF', color: copied === link.id ? '#065F46' : 'var(--navy)', padding: '4px 8px', fontSize: 12 }}
                      onClick={() => copyToClipboard(fullUrl, link.id)}
                    >
                      {copied === link.id ? '✓ Copied' : 'Copy'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {quickLinks.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--slate)' }}>
            No quick links created yet
          </div>
        )}
      </div>
    </div>
  );
}
