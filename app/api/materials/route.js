export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
const { pool } = require('../../../lib/db');

// GET /api/materials — returns all active materials for any logged-in user
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = session.user.email.toLowerCase();

  try {
    const materials = await pool.query(
      `SELECT m.*, c.title as cert_title, c.code as cert_code
       FROM course_materials m
       JOIN certifications c ON m.certification_id = c.id
       WHERE m.is_active = true
       ORDER BY c.code, m.created_at DESC`
    );

    return Response.json(materials.rows);
  } catch (err) {
    console.error('[materials] Error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
