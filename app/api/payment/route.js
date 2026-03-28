export const dynamic = 'force-dynamic';
const { pool } = require('../../../lib/db');

const isSandbox = process.env.SQUARE_ACCESS_TOKEN?.includes('sandbox') ||
  process.env.SQUARE_ENVIRONMENT === 'sandbox';

const SQUARE_API_URL = isSandbox
  ? 'https://connect.squareupsandbox.com/v2/payments'
  : 'https://connect.squareup.com/v2/payments';

async function sendConfirmationEmail(data) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'training@optim-sol.com';
  if (!apiKey) { console.error('[payment] RESEND_API_KEY not set'); return; }

  const dateStr = data.session_date
    ? new Date(data.session_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'TBD';

  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#1E3A5F;padding:32px;text-align:center;">
    <div style="color:#C9A84C;font-size:22px;font-weight:700;">AgileEdge</div>
    <div style="color:rgba(255,255,255,0.6);font-size:13px;">Transform at Scale</div>
  </div>
  <div style="padding:32px;background:white;">
    <div style="background:#D1FAE5;border-left:4px solid #10B981;padding:16px;border-radius:8px;margin-bottom:24px;">
      <div style="color:#065F46;font-weight:700;">Registration Confirmed!</div>
      <div style="color:#065F46;font-size:14px;">Your payment was successful and your seat is reserved.</div>
    </div>
    <h2 style="color:#1E3A5F;">Hello ${data.full_name},</h2>
    <p style="color:#475569;">Thank you for registering with AgileEdge. We look forward to seeing you!</p>
    <div style="background:#F8FAFC;border-radius:10px;padding:24px;margin:24px 0;">
      <div style="font-weight:700;color:#1E3A5F;margin-bottom:16px;">Registration Details</div>
      <p style="margin:8px 0;color:#475569;">Course: <strong>${data.course_title}</strong></p>
      <p style="margin:8px 0;color:#475569;">Date: <strong>${dateStr}</strong></p>
      <p style="margin:8px 0;color:#475569;">Format: <strong>${data.format || 'TBD'}</strong></p>
    </div>
    <p style="color:#475569;font-size:14px;">You will receive joining instructions 48 hours before the session.</p>
    <p style="color:#475569;font-size:14px;">For questions, contact us at ${fromEmail}</p>
  </div>
  <div style="background:#F8FAFC;padding:16px;text-align:center;border-top:1px solid #E2E8F0;">
    <p style="color:#94A3B8;font-size:12px;margin:0;">AgileEdge Training | optim-soln.com</p>
  </div>
</div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `AgileEdge Training <${fromEmail}>`,
      to: [data.email],
      subject: `Registration Confirmed — ${data.course_title}`,
      html,
    }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || JSON.stringify(result));
  console.log('[payment] Confirmation email sent to:', data.email);
}

export async function POST(req) {
  try {
    const { sourceId, amount, currency, name, email, courseTitle } = await req.json();

    if (!sourceId || !amount || !email) {
      return Response.json({ error: 'Missing required payment fields' }, { status: 400 });
    }

    // Charge via Square
    const squareRes = await fetch(SQUARE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2024-01-18',
      },
      body: JSON.stringify({
        idempotency_key: `${email}-${courseTitle}-${Date.now()}`,
        source_id: sourceId,
        amount_money: {
          amount: Math.round(amount * 100),
          currency: (currency || 'USD').toUpperCase(),
        },
        buyer_email_address: email,
        note: `${courseTitle} — ${name}`,
        location_id: process.env.SQUARE_LOCATION_ID,
      }),
    });

    const squareData = await squareRes.json();

    if (!squareRes.ok || squareData.errors) {
      const msg = squareData.errors?.[0]?.detail || 'Payment failed. Please try again.';
      console.error('[payment] Square error:', msg);
      return Response.json({ error: msg }, { status: 400 });
    }

    const paymentId = squareData.payment.id;
    console.log('[payment] Square payment succeeded:', paymentId, 'for:', email);

    // Update DB registration to paid
    try {
      await pool.query(
        'UPDATE registrations SET payment_status = $1, stripe_payment_id = $2 WHERE email = $3 AND payment_status = $4',
        ['paid', paymentId, email, 'pending']
      );
      console.log('[payment] Registration updated to paid for:', email);

      // Fetch registration details and send confirmation email
      const result = await pool.query(
        `SELECT r.full_name, r.email, c.title as course_title, s.session_date, s.format
         FROM registrations r
         LEFT JOIN sessions s ON r.session_id = s.id
         LEFT JOIN certifications c ON s.certification_id = c.id
         WHERE r.email = $1 AND r.payment_status = $2
         ORDER BY r.created_at DESC LIMIT 1`,
        [email, 'paid']
      );

      if (result.rows.length > 0) {
        await sendConfirmationEmail(result.rows[0]);
      } else {
        console.error('[payment] No registration found for email after payment:', email);
      }
    } catch (dbErr) {
      console.error('[payment] DB/email error (payment still succeeded):', dbErr.message);
    }

    return Response.json({ success: true, paymentId });
  } catch (error) {
    console.error('[payment] Unexpected error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
