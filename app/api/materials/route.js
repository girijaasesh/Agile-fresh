export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
const { pool } = require('../../../lib/db');

// GET /api/materials?certId=uuid  — returns materials for a cert the user is enrolled in
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const certId = searchParams.get('certId');

  const email = session.user.email.toLowerCase();

  try {
    // Verify user is enrolled (paid) for this certification
    const enrollCheck = await pool.query(
      `SELECT r.id FROM registrations r
       LEFT JOIN sessions s ON r.session_id = s.id
       WHERE LOWER(r.email) = $1
         AND r.payment_status = 'paid'
         AND (s.certification_id = $2 OR $2 IS NULL)
       LIMIT 1`,
      [email, certId || null]
    );

    if (enrollCheck.rows.length === 0 && certId) {
      return Response.json({ error: 'Not enrolled in this course' }, { status: 403 });
    }

    // Get materials
    const query = certId
      ? `SELECT m.*, c.title as cert_title, c.code as cert_code
           FROM course_materials m
           JOIN certifications c ON m.certification_id = c.id
           WHERE m.certification_id = $1 AND m.is_active = true
           ORDER BY m.created_at DESC`
      : `SELECT m.*, c.title as cert_title, c.code as cert_code
           FROM course_materials m
           JOIN certifications c ON m.certification_id = c.id
           WHERE m.is_active = true
           ORDER BY c.code, m.created_at DESC`;

    const materials = await pool.query(query, certId ? [certId] : []);

    // Check download permission
    const permQuery = certId
      ? `SELECT can_download FROM material_permissions WHERE LOWER(user_email) = $1 AND certification_id = $2`
      : `SELECT can_download, certification_id FROM material_permissions WHERE LOWER(user_email) = $1`;

    const perms = await pool.query(permQuery, certId ? [email, certId] : [email]);

    // Build permission map: certId -> can_download
    const permMap = {};
    perms.rows.forEach(p => {
      permMap[p.certification_id] = p.can_download;
    });

    const result = materials.rows.map(m => ({
      ...m,
      can_download: permMap[m.certification_id] === true,
    }));

    return Response.json(result);
  } catch (err) {
    console.error('[materials] Error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
