export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ error: 'DATABASE_URL is not set' }, { status: 500 });
    }
    const { pool } = require('../../../lib/db');
    const result = await pool.query(`
      SELECT id, title, code, price, early_bird_price
      FROM certifications
      ORDER BY title ASC
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
