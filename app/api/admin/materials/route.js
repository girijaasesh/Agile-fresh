export const dynamic = 'force-dynamic';
const { pool } = require('../../../../lib/db');
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

async function checkAdmin() {
  const cookieStore = cookies();
  const adminToken = cookieStore.get('admin_token');
  if (adminToken) return null;
  const session = await getServerSession(authOptions);
  if (session?.user) return null;
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET() {
  const deny = await checkAdmin(); if (deny) return deny;
  const result = await pool.query(
    `SELECT m.*, c.title as cert_title, c.code as cert_code
     FROM course_materials m
     JOIN certifications c ON m.certification_id = c.id
     ORDER BY c.code, m.created_at DESC`
  );
  return Response.json(result.rows);
}

export async function POST(req) {
  const deny = await checkAdmin(); if (deny) return deny;
  const { title, type, file_url, certification_id, description } = await req.json();
  if (!title || !type || !file_url || !certification_id) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const result = await pool.query(
    `INSERT INTO course_materials (title, type, file_url, certification_id, description)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [title, type, file_url, certification_id, description || null]
  );
  return Response.json(result.rows[0], { status: 201 });
}

export async function DELETE(req) {
  const deny = await checkAdmin(); if (deny) return deny;
  const { id } = await req.json();
  await pool.query('DELETE FROM course_materials WHERE id = $1', [id]);
  return Response.json({ success: true });
}

export async function PATCH(req) {
  const deny = await checkAdmin(); if (deny) return deny;
  const { id, is_active } = await req.json();
  const result = await pool.query(
    'UPDATE course_materials SET is_active = $1 WHERE id = $2 RETURNING *',
    [is_active, id]
  );
  return Response.json(result.rows[0]);
}
