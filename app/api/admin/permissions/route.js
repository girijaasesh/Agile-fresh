export const dynamic = 'force-dynamic';
const { pool } = require('../../../../lib/db');
import { verifyAdminAuth } from '../../../../lib/adminAuth';

export async function GET() {
  await verifyAdminAuth();
  const result = await pool.query(
    `SELECT p.*, c.title as cert_title, c.code as cert_code
     FROM material_permissions p
     JOIN certifications c ON p.certification_id = c.id
     ORDER BY p.created_at DESC`
  );
  return Response.json(result.rows);
}

export async function POST(req) {
  await verifyAdminAuth();
  const { user_email, certification_id, can_download, granted_by } = await req.json();
  if (!user_email || !certification_id) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const result = await pool.query(
    `INSERT INTO material_permissions (user_email, certification_id, can_download, granted_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_email, certification_id)
     DO UPDATE SET can_download = $3, granted_by = $4, created_at = NOW()
     RETURNING *`,
    [user_email.toLowerCase(), certification_id, can_download ?? false, granted_by || 'admin']
  );
  return Response.json(result.rows[0]);
}

export async function DELETE(req) {
  await verifyAdminAuth();
  const { id } = await req.json();
  await pool.query('DELETE FROM material_permissions WHERE id = $1', [id]);
  return Response.json({ success: true });
}
