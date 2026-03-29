'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const TYPE_ICONS = { pdf: '📄', ppt: '📊', word: '📝', video: '🎬' };
const TYPE_LABELS = { pdf: 'PDF', ppt: 'PowerPoint', word: 'Word Doc', video: 'Video' };

export default function MaterialsClient({ materials: init, certifications, permissions: initPerms }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [materials, setMaterials] = useState(init);
  const [permissions, setPermissions] = useState(initPerms);
  const [tab, setTab] = useState('materials');
  const [showAdd, setShowAdd] = useState(false);
  const [showPerm, setShowPerm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' | 'file'
  const [uploadProgress, setUploadProgress] = useState('');
  const [form, setForm] = useState({ title: '', type: 'pdf', file_url: '', certification_id: '', description: '' });
  const [permForm, setPermForm] = useState({ user_email: '', certification_id: '', can_download: false });
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true); setError(''); setUploadProgress('Uploading file…');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm(f => ({ ...f, file_url: data.url, type: data.type, title: f.title || file.name.replace(/\.[^.]+$/, '') }));
      setUploadProgress('✅ File uploaded successfully');
    } catch (e) { setError(e.message); setUploadProgress(''); }
    finally { setSaving(false); }
  };

  const addMaterial = async () => {
    if (!form.title || !form.file_url || !form.certification_id) { setError('Fill in all required fields.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/admin/materials', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const cert = certifications.find(c => c.id === form.certification_id);
      setMaterials(m => [{ ...data, cert_title: cert?.title, cert_code: cert?.code }, ...m]);
      setShowAdd(false);
      setForm({ title: '', type: 'pdf', file_url: '', certification_id: '', description: '' });
      setUploadProgress('');
    } catch (e) { setError(e.message); }
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

  const addPermission = async () => {
    if (!permForm.user_email || !permForm.certification_id) { setError('Fill in all required fields.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/admin/permissions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const cert = certifications.find(c => c.id === permForm.certification_id);
      setPermissions(p => {
        const existing = p.findIndex(x => x.user_email === data.user_email && x.certification_id === data.certification_id);
        const entry = { ...data, cert_title: cert?.title, cert_code: cert?.code };
        return existing >= 0 ? p.map((x, i) => i === existing ? entry : x) : [entry, ...p];
      });
      setShowPerm(false);
      setPermForm({ user_email: '', certification_id: '', can_download: false });
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const deletePerm = async (id) => {
    if (!confirm('Remove this permission?')) return;
    await fetch('/api/admin/permissions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setPermissions(p => p.filter(x => x.id !== id));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#0B1629', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#C9A84C', fontWeight: 'bold', fontSize: '20px' }}>AgileEdge Admin</span>
        <button onClick={() => router.push('/admin')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>← Back</button>
      </div>

      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ color: '#0B1629', margin: 0 }}>Course Materials</h1>
          <button onClick={() => { setShowAdd(true); setShowPerm(false); setError(''); }}
            style={{ background: '#1E3A5F', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            + Add Material
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'white', borderRadius: 8, padding: 4, width: 'fit-content' }}>
          {[['materials', `Materials (${materials.length})`], ['permissions', `Download Permissions (${permissions.length})`]].map(([id, label]) => (
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={() => { setShowPerm(true); setShowAdd(false); setError(''); }}
                style={{ background: '#1E3A5F', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                + Grant Permission
              </button>
            </div>

            {showPerm && (
              <div style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0' }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1E3A5F', marginBottom: 20 }}>Grant Download Permission</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={lbl}>User Email *</label>
                    <input style={inp} type="email" placeholder="user@example.com" value={permForm.user_email} onChange={e => setPermForm(f => ({ ...f, user_email: e.target.value }))} />
                  </div>
                  <div>
                    <label style={lbl}>Certification *</label>
                    <select style={inp} value={permForm.certification_id} onChange={e => setPermForm(f => ({ ...f, certification_id: e.target.value }))}>
                      <option value="">— Select —</option>
                      {certifications.map(c => <option key={c.id} value={c.id}>{c.code} · {c.title}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" id="can_dl" checked={permForm.can_download} onChange={e => setPermForm(f => ({ ...f, can_download: e.target.checked }))} style={{ width: 18, height: 18 }} />
                    <label htmlFor="can_dl" style={{ fontSize: 14, color: '#1E3A5F', fontWeight: 500 }}>Allow Download</label>
                  </div>
                </div>
                {error && <div style={{ color: '#EF4444', fontSize: 13, marginTop: 12 }}>{error}</div>}
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button onClick={addPermission} disabled={saving}
                    style={{ background: '#1E3A5F', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                    {saving ? 'Saving…' : 'Save Permission'}
                  </button>
                  <button onClick={() => setShowPerm(false)} style={{ background: '#F1F5F9', color: '#64748B', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              {permissions.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', color: '#94A3B8' }}>No permissions granted yet.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#0B1629', color: 'white' }}>
                      {['User Email', 'Course', 'Download', 'Granted', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #E2E8F0', background: i % 2 === 0 ? 'white' : '#F8FAFC' }}>
                        <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#1E3A5F' }}>{p.user_email}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: '#EEF5FF', color: '#1E3A5F', padding: '3px 8px', borderRadius: 4, fontWeight: 600, fontSize: 12 }}>{p.cert_code}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: p.can_download ? '#D1FAE5' : '#FEE2E2', color: p.can_download ? '#065F46' : '#991B1B', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                            {p.can_download ? '✓ Allowed' : '✗ View Only'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748B' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <button onClick={() => deletePerm(p.id)}
                            style={{ fontSize: 12, padding: '5px 12px', border: '1px solid #FCA5A5', borderRadius: 6, cursor: 'pointer', background: '#FEF2F2', color: '#DC2626' }}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const lbl = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
const inp = { width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' };
