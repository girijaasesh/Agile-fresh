export const dynamic = 'force-dynamic';
const { pool } = require('../../../../lib/db');

// Zapier polls this endpoint for articles tagged "post on linkedin".
// Secure with ZAPIER_SECRET env var — require ?secret=<value> in the query string.
export async function GET(req) {
  const secret = process.env.ZAPIER_SECRET;
  if (secret) {
    const { searchParams } = new URL(req.url);
    if (searchParams.get('secret') !== secret) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const result = await pool.query(
    `SELECT id, title, slug, summary, cover_image_url, category, tags, published_at
     FROM articles
     WHERE is_published = true AND post_on_linkedin = true
     ORDER BY published_at DESC
     LIMIT 50`
  );

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.optim-soln.com';
  const items = result.rows.map(a => ({
    id: a.id,
    title: a.title,
    summary: a.summary,
    url: `${baseUrl}/articles/${a.slug}`,
    cover_image_url: a.cover_image_url,
    category: a.category,
    tags: a.tags,
    published_at: a.published_at,
  }));

  return Response.json(items);
}
