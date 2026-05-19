export const dynamic = 'force-dynamic';
const { pool } = require('../../../../lib/db');
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

async function checkAdmin() {
  const cookieStore = cookies();
  if (cookieStore.get('admin_token')) return null;
  const session = await getServerSession(authOptions);
  if (session?.user) return null;
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

function makeSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
}

export async function GET() {
  const deny = await checkAdmin(); if (deny) return deny;
  const result = await pool.query('SELECT * FROM articles ORDER BY created_at DESC');
  return Response.json(result.rows);
}

export async function POST(req) {
  const deny = await checkAdmin(); if (deny) return deny;
  const { title, summary, content, cover_image_url, video_url, category, tags, is_published, post_on_linkedin } = await req.json();
  if (!title) return Response.json({ error: 'Title is required' }, { status: 400 });
  const slug = makeSlug(title);
  const published_at = is_published ? new Date().toISOString() : null;
  const result = await pool.query(
    `INSERT INTO articles (title, slug, summary, content, cover_image_url, video_url, category, tags, is_published, published_at, post_on_linkedin)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [title, slug, summary || '', content || '', cover_image_url || null, video_url || null,
     category || 'agile', tags || '', is_published ?? false, published_at, post_on_linkedin ?? false]
  );
  return Response.json(result.rows[0], { status: 201 });
}

export async function PATCH(req) {
  const deny = await checkAdmin(); if (deny) return deny;
  const { id, title, summary, content, cover_image_url, video_url, category, tags, is_published, post_on_linkedin } = await req.json();
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
  const published_at_sql = is_published
    ? `CASE WHEN is_published = false THEN NOW() ELSE published_at END`
    : 'NULL';
  const result = await pool.query(
    `UPDATE articles SET
       title=$1, summary=$2, content=$3, cover_image_url=$4, video_url=$5,
       category=$6, tags=$7, is_published=$8,
       published_at=${published_at_sql},
       post_on_linkedin=$10,
       updated_at=NOW()
     WHERE id=$9 RETURNING *`,
    [title, summary || '', content || '', cover_image_url || null, video_url || null,
     category || 'agile', tags || '', is_published ?? false, id, post_on_linkedin ?? false]
  );
  return Response.json(result.rows[0]);
}

export async function DELETE(req) {
  const deny = await checkAdmin(); if (deny) return deny;
  const { id } = await req.json();
  await pool.query('DELETE FROM articles WHERE id=$1', [id]);
  return Response.json({ success: true });
}
