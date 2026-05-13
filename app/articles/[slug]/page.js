import { pool } from '../../../lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = [
  { value: 'agile', label: 'Agile Implementation' },
  { value: 'scrum', label: 'Scrum' },
  { value: 'kanban', label: 'Kanban' },
  { value: 'safe', label: 'SAFe' },
  { value: 'leadership', label: 'Agile Leadership' },
];

const CAT_COLORS = {
  agile:      { bg: '#EEF5FF', color: '#1E3A5F' },
  scrum:      { bg: '#D1FAE5', color: '#065F46' },
  kanban:     { bg: '#FEF3C7', color: '#92400E' },
  safe:       { bg: '#F3E8FF', color: '#6B21A8' },
  leadership: { bg: '#FEE2E2', color: '#991B1B' },
};

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
}

function toEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('youtube.com/watch')) return url.replace('watch?v=', 'embed/');
  if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'www.youtube.com/embed/');
  if (url.includes('vimeo.com/')) return url.replace('vimeo.com/', 'player.vimeo.com/video/');
  return url;
}

function renderContent(content) {
  if (!content) return null;
  return content.split('\n\n').map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={i} style={{ fontSize: 24, fontWeight: 700, color: '#0B1629', margin: '36px 0 14px', borderBottom: '2px solid #E2E8F0', paddingBottom: 10 }}>
          {trimmed.slice(3)}
        </h2>
      );
    }
    if (trimmed.startsWith('### ')) {
      return <h3 key={i} style={{ fontSize: 20, fontWeight: 700, color: '#1E3A5F', margin: '28px 0 10px' }}>{trimmed.slice(4)}</h3>;
    }
    return <p key={i} style={{ fontSize: 17, lineHeight: 1.9, color: '#374151', margin: '0 0 22px' }}>{trimmed}</p>;
  });
}

export async function generateMetadata({ params }) {
  const result = await pool.query('SELECT title, summary FROM articles WHERE slug=$1', [params.slug]);
  const a = result.rows[0];
  if (!a) return { title: 'Article Not Found' };
  return { title: `${a.title} | AgileEdge`, description: a.summary };
}

export default async function ArticlePage({ params }) {
  const result = await pool.query('SELECT * FROM articles WHERE slug=$1', [params.slug]);
  const article = result.rows[0];
  if (!article) notFound();

  // Fetch related articles (same category, excluding this one)
  const related = await pool.query(
    'SELECT id, title, slug, summary, cover_image_url, category, published_at FROM articles WHERE is_published=true AND category=$1 AND slug!=$2 ORDER BY published_at DESC LIMIT 3',
    [article.category, params.slug]
  );

  const cat = CAT_COLORS[article.category] || CAT_COLORS.agile;
  const catLabel = CATEGORIES.find(c => c.value === article.category)?.label || article.category;
  const tags = article.tags ? article.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', Arial, sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: 'white', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg,#C9A84C,#E8C97A)', borderRadius: 7, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#1E3A5F' }}>AE</div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#1E3A5F' }}>AgileEdge</span>
          </Link>
          <Link href="/articles" style={{ fontSize: 14, color: '#1E3A5F', textDecoration: 'none', fontWeight: 500 }}>← All Articles</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px' }}>
        {/* Article header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <Link href={`/articles?category=${article.category}`}
              style={{ background: cat.bg, color: cat.color, padding: '4px 12px', borderRadius: 4, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
              {catLabel}
            </Link>
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 800, color: '#0B1629', margin: '0 0 16px', lineHeight: 1.25, fontFamily: 'Playfair Display, serif' }}>
            {article.title}
          </h1>
          {article.summary && (
            <p style={{ fontSize: 20, color: '#64748B', margin: '0 0 20px', lineHeight: 1.6, fontStyle: 'italic' }}>{article.summary}</p>
          )}
          <div style={{ fontSize: 14, color: '#94A3B8' }}>
            {fmtDate(article.published_at || article.created_at)}
          </div>
        </div>

        {/* Cover image */}
        {article.cover_image_url && (
          <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 40, aspectRatio: '16/7', background: '#F1F5F9' }}>
            <img src={article.cover_image_url} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Content */}
        <div style={{ background: 'white', borderRadius: 16, padding: '40px 48px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 40 }}>
          {renderContent(article.content)}

          {/* Author signature */}
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #E2E8F0' }}>
              <img src="/girijaa-photo.png" alt="GS" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0B1629' }}>Girijaa Seshachala</div>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>Founder, Optimized Solutions · SAFe SPC · Leading Agilist · PMP</div>
            </div>
          </div>

          {/* Embedded video */}
          {article.video_url && (
            <div style={{ marginTop: 40 }}>
              <div style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '16/9', background: '#000' }}>
                <iframe
                  src={toEmbedUrl(article.video_url)}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 40, paddingTop: 24, borderTop: '1px solid #E2E8F0' }}>
              {tags.map(t => (
                <span key={t} style={{ background: '#F1F5F9', color: '#64748B', padding: '5px 14px', borderRadius: 20, fontSize: 13 }}>#{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg, #0B1629, #1E3A5F)', borderRadius: 16, padding: '36px 40px', textAlign: 'center', marginBottom: 48 }}>
          <h3 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: '0 0 10px' }}>Ready to put this into practice?</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 24px', fontSize: 15 }}>Join a SAFe certification course and master agile at scale.</p>
          <Link href="/quick-register" style={{ background: '#C9A84C', color: '#0B1629', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
            Browse Courses →
          </Link>
        </div>

        {/* Related articles */}
        {related.rows.length > 0 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0B1629', marginBottom: 20 }}>Related Articles</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
              {related.rows.map(r => {
                const rCat = CAT_COLORS[r.category] || CAT_COLORS.agile;
                return (
                  <Link key={r.id} href={`/articles/${r.slug}`} style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textDecoration: 'none' }}>
                    <div style={{ aspectRatio: '16/9', background: '#F1F5F9', overflow: 'hidden' }}>
                      {r.cover_image_url
                        ? <img src={r.cover_image_url} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>📝</div>}
                    </div>
                    <div style={{ padding: 16 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0B1629', marginBottom: 6, lineHeight: 1.4 }}>{r.title}</div>
                      <div style={{ fontSize: 13, color: '#94A3B8' }}>{fmtDate(r.published_at)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{ background: '#0B1629', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '28px 24px', fontSize: 13 }}>
        © {new Date().getFullYear()} AgileEdge · <Link href="/articles" style={{ color: '#C9A84C', textDecoration: 'none' }}>Articles</Link>
      </div>
    </div>
  );
}
