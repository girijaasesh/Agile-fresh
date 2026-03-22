export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ error: 'DATABASE_URL is not set' }, { status: 500 });
    }
    
    const { pool } = require('../../../../lib/db');
    const result = await pool.query(`
      SELECT id, short_code, cert_id, session_id, coupon_code, campaign_name, campaign_source, clicks, created_at, last_clicked, is_active
      FROM quick_links
      ORDER BY created_at DESC
    `);
    
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({
      error: error.message,
      code: error.code,
      detail: error.toString()
    }, { status: 500 });
  }
}
