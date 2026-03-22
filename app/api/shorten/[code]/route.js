/**
 * URL Shortener — single-link operations
 *
 * GET    /api/shorten/:code  — stats for one link
 * PATCH  /api/shorten/:code  — update title / toggle active / update destination
 * DELETE /api/shorten/:code  — permanently delete
 */

export const dynamic = 'force-dynamic';

const { pool } = require('../../../../lib/db');

export async function GET(_req, { params }) {
  const { code } = params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM short_links WHERE short_code = $1',
      [code]
    );
    if (rows.length === 0) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json(rows[0]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const { code } = params;
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const allowed = ['title', 'destination', 'is_active', 'expires_at'];
  const sets = [];
  const values = [];

  for (const key of allowed) {
    if (key in body) {
      sets.push(`${key} = $${sets.length + 1}`);
      values.push(body[key]);
    }
  }

  if (sets.length === 0) return Response.json({ error: 'No valid fields to update' }, { status: 400 });

  values.push(code);
  try {
    const { rows } = await pool.query(
      `UPDATE short_links SET ${sets.join(', ')} WHERE short_code = $${values.length} RETURNING *`,
      values
    );
    if (rows.length === 0) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json(rows[0]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  const { code } = params;
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM short_links WHERE short_code = $1',
      [code]
    );
    if (rowCount === 0) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ deleted: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
