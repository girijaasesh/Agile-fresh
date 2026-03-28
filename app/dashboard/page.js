'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const fmt = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';

const TYPE_ICONS = { pdf: '📄', ppt: '📊', word: '📝', video: '🎬' };
const TYPE_LABELS = { pdf: 'PDF', ppt: 'PowerPoint', word: 'Word Doc', video: 'Video' };

const CERT_DESCS = {
  SA:   'Foundation certification for enterprise agile leaders.',
  SSM:  'Become a skilled Scrum Master in a SAFe enterprise environment.',
  SASM: 'Advanced coaching techniques and ART-level coaching.',
  POPM: 'Master product ownership at scale across the enterprise.',
  SDP:  'Implement DevOps and continuous delivery pipelines in SAFe.',
  RTE:  'Chief Scrum Master of the Agile Release Train.',
  SPC:  'Train others, lead transformations, deliver SAFe training.',
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [materials, setMaterials] = useState([]);
  const [matLoading, setMatLoading] = useState(false);
  const [viewer, setViewer] = useState(null); // { url, title, type, can_download }

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth?next=/dashboard');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/user/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    if (tab !== 'materials' || status !== 'authenticated') return;
    setMatLoading(true);
    fetch('/api/materials')
      .then(r => r.json())
      .then(d => { setMaterials(Array.isArray(d) ? d : []); setMatLoading(false); })
      .catch(() => setMatLoading(false));
  }, [tab, status]);

  if (status === 'loading' || loading) return <LoadingScreen />;
  if (status === 'unauthenticated') return null;

  const user = session.user;
  const upcoming = data?.upcoming || [];
  const past = data?.past || [];
  const suggestions = data?.suggestions || [];
  const totalSpent = past.filter(r => r.payment_status === 'paid').reduce((s, r) => s + Number(r.amount_paid || 0), 0);
  const paidCount = past.filter(r => r.payment_status === 'paid').length + upcoming.length;

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: 'white', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg,#C9A84C,#E8C97A)', borderRadius: 7, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#1E3A5F' }}>AE</div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#1E3A5F' }}>AgileEdge</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="/quick-register" style={{ fontSize: 14, color: '#1E3A5F', textDecoration: 'none', fontWeight: 500 }}>Browse Courses</a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {user.image && <img src={user.image} alt="" style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #E2E8F0' }} />}
              <span style={{ fontSize: 14, color: '#1E3A5F', fontWeight: 500 }}>{user.name?.split(' ')[0]}</span>
              <button onClick={() => signOut({ callbackUrl: '/' })}
                style={{ fontSize: 13, color: '#64748B', background: 'none', border: '1px solid #E2E8F0', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {user.image
              ? <img src={user.image} alt="" style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
              : <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#1E3A5F,#2D5480)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 22, fontWeight: 700 }}>{user.name?.[0] || 'U'}</div>
            }
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1E3A5F', margin: 0 }}>Welcome back, {user.name?.split(' ')[0]}!</h1>
              <p style={{ fontSize: 14, color: '#64748B', margin: '4px 0 0' }}>{user.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Courses Enrolled', value: paidCount, icon: '🎓' },
            { label: 'Upcoming Sessions', value: upcoming.length, icon: '📅' },
            { label: 'Certifications', value: paidCount, icon: '🏅' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#1E3A5F', fontFamily: 'Playfair Display, serif' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'white', borderRadius: 10, padding: 4, width: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {[['overview', 'Overview'], ['upcoming', 'Upcoming'], ['materials', '📚 Course Materials'], ['history', 'History'], ['explore', 'Explore Courses']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all .15s',
                background: tab === id ? '#1E3A5F' : 'transparent',
                color: tab === id ? 'white' : '#64748B' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Next session */}
            <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: 700, color: '#1E3A5F', marginBottom: 16, fontSize: 16 }}>📅 Next Session</div>
              {upcoming.length > 0 ? (
                <SessionCard r={upcoming[0]} />
              ) : (
                <EmptyState msg="No upcoming sessions" sub="Browse courses to register for your next training." />
              )}
            </div>
            {/* Recent activity */}
            <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: 700, color: '#1E3A5F', marginBottom: 16, fontSize: 16 }}>🕐 Recent Activity</div>
              {past.length > 0 ? past.slice(0, 3).map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1E3A5F' }}>{r.course_title || 'SAFe Certification'}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                  <StatusBadge status={r.payment_status} />
                </div>
              )) : <EmptyState msg="No activity yet" sub="Your registrations will appear here." />}
            </div>
            {/* Suggestions preview */}
            {suggestions.length > 0 && (
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', gridColumn: '1/-1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, color: '#1E3A5F', fontSize: 16 }}>✨ Recommended For You</div>
                  <button onClick={() => setTab('explore')} style={{ fontSize: 13, color: '#C9A84C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View all →</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                  {suggestions.slice(0, 3).map(s => <SuggestionCard key={s.code} s={s} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Upcoming */}
        {tab === 'upcoming' && (
          <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: 700, color: '#1E3A5F', marginBottom: 20, fontSize: 16 }}>Upcoming Training Sessions</div>
            {upcoming.length > 0
              ? upcoming.map(r => <SessionCard key={r.id} r={r} detailed />)
              : <EmptyState msg="No upcoming sessions" sub="Register for a course to see your upcoming training sessions here." action={{ label: 'Browse Courses', href: '/quick-register' }} />
            }
          </div>
        )}

        {/* Tab: History */}
        {tab === 'history' && (
          <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: 700, color: '#1E3A5F', marginBottom: 20, fontSize: 16 }}>Payment & Enrollment History</div>
            {past.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                    {['Course', 'Date', 'Format', 'Amount Paid', 'Coupon', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {past.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <td style={{ padding: '12px', fontSize: 14, fontWeight: 600, color: '#1E3A5F' }}>{r.course_title || 'SAFe Certification'}</td>
                      <td style={{ padding: '12px', fontSize: 13, color: '#64748B' }}>{fmtDate(r.session_date)}</td>
                      <td style={{ padding: '12px', fontSize: 13, color: '#64748B' }}>{r.format || '—'}</td>
                      <td style={{ padding: '12px', fontSize: 13, color: '#1E3A5F', fontWeight: 600 }}>{r.amount_paid ? fmt(r.amount_paid) : '—'}</td>
                      <td style={{ padding: '12px', fontSize: 13, color: '#64748B' }}>{r.coupon_code || '—'}</td>
                      <td style={{ padding: '12px' }}><StatusBadge status={r.payment_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <EmptyState msg="No enrollment history" sub="Completed registrations and payments will appear here." />}
          </div>
        )}

        {/* Tab: Materials */}
        {tab === 'materials' && (
          <div>
            {matLoading ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8' }}>Loading materials…</div>
            ) : materials.length === 0 ? (
              <EmptyState msg="No materials available yet" sub="Course materials will appear here once added by your instructor." />
            ) : (
              <>
                {/* Group by certification */}
                {[...new Set(materials.map(m => m.cert_code))].map(code => {
                  const group = materials.filter(m => m.cert_code === code);
                  return (
                    <div key={code} style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <span style={{ background: '#1E3A5F', color: 'white', padding: '4px 12px', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>{code}</span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#1E3A5F' }}>{group[0].cert_title}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {group.map(m => (
                          <div key={m.id} style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                              <div style={{ fontSize: 32, flexShrink: 0 }}>{TYPE_ICONS[m.type] || '📁'}</div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#1E3A5F', marginBottom: 2 }}>{m.title}</div>
                                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>{TYPE_LABELS[m.type]}</div>
                                {m.description && <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>{m.description}</div>}
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button onClick={() => setViewer({ url: m.file_url, title: m.title, type: m.type, can_download: m.can_download })}
                                    style={{ flex: 1, background: '#1E3A5F', color: 'white', border: 'none', borderRadius: 8, padding: '8px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                    View
                                  </button>
                                  {m.can_download && (
                                    <a href={m.file_url} target="_blank" rel="noreferrer" download
                                      style={{ background: '#D1FAE5', color: '#065F46', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                                      ↓
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* Tab: Explore */}
        {tab === 'explore' && (
          <div>
            <div style={{ fontWeight: 700, color: '#1E3A5F', marginBottom: 20, fontSize: 16 }}>Explore Courses</div>
            {suggestions.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                {suggestions.map(s => <SuggestionCard key={s.code} s={s} large />)}
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: 12, padding: 40, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1E3A5F' }}>You've explored everything!</div>
                <p style={{ color: '#64748B', fontSize: 14, marginTop: 8 }}>You're enrolled in all available courses. Check back soon for new offerings.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>

    {/* Material Viewer Modal */}
    {viewer && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#1E3A5F', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>
            {TYPE_ICONS[viewer.type]} {viewer.title}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {viewer.can_download && (
              <a href={viewer.url} target="_blank" rel="noreferrer" download
                style={{ background: '#C9A84C', color: '#1E3A5F', padding: '6px 16px', borderRadius: 6, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                ↓ Download
              </a>
            )}
            <button onClick={() => setViewer(null)}
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 14 }}>
              ✕ Close
            </button>
          </div>
        </div>
        <div style={{ flex: 1, background: '#111' }}>
          {viewer.type === 'video' ? (
            viewer.url.includes('youtube') || viewer.url.includes('youtu.be') ? (
              <iframe
                src={viewer.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={viewer.url} controls controlsList={viewer.can_download ? '' : 'nodownload'} style={{ width: '100%', height: '100%' }} />
            )
          ) : (
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(viewer.url)}&embedded=true`}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          )}
        </div>
      </div>
    )}
  );
}

function SessionCard({ r, detailed }) {
  const daysUntil = r.session_date ? Math.ceil((new Date(r.session_date) - new Date()) / 86400000) : null;
  return (
    <div style={{ background: '#F8FAFC', borderRadius: 10, padding: 16, marginBottom: detailed ? 16 : 0, border: '1px solid #E2E8F0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1E3A5F' }}>{r.course_title || 'SAFe Certification'}</div>
          <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>📅 {fmtDate(r.session_date)}</div>
          <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>📍 {r.format || 'Virtual'} · {r.timezone || 'EST'}</div>
          {r.amount_paid && <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>💳 {fmt(r.amount_paid)} paid</div>}
        </div>
        {daysUntil !== null && daysUntil >= 0 && (
          <div style={{ background: daysUntil <= 7 ? '#FEF3C7' : '#EEF5FF', color: daysUntil <= 7 ? '#92400E' : '#1E3A5F', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, textAlign: 'center', flexShrink: 0 }}>
            {daysUntil === 0 ? 'Today!' : `${daysUntil}d away`}
          </div>
        )}
      </div>
    </div>
  );
}

function SuggestionCard({ s, large }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: large ? 24 : 16, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'inline-block', background: '#EEF5FF', color: '#1E3A5F', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, marginBottom: 10, letterSpacing: '0.05em' }}>{s.code}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1E3A5F', marginBottom: 6 }}>{s.title}</div>
      {large && <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: 12 }}>{CERT_DESCS[s.code] || ''}</p>}
      {s.session_date && <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>📅 Next: {fmtDate(s.session_date)}</div>}
      <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A84C', marginBottom: 12 }}>${Number(s.early_bird_price || s.price || 0).toLocaleString()}</div>
      <a href={`/quick-register?course=${s.code?.toLowerCase()}`}
        style={{ display: 'block', textAlign: 'center', background: '#1E3A5F', color: 'white', borderRadius: 8, padding: '8px 0', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
        Register →
      </a>
    </div>
  );
}

function StatusBadge({ status }) {
  const paid = status === 'paid';
  return (
    <span style={{ background: paid ? '#D1FAE5' : '#FEF3C7', color: paid ? '#065F46' : '#92400E', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {paid ? '✓ Paid' : 'Pending'}
    </span>
  );
}

function EmptyState({ msg, sub, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#1E3A5F' }}>{msg}</div>
      <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 6 }}>{sub}</p>
      {action && <a href={action.href} style={{ display: 'inline-block', marginTop: 16, background: '#1E3A5F', color: 'white', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>{action.label}</a>}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTop: '3px solid #1E3A5F', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <div style={{ color: '#64748B', fontSize: 14 }}>Loading your dashboard…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
