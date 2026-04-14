'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const CATEGORIES = [
  { value: 'agile', label: 'Agile Implementation' },
  { value: 'scrum', label: 'Scrum' },
  { value: 'kanban', label: 'Kanban' },
  { value: 'safe', label: 'SAFe' },
  { value: 'leadership', label: 'Agile Leadership' },
];

const CAT_COLORS = {
  agile: { bg: '#EEF5FF', color: '#1E3A5F' },
  scrum: { bg: '#D1FAE5', color: '#065F46' },
  kanban: { bg: '#FEF3C7', color: '#92400E' },
  safe: { bg: '#F3E8FF', color: '#6B21A8' },
  leadership: { bg: '#FEE2E2', color: '#991B1B' },
};

const EMPTY_FORM = { title: '', summary: '', content: '', cover_image_url: '', video_url: '', category: 'agile', tags: '', is_published: false };

export default function ArticlesClient({ articles: init }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const coverInputRef = useRef(null);
  const [articles, setArticles] = useState(init);
  const [view, setView] = useState('list'); // 'list' | 'edit'
  const [editing, setEditing] = useState(null); // null = new, article obj = edit
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [toast, setToast] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(null); // null=loading, true/false
  const [liModal, setLiModal] = useState(null); // null or article
  const [liText, setLiText] = useState('');
  const [liPosting, setLiPosting] = useState(false);

  useEffect(() => {
    fetch('/api/linkedin/status').then(r => r.json()).then(d => setLinkedinConnected(d.connected));
    // Show toast if redirected from OAuth
    const connected = searchParams.get('linkedin_connected');
    const err = searchParams.get('linkedin_error');
    if (connected) showToast('LinkedIn connected successfully ✓', false);
    if (err) showToast(`LinkedIn error: ${err}`);
  }, []);

  const showToast = (msg, isErr = true) => {
    setToast({ msg, isErr });
    setTimeout(() => setToast(''), 4000);
  };

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setPreviewMode(false); setView('edit'); };
  const openEdit = (a) => { setEditing(a); setForm({ ...a }); setPreviewMode(false); setView('edit'); };

  const uploadCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Upload failed`);
      setForm(f => ({ ...f, cover_image_url: data.url }));
      showToast('Cover image uploaded ✓', false);
    } catch (e) { showToast(e.message); }
    finally { setUploadingCover(false); if (coverInputRef.current) coverInputRef.current.value = ''; }
  };

  const save = async () => {
    if (!form.title.trim()) { showToast('Title is required'); return; }
    if (!form.content.trim()) { showToast('Content is required'); return; }
    setSaving(true);
    try {
      const method = editing ? 'PATCH' : 'POST';
      const body = editing ? { ...form, id: editing.id } : form;
      const res = await fetch('/api/admin/articles', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      if (editing) {
        setArticles(a => a.map(x => x.id === data.id ? data : x));
      } else {
        setArticles(a => [data, ...a]);
      }
      showToast(editing ? 'Article updated ✓' : 'Article created ✓', false);
      setView('list');
    } catch (e) { showToast(e.message); }
    finally { setSaving(false); }
  };

  const togglePublish = async (article) => {
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: article.id, ...article, is_published: !article.is_published }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setArticles(a => a.map(x => x.id === data.id ? data : x));
    } catch (e) { showToast(e.message); }
  };

  const deleteArticle = async (id) => {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/admin/articles', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error('Delete failed');
      setArticles(a => a.filter(x => x.id !== id));
    } catch (e) { showToast(e.message); }
  };

  const openLinkedinModal = (article) => {
    const appUrl = 'https://www.optim-soln.com';
    const articleUrl = `${appUrl}/articles/${article.slug}`;
    setLiText(`${article.title}\n\n${article.summary || ''}\n\nRead more: ${articleUrl}`);
    setLiModal(article);
  };

  const postToLinkedin = async () => {
    if (!liModal) return;
    setLiPosting(true);
    try {
      const res = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: liModal.id, customText: liText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Post failed');
      setArticles(a => a.map(x => x.id === liModal.id ? { ...x, linkedin_posted_at: new Date().toISOString() } : x));
      showToast('Posted to LinkedIn ✓', false);
      setLiModal(null);
    } catch (e) { showToast(e.message); }
    finally { setLiPosting(false); }
  };

  const published = articles.filter(a => a.is_published).length;

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', fontFamily: 'Arial, sans-serif' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: toast.isErr ? '#EF4444' : '#065F46', color: 'white', padding: '12px 28px', borderRadius: 10, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.25)', maxWidth: 480, textAlign: 'center' }}>
          {toast.isErr ? '⚠️' : '✓'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: '#0B1629', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#C9A84C', fontWeight: 'bold', fontSize: '20px' }}>AgileEdge Admin</span>
        <button onClick={() => view === 'edit' ? setView('list') : router.push('/admin')}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
          {view === 'edit' ? '← Back to Articles' : '← Back to Dashboard'}
        </button>
      </div>

      <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }}>

        {/* LinkedIn Modal */}
        {liModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: 'white', borderRadius: 16, padding: 32, width: '100%', maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#0B1629' }}>Share to LinkedIn</span>
              </div>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 8 }}>Posting as Optimized Solutions company page. Edit the post text below:</p>
              <textarea
                value={liText}
                onChange={e => setLiText(e.target.value)}
                style={{ width: '100%', height: 180, padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}
              />
              <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'right', marginBottom: 16 }}>{liText.length} chars</div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setLiModal(null)} style={{ padding: '9px 20px', border: '1px solid #E2E8F0', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, background: 'white' }}>
                  Cancel
                </button>
                <button onClick={postToLinkedin} disabled={liPosting || !liText.trim()}
                  style={{ padding: '9px 22px', border: 'none', borderRadius: 8, cursor: liPosting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13, background: '#0A66C2', color: 'white', opacity: liPosting ? 0.7 : 1 }}>
                  {liPosting ? 'Posting…' : 'Post to LinkedIn'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIST VIEW */}
        {view === 'list' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h1 style={{ color: '#0B1629', margin: 0, fontSize: 26 }}>Articles</h1>
                <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: 14 }}>{published} published · {articles.length - published} drafts</p>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {linkedinConnected === false && (
                  <a href="/api/linkedin/auth"
                    style={{ fontSize: 13, padding: '8px 16px', background: '#EFF6FF', color: '#0A66C2', border: '1px solid #BFDBFE', borderRadius: 8, textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    Connect LinkedIn
                  </a>
                )}
                {linkedinConnected === true && (
                  <span style={{ fontSize: 13, padding: '8px 14px', background: '#D1FAE5', color: '#065F46', borderRadius: 8, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn Connected
                  </span>
                )}
                <button onClick={openNew}
                  style={{ background: '#1E3A5F', color: 'white', border: 'none', padding: '10px 22px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                  + New Article
                </button>
              </div>
            </div>

            {articles.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 12, padding: 60, textAlign: 'center', color: '#94A3B8' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✍️</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>No articles yet</div>
                <p style={{ fontSize: 14, marginTop: 8 }}>Click "New Article" to write your first post.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {articles.map(a => {
                  const cat = CAT_COLORS[a.category] || CAT_COLORS.agile;
                  return (
                    <div key={a.id} style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', gap: 16, alignItems: 'center' }}>
                      {/* Cover thumbnail */}
                      <div style={{ width: 80, height: 60, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {a.cover_image_url
                          ? <img src={a.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: 28 }}>📝</span>}
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ background: cat.bg, color: cat.color, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                            {CATEGORIES.find(c => c.value === a.category)?.label || a.category}
                          </span>
                          <span style={{ background: a.is_published ? '#D1FAE5' : '#FEF3C7', color: a.is_published ? '#065F46' : '#92400E', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                            {a.is_published ? '● Published' : '○ Draft'}
                          </span>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#1E3A5F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{a.summary?.slice(0, 100) || '—'}</div>
                      </div>
                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button onClick={() => openEdit(a)}
                          style={{ fontSize: 12, padding: '6px 14px', border: '1px solid #E2E8F0', borderRadius: 6, cursor: 'pointer', background: 'white', fontWeight: 600 }}>
                          Edit
                        </button>
                        <button onClick={() => togglePublish(a)}
                          style={{ fontSize: 12, padding: '6px 14px', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600,
                            background: a.is_published ? '#FEF3C7' : '#D1FAE5',
                            color: a.is_published ? '#92400E' : '#065F46' }}>
                          {a.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        {linkedinConnected && a.is_published && (
                          <button onClick={() => openLinkedinModal(a)}
                            style={{ fontSize: 12, padding: '6px 14px', border: '1px solid #BFDBFE', borderRadius: 6, cursor: 'pointer', background: '#EFF6FF', color: '#0A66C2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            {a.linkedin_posted_at ? 'Repost' : 'Share'}
                            {a.linkedin_posted_at && <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>·posted</span>}
                          </button>
                        )}
                        <a href={`/articles/${a.slug}`} target="_blank" rel="noreferrer"
                          style={{ fontSize: 12, padding: '6px 14px', border: '1px solid #BBF7D0', borderRadius: 6, cursor: 'pointer', background: '#F0FDF4', color: '#065F46', textDecoration: 'none', fontWeight: 600 }}>
                          View ↗
                        </a>
                        <button onClick={() => deleteArticle(a.id)}
                          style={{ fontSize: 12, padding: '6px 14px', border: '1px solid #FCA5A5', borderRadius: 6, cursor: 'pointer', background: '#FEF2F2', color: '#DC2626', fontWeight: 600 }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* EDIT / NEW VIEW */}
        {view === 'edit' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h1 style={{ color: '#0B1629', margin: 0, fontSize: 22 }}>{editing ? 'Edit Article' : 'New Article'}</h1>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setPreviewMode(p => !p)}
                  style={{ background: previewMode ? '#1E3A5F' : 'white', color: previewMode ? 'white' : '#1E3A5F', border: '1px solid #1E3A5F', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  {previewMode ? '✏️ Edit' : '👁 Preview'}
                </button>
                <button onClick={save} disabled={saving}
                  style={{ background: '#1E3A5F', color: 'white', border: 'none', padding: '8px 22px', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Article'}
                </button>
              </div>
            </div>

            {previewMode ? (
              <ArticlePreview article={form} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
                {/* Main column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Title */}
                  <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <label style={lbl}>Article Title *</label>
                    <input style={{ ...inp, fontSize: 18, fontWeight: 700 }} placeholder="Write a compelling title…"
                      value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                    <label style={{ ...lbl, marginTop: 16 }}>Summary <span style={{ color: '#94A3B8', fontWeight: 400 }}>(shown in article cards)</span></label>
                    <textarea style={{ ...inp, height: 80, resize: 'vertical' }} placeholder="A short description of the article…"
                      value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
                  </div>

                  {/* Content */}
                  <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <label style={lbl}>Article Content *</label>
                    <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 10px' }}>Use blank lines to separate paragraphs. Start a line with ## for a heading.</p>
                    <textarea style={{ ...inp, height: 420, resize: 'vertical', fontFamily: 'monospace', fontSize: 14, lineHeight: 1.7 }}
                      placeholder="Write your article here…&#10;&#10;Use blank lines to separate paragraphs.&#10;&#10;## Section Heading&#10;&#10;Start headings with ## for a section title."
                      value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
                  </div>

                  {/* Embedded Video */}
                  <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <label style={lbl}>🎬 Embed Video <span style={{ color: '#94A3B8', fontWeight: 400 }}>(optional — YouTube or Vimeo URL)</span></label>
                    <input style={inp} placeholder="https://www.youtube.com/watch?v=..."
                      value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} />
                    {form.video_url && (
                      <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden', aspectRatio: '16/9', background: '#000' }}>
                        <iframe
                          src={toEmbedUrl(form.video_url)}
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Publish */}
                  <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <label style={lbl}>Status</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: form.is_published ? '#D1FAE5' : '#F1F5F9', borderRadius: 8 }}>
                      <input type="checkbox" id="pub" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))}
                        style={{ width: 18, height: 18, cursor: 'pointer' }} />
                      <label htmlFor="pub" style={{ fontWeight: 600, fontSize: 14, color: form.is_published ? '#065F46' : '#64748B', cursor: 'pointer' }}>
                        {form.is_published ? '● Published' : '○ Save as Draft'}
                      </label>
                    </div>
                  </div>

                  {/* Category & Tags */}
                  <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <label style={lbl}>Category *</label>
                    <select style={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <label style={{ ...lbl, marginTop: 16 }}>Tags <span style={{ color: '#94A3B8', fontWeight: 400 }}>(comma separated)</span></label>
                    <input style={inp} placeholder="e.g. retrospectives, sprint planning"
                      value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                  </div>

                  {/* Cover Image */}
                  <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <label style={lbl}>Cover Image</label>
                    {form.cover_image_url && (
                      <div style={{ marginBottom: 12, borderRadius: 8, overflow: 'hidden', aspectRatio: '16/9', background: '#F1F5F9' }}>
                        <img src={form.cover_image_url} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    {/* Upload */}
                    <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={uploadCover} style={{ display: 'none' }} />
                    <button type="button" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover}
                      style={{ ...inp, background: '#F8FAFC', color: '#1E3A5F', fontWeight: 600, textAlign: 'center', border: '2px dashed #CBD5E1', cursor: 'pointer', marginBottom: 10 }}>
                      {uploadingCover ? '⏳ Uploading…' : '📷 Upload Image'}
                    </button>
                    <label style={{ ...lbl, marginTop: 4 }}>Or paste image URL</label>
                    <input style={inp} placeholder="https://..."
                      value={form.cover_image_url} onChange={e => setForm(f => ({ ...f, cover_image_url: e.target.value }))} />
                    {form.cover_image_url && (
                      <button onClick={() => setForm(f => ({ ...f, cover_image_url: '' }))}
                        style={{ marginTop: 8, fontSize: 12, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}>
                        ✕ Remove image
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Preview renderer
function ArticlePreview({ article }) {
  const cat = CAT_COLORS[article.category] || CAT_COLORS.agile;
  const catLabel = CATEGORIES.find(c => c.value === article.category)?.label || article.category;
  return (
    <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', maxWidth: 780, margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      {article.cover_image_url && (
        <div style={{ width: '100%', aspectRatio: '16/7', overflow: 'hidden', background: '#F1F5F9' }}>
          <img src={article.cover_image_url} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ padding: '36px 40px' }}>
        <span style={{ background: cat.bg, color: cat.color, padding: '4px 12px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>{catLabel}</span>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0B1629', margin: '16px 0 12px', lineHeight: 1.2 }}>{article.title || 'Untitled'}</h1>
        {article.summary && <p style={{ fontSize: 18, color: '#64748B', margin: '0 0 28px', lineHeight: 1.6, fontStyle: 'italic' }}>{article.summary}</p>}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 28 }}>
          <RenderContent content={article.content} />
        </div>
        {article.video_url && (
          <div style={{ marginTop: 32 }}>
            <div style={{ borderRadius: 10, overflow: 'hidden', aspectRatio: '16/9', background: '#000' }}>
              <iframe src={toEmbedUrl(article.video_url)} style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </div>
        )}
        {article.tags && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 32 }}>
            {article.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
              <span key={t} style={{ background: '#F1F5F9', color: '#64748B', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>#{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RenderContent({ content }) {
  if (!content) return null;
  return (
    <div>
      {content.split('\n\n').map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('## ')) {
          return <h2 key={i} style={{ fontSize: 22, fontWeight: 700, color: '#1E3A5F', margin: '28px 0 12px' }}>{trimmed.slice(3)}</h2>;
        }
        if (trimmed.startsWith('### ')) {
          return <h3 key={i} style={{ fontSize: 18, fontWeight: 700, color: '#1E3A5F', margin: '20px 0 8px' }}>{trimmed.slice(4)}</h3>;
        }
        return <p key={i} style={{ fontSize: 16, lineHeight: 1.8, color: '#374151', margin: '0 0 18px' }}>{trimmed}</p>;
      })}
    </div>
  );
}

function toEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('youtube.com/watch')) return url.replace('watch?v=', 'embed/');
  if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'www.youtube.com/embed/');
  if (url.includes('vimeo.com/')) return url.replace('vimeo.com/', 'player.vimeo.com/video/');
  return url;
}

const lbl = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
const inp = { width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' };
