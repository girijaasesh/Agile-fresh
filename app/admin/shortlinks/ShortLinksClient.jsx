'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ── Helpers ───────────────────────────────────────────────────────────────────

const BASE = typeof window !== 'undefined' ? window.location.origin : '';

function shortUrl(code) {
  return `${BASE}/s/${code}`;
}

function isExpired(link) {
  return link.expires_at && new Date() > new Date(link.expires_at);
}

function statusOf(link) {
  if (!link.is_active) return { label: 'Inactive', color: '#94A3B8', bg: '#F1F5F9' };
  if (isExpired(link))   return { label: 'Expired',  color: '#EF4444', bg: '#FEE2E2' };
  return                        { label: 'Active',   color: '#059669', bg: '#DCFCE7' };
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function truncate(str, n = 48) {
  if (!str) return '—';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ShortLinksClient() {
  const router = useRouter();

  const [links, setLinks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [copied, setCopied]         = useState(null);   // short_code being copied
  const [qrCode, setQrCode]         = useState(null);   // short_code whose QR is shown
  const [deleteConfirm, setDeleteConfirm] = useState(null); // short_code awaiting confirm

  const [form, setForm] = useState({
    destination: '',
    title:       '',
    customAlias: '',
    expiresAt:   '',
    utmSource:   '',
    utmMedium:   '',
    utmCampaign: '',
  });
  const [showUtm, setShowUtm] = useState(false);

  // ── Data fetching ───────────────────────────────────────────────────────────

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/shorten');
      const data = await res.json();
      setLinks(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load links.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  // ── Toasts ──────────────────────────────────────────────────────────────────

  const flash = (msg, isError = false) => {
    if (isError) { setError(msg);   setTimeout(() => setError(''),   3500); }
    else         { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); }
  };

  // ── Create ──────────────────────────────────────────────────────────────────

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.destination.trim()) return;
    setSaving(true);
    setError('');

    try {
      const res  = await fetch('/api/shorten', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          destination: form.destination.trim(),
          title:       form.title.trim(),
          customAlias: form.customAlias.trim(),
          expiresAt:   form.expiresAt || null,
          utmSource:   form.utmSource.trim(),
          utmMedium:   form.utmMedium.trim(),
          utmCampaign: form.utmCampaign.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) { flash(data.error || 'Failed to create link', true); setSaving(false); return; }

      setLinks(prev => [data.link, ...prev]);
      setForm({ destination: '', title: '', customAlias: '', expiresAt: '', utmSource: '', utmMedium: '', utmCampaign: '' });
      setShowForm(false);
      setShowUtm(false);
      flash(`Created! Short URL: ${data.shortUrl}`);
      // Auto-copy
      navigator.clipboard.writeText(data.shortUrl).catch(() => {});
    } catch {
      flash('Network error — please try again.', true);
    }
    setSaving(false);
  };

  // ── Toggle active ───────────────────────────────────────────────────────────

  const toggleActive = async (link) => {
    const updated = { ...link, is_active: !link.is_active };
    setLinks(prev => prev.map(l => l.short_code === link.short_code ? updated : l));

    const res = await fetch(`/api/shorten/${link.short_code}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ is_active: !link.is_active }),
    });
    if (!res.ok) {
      setLinks(prev => prev.map(l => l.short_code === link.short_code ? link : l)); // revert
      flash('Could not update link.', true);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async (code) => {
    const res = await fetch(`/api/shorten/${code}`, { method: 'DELETE' });
    if (res.ok) {
      setLinks(prev => prev.filter(l => l.short_code !== code));
      flash('Link deleted.');
    } else {
      flash('Delete failed.', true);
    }
    setDeleteConfirm(null);
  };

  // ── Copy ────────────────────────────────────────────────────────────────────

  const copy = (code) => {
    navigator.clipboard.writeText(shortUrl(code)).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Stats ───────────────────────────────────────────────────────────────────

  const totalClicks  = links.reduce((a, l) => a + (l.clicks || 0), 0);
  const activeCount  = links.filter(l => l.is_active && !isExpired(l)).length;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', fontFamily: "'DM Sans', Arial, sans-serif" }}>

      {/* Top bar */}
      <div style={{ background: '#0B1629', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => router.push('/admin')} style={btnStyle('ghost')}>← Admin</button>
          <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: 18 }}>URL Shortener</span>
        </div>
        <button onClick={() => router.push('/admin/login')} style={btnStyle('ghost')}>Logout</button>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>

        {/* Toasts */}
        {error   && <div style={toast('error')}>{error}</div>}
        {success && <div style={toast('success')}>{success}</div>}

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Links',   value: links.length  },
            { label: 'Active Links',  value: activeCount   },
            { label: 'Total Clicks',  value: totalClicks   },
          ].map(s => (
            <div key={s.label} style={statCard}>
              <div style={{ fontSize: 30, fontWeight: 700, color: '#0B1629' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Create form */}
        {!showForm ? (
          <button onClick={() => setShowForm(true)} style={{ ...btnStyle('primary'), marginBottom: 20 }}>
            + Shorten a URL
          </button>
        ) : (
          <div style={card}>
            <h3 style={{ color: '#0B1629', marginBottom: 20, fontSize: 17 }}>New Short Link</h3>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

                <div style={{ gridColumn: '1 / -1', ...fieldWrap }}>
                  <label style={labelStyle}>Destination URL *</label>
                  <input
                    style={inputStyle}
                    placeholder="https://example.com/your-long-url"
                    value={form.destination}
                    onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Link Title / Label</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. LinkedIn SAFe SPC post"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Custom Alias (optional)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 13, color: '#94A3B8', whiteSpace: 'nowrap' }}>/s/</span>
                    <input
                      style={inputStyle}
                      placeholder="my-link"
                      value={form.customAlias}
                      onChange={e => setForm(f => ({ ...f, customAlias: e.target.value }))}
                    />
                  </div>
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Expires At (optional)</label>
                  <input
                    type="datetime-local"
                    style={inputStyle}
                    value={form.expiresAt}
                    onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                  />
                </div>

              </div>

              {/* UTM toggle */}
              <button type="button" onClick={() => setShowUtm(v => !v)}
                style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 14 }}>
                {showUtm ? '▾' : '▸'} UTM parameters {showUtm ? '(hide)' : '(optional)'}
              </button>

              {showUtm && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                  {[
                    ['utmSource',   'utm_source',   'linkedin'],
                    ['utmMedium',   'utm_medium',   'social'],
                    ['utmCampaign', 'utm_campaign', 'q2-launch'],
                  ].map(([key, label, ph]) => (
                    <div key={key} style={fieldWrap}>
                      <label style={labelStyle}>{label}</label>
                      <input style={inputStyle} placeholder={ph} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                    </div>
                  ))}
                </div>
              )}

              {/* Preview */}
              {form.destination && (
                <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#15803D' }}>
                  <strong>Short URL preview:</strong>{' '}
                  <code>{BASE}/s/{form.customAlias.trim() || '<auto>'}</code>
                  {' → '}
                  <span style={{ color: '#64748B' }}>{truncate(form.destination, 60)}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving || !form.destination.trim()} style={btnStyle('primary')}>
                  {saving ? 'Creating…' : 'Create Short Link'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setShowUtm(false); }} style={btnStyle('ghost')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* QR Code modal */}
        {qrCode && (
          <div onClick={() => setQrCode(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background: 'white', borderRadius: 16, padding: 32, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0B1629', marginBottom: 16 }}>QR Code</div>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=2&data=${encodeURIComponent(shortUrl(qrCode))}`}
                alt="QR Code"
                width={220} height={220}
                style={{ display: 'block', borderRadius: 8 }}
              />
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 12, fontFamily: 'monospace' }}>{shortUrl(qrCode)}</div>
              <button onClick={() => setQrCode(null)} style={{ ...btnStyle('ghost'), marginTop: 20 }}>Close</button>
            </div>
          </div>
        )}

        {/* Delete confirm */}
        {deleteConfirm && (
          <div onClick={() => setDeleteConfirm(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background: 'white', borderRadius: 12, padding: '28px 32px', maxWidth: 380, width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#0B1629', marginBottom: 8 }}>Delete this link?</div>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 20, fontFamily: 'monospace' }}>/s/{deleteConfirm}</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => handleDelete(deleteConfirm)} style={{ ...btnStyle('danger'), flex: 1 }}>Yes, delete</button>
                <button onClick={() => setDeleteConfirm(null)} style={{ ...btnStyle('ghost'), flex: 1 }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Links table */}
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Loading…</div>
          ) : links.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>No short links yet. Create one above.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Short URL', 'Destination', 'Status', 'Clicks', 'Created', 'Expires', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {links.map((link, i) => {
                  const st = statusOf(link);
                  return (
                    <tr key={link.id} style={{ borderBottom: i < links.length - 1 ? '1px solid #F1F5F9' : 'none', background: i % 2 === 0 ? 'white' : '#FAFAFA' }}>

                      {/* Short URL */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0B1629', fontSize: 13 }}>
                          /s/{link.short_code}
                        </div>
                        {link.title && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{link.title}</div>}
                      </td>

                      {/* Destination */}
                      <td style={{ padding: '12px 14px', maxWidth: 260 }}>
                        <a href={link.destination} target="_blank" rel="noopener noreferrer"
                          style={{ color: '#0B1629', textDecoration: 'none', fontSize: 12, wordBreak: 'break-all' }}
                          title={link.destination}>
                          {truncate(link.destination, 50)}
                        </a>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: st.color, background: st.bg }}>
                          {st.label}
                        </span>
                      </td>

                      {/* Clicks */}
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0B1629' }}>
                        {link.clicks.toLocaleString()}
                        {link.last_clicked && (
                          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 400 }}>last {fmtDate(link.last_clicked)}</div>
                        )}
                      </td>

                      {/* Created */}
                      <td style={{ padding: '12px 14px', color: '#64748B', whiteSpace: 'nowrap' }}>{fmtDate(link.created_at)}</td>

                      {/* Expires */}
                      <td style={{ padding: '12px 14px', color: isExpired(link) ? '#EF4444' : '#64748B', whiteSpace: 'nowrap' }}>
                        {fmtDate(link.expires_at)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => copy(link.short_code)}
                            style={actionBtn(copied === link.short_code ? '#D1FAE5' : '#E0E7FF', copied === link.short_code ? '#065F46' : '#0B1629')}>
                            {copied === link.short_code ? '✓' : '⎘'} Copy
                          </button>

                          <button onClick={() => setQrCode(link.short_code)}
                            style={actionBtn('#F0F9FF', '#0369A1')}>
                            QR
                          </button>

                          <button onClick={() => toggleActive(link)}
                            style={actionBtn(link.is_active ? '#FEF9C3' : '#F1F5F9', link.is_active ? '#854D0E' : '#475569')}>
                            {link.is_active ? 'Pause' : 'Resume'}
                          </button>

                          <button onClick={() => setDeleteConfirm(link.short_code)}
                            style={actionBtn('#FEE2E2', '#991B1B')}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────

const card    = { background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 20 };
const statCard = { background: 'white', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' };
const fieldWrap = { display: 'flex', flexDirection: 'column', gap: 5 };
const labelStyle = { fontSize: 12, fontWeight: 600, color: '#374151' };
const inputStyle = {
  padding: '9px 12px', border: '1.5px solid #D1D5DB', borderRadius: 8,
  fontSize: 13, color: '#111827', outline: 'none', fontFamily: 'inherit', width: '100%',
};

function btnStyle(variant) {
  const base = { border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
  if (variant === 'primary') return { ...base, background: '#0B1629', color: 'white' };
  if (variant === 'danger')  return { ...base, background: '#EF4444', color: 'white' };
  return { ...base, background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' };
}

function actionBtn(bg, color) {
  return { background: bg, color, border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' };
}

function toast(type) {
  const base = { padding: '12px 16px', borderRadius: 8, fontSize: 13, marginBottom: 16, fontWeight: 500 };
  if (type === 'error')   return { ...base, background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' };
  return                         { ...base, background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC' };
}
