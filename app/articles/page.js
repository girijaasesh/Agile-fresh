'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { value: 'all', label: 'All Articles' },
  { value: 'agile', label: 'Agile Implementation' },
  { value: 'scrum', label: 'Scrum' },
  { value: 'kanban', label: 'Kanban' },
  { value: 'safe', label: 'SAFe' },
  { value: 'agile-leadership', label: 'Agile Leadership' },
  { value: 'ai-agile', label: 'AI in Agile' },
];

const CAT_COLORS = {
  agile:      { bg: '#EEF5FF', color: '#1E3A5F' },
  scrum:      { bg: '#D1FAE5', color: '#065F46' },
  kanban:     { bg: '#FEF3C7', color: '#92400E' },
  safe:       { bg: '#F3E8FF', color: '#6B21A8' },
  'agile-leadership': { bg: '#FEE2E2', color: '#991B1B' },
  'ai-agile':         { bg: '#ECFDF5', color: '#065F46' },
};

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
}

export default function ArticlesPage() {
  // inject mobile styles
  const mobileStyles = `
    @media (max-width: 680px) {
      .art-nav-links { display: none !important; }
      .art-hero h1   { font-size: 28px !important; }
      .art-cat-filter { gap: 6px !important; }
      .art-cat-filter button { padding: 6px 12px !important; font-size: 12px !important; }
      .art-featured   { grid-template-columns: 1fr !important; }
      .art-featured-img { aspect-ratio: 16/9 !important; }
      .art-featured-body { padding: 20px !important; }
      .art-featured-body h2 { font-size: 20px !important; }
    }
  `;
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [carouselIdx, setCarouselIdx] = useState(3);
  const carouselRef = useRef(null);
  const autoRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    const url = category === 'all' ? '/api/articles' : `/api/articles?category=${category}`;
    fetch(url)
      .then(r => r.json())
      .then(d => { setArticles(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category]);

  // Auto-advance carousel
  useEffect(() => {
    if (articles.length < 2) return;
    autoRef.current = setInterval(() => {
      setCarouselIdx(i => (i + 1) % articles.length);
    }, 4000);
    return () => clearInterval(autoRef.current);
  }, [articles.length]);

  const goCarousel = (dir) => {
    clearInterval(autoRef.current);
    setCarouselIdx(i => (i + dir + articles.length) % articles.length);
  };

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', Arial, sans-serif", paddingTop: 64 }}>
      <style>{mobileStyles}</style>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0B1629 0%, #1E3A5F 100%)', padding: '60px 24px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ color: '#C9A84C', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Knowledge Hub</div>
          <h1 style={{ color: 'white', fontSize: 42, fontWeight: 800, margin: '0 0 16px', fontFamily: 'Playfair Display, serif', lineHeight: 1.2 }}>Agile Insights & Best Practices</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, margin: 0, lineHeight: 1.6 }}>Expert articles on Agile, Scrum, Kanban and scaled agile transformations.</p>
        </div>
      </div>

      {/* Carousel */}
      {articles.length > 0 && (
        <div style={{ background: '#0F1E35', padding: '40px 0 48px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                Latest Articles
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => goCarousel(-1)} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>‹</button>
                <button onClick={() => goCarousel(1)}  style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>›</button>
              </div>
            </div>

            {/* Strip — overflow hidden so side cards peek in */}
            <div style={{ overflow: 'hidden', margin: '0 -24px', padding: '10px 0 20px' }}>
              <div
                ref={carouselRef}
                style={{
                  display: 'flex',
                  gap: 20,
                  transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
                  transform: `translateX(calc(50% - ${carouselIdx * 320 + 160}px))`,
                  paddingLeft: 24,
                  willChange: 'transform',
                }}
              >
                {articles.map((a, i) => {
                  const isActive = i === carouselIdx;
                  const isAdjacent = Math.abs(i - carouselIdx) === 1;
                  const cat = CAT_COLORS[a.category] || CAT_COLORS.agile;
                  const catLabel = CATEGORIES.find(c => c.value === a.category)?.label || a.category;
                  return (
                    <div
                      key={a.id}
                      onClick={() => {
                        if (isActive) router.push(`/articles/${a.slug}`);
                        else { clearInterval(autoRef.current); setCarouselIdx(i); }
                      }}
                      style={{
                        width: 300, flexShrink: 0,
                        borderRadius: 14, overflow: 'hidden',
                        background: 'white',
                        cursor: 'pointer',
                        transition: 'opacity 0.4s, transform 0.4s, box-shadow 0.4s',
                        opacity: isActive ? 1 : isAdjacent ? 0.55 : 0.25,
                        transform: isActive ? 'translateY(-8px) scale(1.04)' : 'translateY(0) scale(0.96)',
                        boxShadow: isActive ? '0 24px 48px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.2)',
                      }}
                    >
                      <div style={{ height: 160, overflow: 'hidden', background: '#1E3A5F' }}>
                        {a.cover_image_url
                          ? <img src={a.cover_image_url} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: isActive ? 'scale(1.05)' : 'scale(1)' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>📝</div>}
                      </div>
                      <div style={{ padding: '14px 16px 18px' }}>
                        <span style={{ background: cat.bg, color: cat.color, padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{catLabel}</span>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0B1629', margin: '8px 0 0', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.title}</div>
                        {isActive && <div style={{ fontSize: 12, color: '#64748B', marginTop: 8, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.summary}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dots */}
            <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: 4 }}>
              {articles.map((_, i) => (
                <button key={i} onClick={() => { clearInterval(autoRef.current); setCarouselIdx(i); }}
                  style={{ width: i === carouselIdx ? 22 : 6, height: 6, borderRadius: 3, border: 'none', padding: 0, cursor: 'pointer', transition: 'all 0.3s',
                    background: i === carouselIdx ? '#C9A84C' : 'rgba(255,255,255,0.2)' }} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {/* Category filter */}
        <div className="art-cat-filter" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40, justifyContent: 'center' }}>
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setCategory(c.value)}
              style={{ padding: '8px 18px', borderRadius: 24, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                background: category === c.value ? '#1E3A5F' : 'white',
                color: category === c.value ? 'white' : '#64748B',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#94A3B8' }}>Loading articles…</div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#94A3B8' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>No articles in this category yet.</div>
          </div>
        ) : (
          <>
            {/* Featured article */}
            {featured && category === 'all' && (
              <div onClick={() => router.push(`/articles/${featured.slug}`)}
                className="art-featured"
                style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 40, cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div className="art-featured-img" style={{ aspectRatio: '4/3', background: '#F1F5F9', overflow: 'hidden' }}>
                  {featured.cover_image_url
                    ? <img src={featured.cover_image_url} alt={featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>📝</div>}
                </div>
                <div className="art-featured-body" style={{ padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ background: '#C9A84C', color: '#1E3A5F', padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>Featured</span>
                    <span style={{ ...(CAT_COLORS[featured.category] || CAT_COLORS.agile), padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                      {CATEGORIES.find(c => c.value === featured.category)?.label}
                    </span>
                    {featured.post_on_linkedin && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#EFF6FF', color: '#0A66C2', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        LinkedIn Post link
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0B1629', margin: '0 0 12px', lineHeight: 1.3 }}>{featured.title}</h2>
                  <p style={{ fontSize: 15, color: '#64748B', margin: '0 0 20px', lineHeight: 1.7 }}>{featured.summary}</p>
                  <div style={{ fontSize: 13, color: '#94A3B8' }}>{fmtDate(featured.published_at)}</div>
                </div>
              </div>
            )}

            {/* Article grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {(category === 'all' ? rest : articles).map(a => {
                const cat = CAT_COLORS[a.category] || CAT_COLORS.agile;
                const catLabel = CATEGORIES.find(c => c.value === a.category)?.label || a.category;
                return (
                  <div key={a.id} onClick={() => router.push(`/articles/${a.slug}`)}
                    style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}>
                    <div style={{ aspectRatio: '16/9', background: '#F1F5F9', overflow: 'hidden' }}>
                      {a.cover_image_url
                        ? <img src={a.cover_image_url} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>📝</div>}
                    </div>
                    <div style={{ padding: 20 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ background: cat.bg, color: cat.color, padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{catLabel}</span>
                        {a.post_on_linkedin && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#EFF6FF', color: '#0A66C2', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            LinkedIn Post link
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0B1629', margin: '0 0 8px', lineHeight: 1.4 }}>{a.title}</h3>
                      <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 16px', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {a.summary}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>{fmtDate(a.published_at)}</span>
                        <span style={{ fontSize: 13, color: '#1E3A5F', fontWeight: 600 }}>Read more →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: '#0B1629', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '32px 24px', fontSize: 13, marginTop: 60 }}>
        © {new Date().getFullYear()} AgileEdge · <a href="/articles" style={{ color: '#C9A84C', textDecoration: 'none' }}>Articles</a> · <a href="/quick-register" style={{ color: '#C9A84C', textDecoration: 'none' }}>Courses</a>
      </div>
    </div>
  );
}
