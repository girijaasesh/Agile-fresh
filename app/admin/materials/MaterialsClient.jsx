'use client';
import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const TYPE_ICONS = { pdf: '📄', ppt: '📊', word: '📝', video: '🎬' };
const TYPE_LABELS = { pdf: 'PDF', ppt: 'PowerPoint', word: 'Word Doc', video: 'Video' };

export default function MaterialsClient({ materials: init, certifications, permissions: initPerms, users }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [materials, setMaterials] = useState(init);
  const [permissions, setPermissions] = useState(initPerms);
  const [tab, setTab] = useState('materials');
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' | 'file'
  const [uploadProgress, setUploadProgress] = useState('');
  const [form, setForm] = useState({ title: '', type: 'pdf', file_url: '', certification_id: '', description: '' });
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const showError = (msg) => {
    setError(msg);
    setToast(msg);
    setTimeout(() => setToast(''), 5000);
  };

  // Permissions tab state
  const [userSearch, setUserSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [togglingKey, setTogglingKey] = useState(null);
  const [viewer, setViewer] = useState(null); // { url, title, type }

  // Build permission lookup: lowercase(email) -> certId -> { id, can_download }
  const permMap = useMemo(() => {
    const map = {};
    permissions.forEach(p => {
      const key = (p.user_email || '').toLowerCase();
      if (!map[key]) map[key] = {};
      map[key][p.certification_id] = { id: p.id, can_download: p.can_download };
    });
    return map;
  }, [permissions]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true); setError(''); setUploadProgress(`Uploading ${file.name}…`);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
      setForm(f => ({ ...f, file_url: data.url, type: data.type, title: f.title || file.name.replace(/\.[^.]+$/, '') }));
      setUploadProgress('✅ File uploaded successfully');
    } catch (e) { showError(e.message); setUploadProgress(''); }
    finally { setSaving(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const addMaterial = async () => {
    if (!form.title || !form.file_url || !form.certification_id) { showError('Fill in all required fields.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/admin/materials', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      const cert = certifications.find(c => c.id === form.certification_id);
      setMaterials(m => [{ ...data, cert_title: cert?.title, cert_code: cert?.code }, ...m]);
      setShowAdd(false);
      setForm({ title: '', type: 'pdf', file_url: '', certification_id: '', description: '' });
      setUploadProgress('');
    } catch (e) { showError(e.message); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id, is_active) => {
    await fetch('/api/admin/materials', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !is_active }),
    });
    setMaterials(m => m.map(x => x.id === id ? { ...x, is_active: !is_active } : x));
  };

  const deleteMaterial = async (id) => {
    if (!confirm('Delete this material?')) return;
    await fetch('/api/admin/materials', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setMaterials(m => m.filter(x => x.id !== id));
  };

  // Grant or update permission for a user+cert
  const grantPerm = async (email, certId, canDownload) => {
    const key = `${email}-${certId}`;
    setTogglingKey(key);
    try {
      const res = await fetch('/api/admin/permissions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: email, certification_id: certId, can_download: canDownload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      const cert = certifications.find(c => c.id === certId);
      setPermissions(p => {
        const idx = p.findIndex(x => x.user_email === email && x.certification_id === certId);
        const entry = { ...data, cert_title: cert?.title, cert_code: cert?.code };
        return idx >= 0 ? p.map((x, i) => i === idx ? entry : x) : [entry, ...p];
      });
    } catch (e) { showError(e.message); }
    finally { setTogglingKey(null); }
  };

  // Revoke all access for a user+cert
  const revokePerm = async (email, certId) => {
    const perm = permMap[email]?.[certId];
    if (!perm) return;
    const key = `${email}-${certId}`;
    setTogglingKey(key);
    try {
      await fetch('/api/admin/permissions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: perm.id }) });
      setPermissions(p => p.filter(x => x.id !== perm.id));
    } catch (e) { showError(e.message); }
    finally { setTogglingKey(null); }
  };

  return (
    <>
    <div style={{ minHeight: '100vh', background: '#F1F5F9', fontFamily: 'Arial, sans-serif' }}>
      {/* Error toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#EF4444', color: 'white', padding: '12px 24px', borderRadius: 10, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', maxWidth: 500, textAlign: 'center' }}>
          ⚠️ {toast}
        </div>
      )}
      {/* Header */}
      <div style={{ background: '#0B1629', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#C9A84C', fontWeight: 'bold', fontSize: '20px' }}>AgileEdge Admin</span>
        <button onClick={() => router.push('/admin')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>← Back</button>
      </div>

      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ color: '#0B1629', margin: 0 }}>Course Materials</h1>
          <button onClick={() => { setShowAdd(true); setError(''); }}
            style={{ background: '#1E3A5F', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            + Add Material
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'white', borderRadius: 8, padding: 4, width: 'fit-content' }}>
          {[['materials', `Materials (${materials.length})`], ['permissions', `Access Permissions`]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: '8px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 500,
                background: tab === id ? '#1E3A5F' : 'transparent', color: tab === id ? 'white' : '#64748B' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Add Material Modal */}
        {showAdd && (
          <div style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1E3A5F', marginBottom: 20 }}>Add Course Material</div>
            {/* Upload mode toggle */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#F1F5F9', borderRadius: 8, padding: 4, width: 'fit-content' }}>
              {[['url', '🔗 Paste URL'], ['file', '📤 Upload File']].map(([id, label]) => (
                <button key={id} type="button" onClick={() => { setUploadMode(id); setForm(f => ({ ...f, file_url: '' })); setUploadProgress(''); }}
                  style={{ padding: '7px 18px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 13,
                    background: uploadMode === id ? '#1E3A5F' : 'transparent', color: uploadMode === id ? 'white' : '#64748B' }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={lbl}>Title *</label>
                <input style={inp} placeholder="e.g. SAFe Overview Slides" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label style={lbl}>Type *</label>
                <select style={inp} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} disabled={uploadMode === 'file' && !!form.file_url}>
                  <option value="pdf">PDF Document</option>
                  <option value="ppt">PowerPoint</option>
                  <option value="word">Word Document</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Certification *</label>
                <select style={inp} value={form.certification_id} onChange={e => setForm(f => ({ ...f, certification_id: e.target.value }))}>
                  <option value="">— Select —</option>
                  {certifications.map(c => <option key={c.id} value={c.id}>{c.code} · {c.title}</option>)}
                </select>
              </div>

              {uploadMode === 'url' ? (
                <div>
                  <label style={lbl}>File URL * <span style={{ fontSize: 11, color: '#94A3B8' }}>(Google Drive, Dropbox, YouTube, etc.)</span></label>
                  <input style={inp} placeholder="https://..." value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} />
                </div>
              ) : (
                <div>
                  <label style={lbl}>Upload File * <span style={{ fontSize: 11, color: '#94A3B8' }}>(PDF, PPT, Word, MP4 — max 200MB)</span></label>
                  <input ref={fileInputRef} type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.mp4,.webm,.mov" onChange={handleFileChange} style={{ display: 'none' }} />
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={saving}
                      style={{ ...inp, cursor: 'pointer', background: '#F8FAFC', color: '#1E3A5F', fontWeight: 600, textAlign: 'center', border: '2px dashed #CBD5E1' }}>
                      {saving ? '⏳ Uploading…' : '📁 Choose File'}
                    </button>
                  </div>
                  {uploadProgress && (
                    <div style={{ marginTop: 6, fontSize: 13, color: uploadProgress.startsWith('✅') ? '#065F46' : '#64748B' }}>{uploadProgress}</div>
                  )}
                  {form.file_url && (
                    <div style={{ marginTop: 6, fontSize: 12, color: '#94A3B8', wordBreak: 'break-all' }}>
                      Uploaded: <a href={form.file_url} target="_blank" rel="noreferrer" style={{ color: '#1E3A5F' }}>View file ↗</a>
                    </div>
                  )}
                </div>
              )}

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Description</label>
                <input style={inp} placeholder="Optional description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            {error && <div style={{ color: '#EF4444', fontSize: 13, marginTop: 12 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={addMaterial} disabled={saving}
                style={{ background: '#1E3A5F', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                {saving ? 'Saving…' : 'Add Material'}
              </button>
              <button onClick={() => setShowAdd(false)} style={{ background: '#F1F5F9', color: '#64748B', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Materials Tab */}
        {tab === 'materials' && (
          <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {materials.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: '#94A3B8' }}>No materials yet. Click "Add Material" to get started.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0B1629', color: 'white' }}>
                    {['Type', 'Title', 'Course', 'Description', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m, i) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid #E2E8F0', background: i % 2 === 0 ? 'white' : '#F8FAFC' }}>
                      <td style={{ padding: '12px 16px', fontSize: 20 }}>{TYPE_ICONS[m.type] || '📁'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1E3A5F' }}>{m.title}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{TYPE_LABELS[m.type]}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        <span style={{ background: '#EEF5FF', color: '#1E3A5F', padding: '3px 8px', borderRadius: 4, fontWeight: 600, fontSize: 12 }}>{m.cert_code}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748B', maxWidth: 200 }}>{m.description || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: m.is_active ? '#D1FAE5' : '#FEE2E2', color: m.is_active ? '#065F46' : '#991B1B', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                          {m.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => setViewer({ url: m.file_url, title: m.title, type: m.type })}
                            style={{ fontSize: 12, padding: '5px 12px', border: '1px solid #BBF7D0', borderRadius: 6, cursor: 'pointer', background: '#F0FDF4', color: '#065F46' }}>
                            Open
                          </button>
                          <button onClick={() => toggleActive(m.id, m.is_active)}
                            style={{ fontSize: 12, padding: '5px 12px', border: '1px solid #E2E8F0', borderRadius: 6, cursor: 'pointer', background: 'white' }}>
                            {m.is_active ? 'Hide' : 'Show'}
                          </button>
                          <button onClick={() => deleteMaterial(m.id)}
                            style={{ fontSize: 12, padding: '5px 12px', border: '1px solid #FCA5A5', borderRadius: 6, cursor: 'pointer', background: '#FEF2F2', color: '#DC2626' }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Permissions Tab */}
        {tab === 'permissions' && (
          <>
            {error && <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 12, padding: '10px 16px', background: '#FEF2F2', borderRadius: 8 }}>{error}</div>}
            <div style={{ marginBottom: 16 }}>
              <input
                style={{ ...inp, maxWidth: 340, background: 'white' }}
                placeholder="Search users by name or email…"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
            </div>

            {users.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: '#94A3B8', background: 'white', borderRadius: 12 }}>No registered users found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {users
                  .filter(u =>
                    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                    (u.full_name || '').toLowerCase().includes(userSearch.toLowerCase())
                  )
                  .map(u => {
                    const isExpanded = expandedUser === u.email;
                    const userPerms = permMap[u.email.toLowerCase()] || {};
                    const grantedCount = Object.keys(userPerms).length;
                    return (
                      <div key={u.email} style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}>
                        {/* User row header */}
                        <div
                          onClick={() => setExpandedUser(isExpanded ? null : u.email)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', cursor: 'pointer', userSelect: 'none' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#EEF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#1E3A5F', fontSize: 15 }}>
                              {(u.full_name || u.email)[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14, color: '#1E3A5F' }}>{u.full_name || '—'}</div>
                              <div style={{ fontSize: 12, color: '#64748B' }}>{u.email}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {grantedCount > 0 && (
                              <span style={{ background: '#D1FAE5', color: '#065F46', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                                {grantedCount} course{grantedCount !== 1 ? 's' : ''} granted
                              </span>
                            )}
                            <span style={{ color: '#94A3B8', fontSize: 18 }}>{isExpanded ? '▲' : '▼'}</span>
                          </div>
                        </div>

                        {/* Expanded: certification access matrix */}
                        {isExpanded && (
                          <div style={{ borderTop: '1px solid #E2E8F0', padding: '16px 20px', background: '#F8FAFC' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Course Material Access</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {certifications.map(cert => {
                                const perm = userPerms[cert.id];
                                const hasAccess = !!perm;
                                const canDownload = perm?.can_download === true;
                                const togKey = `${u.email}-${cert.id}`;
                                const isToggling = togglingKey === togKey;
                                return (
                                  <div key={cert.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'white', borderRadius: 8, border: `1px solid ${hasAccess ? '#BBF7D0' : '#E2E8F0'}` }}>
                                    <div>
                                      <span style={{ background: '#EEF5FF', color: '#1E3A5F', padding: '2px 7px', borderRadius: 4, fontWeight: 700, fontSize: 12, marginRight: 8 }}>{cert.code}</span>
                                      <span style={{ fontSize: 13, color: '#374151' }}>{cert.title}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      {/* View access toggle */}
                                      <button
                                        disabled={isToggling}
                                        onClick={() => hasAccess ? revokePerm(u.email, cert.id) : grantPerm(u.email, cert.id, false)}
                                        style={{
                                          fontSize: 12, padding: '5px 12px', borderRadius: 6, cursor: isToggling ? 'not-allowed' : 'pointer', fontWeight: 600, border: 'none',
                                          background: hasAccess ? '#1E3A5F' : '#F1F5F9',
                                          color: hasAccess ? 'white' : '#64748B',
                                          opacity: isToggling ? 0.6 : 1,
                                        }}
                                      >
                                        {isToggling ? '…' : hasAccess ? '👁 View Access' : 'No Access'}
                                      </button>
                                      {/* Download toggle — only shown when user has view access */}
                                      {hasAccess && (
                                        <button
                                          disabled={isToggling}
                                          onClick={() => grantPerm(u.email, cert.id, !canDownload)}
                                          style={{
                                            fontSize: 12, padding: '5px 12px', borderRadius: 6, cursor: isToggling ? 'not-allowed' : 'pointer', fontWeight: 600, border: 'none',
                                            background: canDownload ? '#065F46' : '#F1F5F9',
                                            color: canDownload ? 'white' : '#64748B',
                                            opacity: isToggling ? 0.6 : 1,
                                          }}
                                        >
                                          {isToggling ? '…' : canDownload ? '⬇ Download ON' : '⬇ Download OFF'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        )}
      </div>
    </div>

    {/* Document Viewer Modal */}
    {viewer && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#0B1629', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>
            {TYPE_ICONS[viewer.type]} {viewer.title}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <a href={viewer.url} target="_blank" rel="noreferrer"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '6px 16px', borderRadius: 6, fontSize: 13, textDecoration: 'none' }}>
              Open in new tab ↗
            </a>
            <button onClick={() => setViewer(null)}
              style={{ background: '#EF4444', color: 'white', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              ✕ Close
            </button>
          </div>
        </div>
        <div style={{ flex: 1, background: '#111', position: 'relative' }}>
          {viewer.type === 'video' ? (
            viewer.url.includes('youtube') || viewer.url.includes('youtu.be') ? (
              <iframe
                src={viewer.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={viewer.url} controls style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
            )
          ) : viewer.type === 'pdf' ? (
            <>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 14 }}>
                Loading PDF…
              </div>
              <iframe
                src={viewer.url}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </>
          ) : (
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(viewer.url)}`}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            />
          )}
        </div>
      </div>
    )}
    </>
  );
}

const lbl = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
const inp = { width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' };
