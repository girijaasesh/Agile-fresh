export const dynamic = 'force-dynamic';

export async function POST(req) {
  const { pool } = require('../../../lib/db');
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const {
    full_name,
    email,
    phone       = null,
    company     = null,
    job_title   = null,
    country     = null,
    session_id  = null,  // UUID column — pass null if not a valid UUID
    coupon_code = null,
    amount_paid = null,
    currency    = 'USD',
  } = body;

  if (!full_name?.trim()) return Response.json({ error: 'Full name is required' }, { status: 400 });
  if (!email?.trim())     return Response.json({ error: 'Email is required' },      { status: 400 });

  try {
    const result = await pool.query(
      `INSERT INTO registrations
         (full_name, email, phone, company, job_title, country, session_id, coupon_code, amount_paid, currency)
       VALUES ($1, $2, $3, $4, $5, $6, $7::uuid, $8, $9, $10)
       RETURNING id, created_at`,
      [
        full_name.trim(),
        email.trim().toLowerCase(),
        phone       || null,
        company     || null,
        job_title   || null,
        country     || null,
        session_id  || null,
        coupon_code || null,
        amount_paid || null,
        currency    || 'USD',
      ]
    );

    return Response.json({ id: result.rows[0].id, created_at: result.rows[0].created_at }, { status: 201 });

  } catch (err) {
    console.error('[register] DB error:', err.message, err.code);
    return Response.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
