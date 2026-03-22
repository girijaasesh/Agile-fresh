/**
 * URL Shortener API
 *
 * POST /api/shorten  — create a new short link
 * GET  /api/shorten  — list all short links (admin)
 */

export const dynamic = 'force-dynamic';

const crypto      = require('crypto');
const { pool }    = require('../../../lib/db');

// ── Helpers ──────────────────────────────────────────────────────────────────

function isValidUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Generate a unique short code, retrying on collision (max 5 attempts). */
async function generateCode(customAlias) {
  if (customAlias) {
    const alias = customAlias.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!alias) throw new Error('Invalid custom alias');
    const { rows } = await pool.query(
      'SELECT id FROM short_links WHERE short_code = $1',
      [alias]
    );
    if (rows.length > 0) throw new Error('That alias is already taken');
    return alias;
  }

  for (let i = 0; i < 5; i++) {
    const code = crypto.randomBytes(4).toString('base64url').slice(0, 6);
    const { rows } = await pool.query(
      'SELECT id FROM short_links WHERE short_code = $1',
      [code]
    );
    if (rows.length === 0) return code;
  }
  throw new Error('Could not generate a unique code — please try again');
}

// ── POST /api/shorten ─────────────────────────────────────────────────────────

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    destination,
    title       = '',
    customAlias = '',
    expiresAt   = null,   // ISO string or null
    utmSource   = '',
    utmMedium   = '',
    utmCampaign = '',
  } = body;

  if (!destination) {
    return Response.json({ error: 'destination is required' }, { status: 400 });
  }
  if (!isValidUrl(destination)) {
    return Response.json({ error: 'destination must be a valid http/https URL' }, { status: 400 });
  }

  try {
    const shortCode = await generateCode(customAlias);

    const { rows } = await pool.query(
      `INSERT INTO short_links
         (short_code, destination, title, expires_at, utm_source, utm_medium, utm_campaign)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        shortCode,
        destination.trim(),
        title.trim()       || null,
        expiresAt          || null,
        utmSource.trim()   || null,
        utmMedium.trim()   || null,
        utmCampaign.trim() || null,
      ]
    );

    const base     = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shortUrl = `${base}/s/${shortCode}`;

    return Response.json({ shortCode, shortUrl, link: rows[0] }, { status: 201 });

  } catch (err) {
    console.error('[shorten] create error:', err);
    const userFacing = err.message.includes('alias') || err.message.includes('unique')
      ? err.message
      : 'Failed to create short link';
    return Response.json({ error: userFacing }, { status: 500 });
  }
}

// ── GET /api/shorten ──────────────────────────────────────────────────────────

export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM short_links ORDER BY created_at DESC`
    );
    return Response.json(rows);
  } catch (err) {
    console.error('[shorten] list error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
