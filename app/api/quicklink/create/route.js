export const dynamic = 'force-dynamic';

const { pool } = require('../../../../lib/db');
const crypto = require('crypto');

export async function POST(req) {
  const body = await req.json();
  const { certId, sessionId, couponCode, campaignName, campaignSource } = body;

  if (!certId) {
    return Response.json({ error: 'certId is required' }, { status: 400 });
  }

  // Generate a short code (6 characters)
  const shortCode = crypto.randomBytes(3).toString('hex').toUpperCase();

  try {
    // Convert sessionId to integer only if it's a valid value
    let sessionIdInt = null;
    if (sessionId && sessionId !== '' && !isNaN(sessionId)) {
      sessionIdInt = parseInt(sessionId, 10);
    }

    const result = await pool.query(
      `INSERT INTO quick_links (short_code, cert_id, session_id, coupon_code, campaign_name, campaign_source, clicks)
       VALUES ($1, $2, $3, $4, $5, $6, 0)
       RETURNING *`,
      [shortCode, certId || null, sessionIdInt, couponCode || null, campaignName || null, campaignSource || null]
    );

    const quickLink = result.rows[0];
    const shortUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/q/${shortCode}`;

    return Response.json({ shortCode, shortUrl, quickLink });
  } catch (err) {
    console.error('Error creating quick link:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
