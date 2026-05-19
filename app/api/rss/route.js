export const dynamic = 'force-dynamic';
const { pool } = require('../../../lib/db');

export async function GET() {
  const result = await pool.query(
    `SELECT title, slug, summary, published_at, category, tags
     FROM articles
     WHERE is_published = true AND post_on_linkedin = true
     ORDER BY published_at DESC
     LIMIT 50`
  );

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.optim-soln.com';
  const now = new Date().toUTCString();

  const items = result.rows.map(a => {
    const url = `${baseUrl}/articles/${a.slug}`;
    const pubDate = a.published_at ? new Date(a.published_at).toUTCString() : now;
    const desc = (a.summary || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const title = (a.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${desc}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AgileEdge — LinkedIn Posts</title>
    <link>${baseUrl}/articles</link>
    <description>Articles tagged for LinkedIn posting on AgileEdge</description>
    <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
