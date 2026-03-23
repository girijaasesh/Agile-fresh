/**
 * POST /api/notify
 *
 * Sends a "seat reserved" confirmation email to the registrant immediately
 * after form submission (before payment).
 *
 * Body: { name, email, course, sessionDate, sessionFormat, sessionTz, regId, price }
 */

export const dynamic = 'force-dynamic';

const nodemailer = require('nodemailer');

async function createTransporter() {
  const host = process.env.EMAIL_HOST || 'smtp.hostinger.com';
  const configs = [
    { host, port: parseInt(process.env.EMAIL_PORT || '465', 10), secure: true,  tls:{ rejectUnauthorized:false } },
    { host, port: 587, secure: false, requireTLS: true, tls:{ rejectUnauthorized:false } },
  ];
  for (const cfg of configs) {
    const t = nodemailer.createTransport({ ...cfg, auth:{ user:process.env.EMAIL_USER, pass:process.env.EMAIL_PASS } });
    try { await t.verify(); return t; } catch(e) { console.error(`[notify] SMTP port ${cfg.port} failed:`, e.message); }
  }
  throw new Error(`SMTP auth failed for ${process.env.EMAIL_USER} — check EMAIL_HOST, EMAIL_USER, EMAIL_PASS env vars`);
}

async function sendEmail({ name, email, course, sessionDate, sessionFormat, sessionTz, price, regId }) {
  const transporter = await createTransporter();

  const dateStr = sessionDate
    ? new Date(sessionDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'To be confirmed';

  const priceStr = price ? `$${Number(price).toLocaleString('en-US')} USD` : 'See invoice';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#0B1629;padding:28px 40px;text-align:center;">
            <div style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#E8C97A);border-radius:8px;width:40px;height:40px;line-height:40px;text-align:center;font-weight:700;font-size:16px;color:#0B1629;margin-bottom:12px;">AE</div>
            <div style="color:#C9A84C;font-size:22px;font-weight:700;font-family:Georgia,serif;">AgileEdge</div>
            <div style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:4px;letter-spacing:2px;text-transform:uppercase;">Transform at Scale</div>
          </td>
        </tr>

        <!-- Status banner -->
        <tr>
          <td style="background:#FFFBEB;border-bottom:3px solid #C9A84C;padding:20px 40px;text-align:center;">
            <div style="font-size:32px;margin-bottom:8px;">🎟️</div>
            <div style="font-size:20px;font-weight:700;color:#0B1629;">Your Seat is Reserved!</div>
            <div style="font-size:14px;color:#64748B;margin-top:6px;">Complete your payment below to confirm enrollment</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="font-size:16px;color:#0B1629;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
            <p style="font-size:14px;color:#64748B;line-height:1.7;margin:0 0 28px;">
              We've reserved your spot for <strong>${course}</strong>. Your registration has been received and is pending payment confirmation.
            </p>

            <!-- Details card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:12px;border:1px solid #E2E8F0;margin-bottom:28px;">
              <tr>
                <td style="padding:24px;">
                  <div style="font-size:11px;font-weight:700;color:#C9A84C;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Registration Details</div>
                  ${[
                    ['Course',       course],
                    ['Date',         dateStr],
                    ['Format',       sessionFormat ? `${sessionFormat}${sessionTz ? ' · ' + sessionTz : ''}` : 'TBD'],
                    ['Amount Due',   priceStr],
                    ['Reference ID', regId ? String(regId).slice(0, 8).toUpperCase() : '—'],
                  ].map(([label, value]) => `
                  <table width="100%" cellpadding="0" cellspacing="4" style="margin-bottom:12px;">
                    <tr>
                      <td width="120" style="font-size:12px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;vertical-align:top;">${label}</td>
                      <td style="font-size:14px;color:#0B1629;font-weight:500;">${value}</td>
                    </tr>
                  </table>`).join('')}
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td align="center">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://agile.optim-soln.com'}/quick-register"
                     style="display:inline-block;background:#C9A84C;color:#0B1629;text-decoration:none;font-weight:700;font-size:16px;padding:14px 40px;border-radius:8px;">
                    Complete Payment →
                  </a>
                </td>
              </tr>
            </table>

            <!-- What's next -->
            <div style="border-left:3px solid #C9A84C;padding-left:16px;margin-bottom:24px;">
              <div style="font-size:13px;font-weight:700;color:#0B1629;margin-bottom:8px;">What happens next</div>
              ${[
                'Complete your payment to confirm your enrollment.',
                'You\'ll receive a payment receipt and enrollment confirmation immediately.',
                'Pre-course materials will be sent 7 days before your session.',
                'A Zoom/venue link will be shared 48 hours before the session.',
              ].map((s, i) => `<p style="font-size:13px;color:#64748B;margin:6px 0;">${i + 1}. ${s}</p>`).join('')}
            </div>

            <p style="font-size:13px;color:#94A3B8;margin:0;">
              Questions? Reply to this email or contact us at
              <a href="mailto:${process.env.EMAIL_USER}" style="color:#C9A84C;">${process.env.EMAIL_USER}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F8FAFC;padding:20px 40px;text-align:center;border-top:1px solid #E2E8F0;">
            <p style="font-size:12px;color:#94A3B8;margin:0;">
              AgileEdge Training · <a href="https://agile.optim-soln.com" style="color:#C9A84C;text-decoration:none;">agile.optim-soln.com</a>
            </p>
            <p style="font-size:11px;color:#CBD5E1;margin:6px 0 0;">You're receiving this because you registered for a course. Ref: ${regId || '—'}</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from:    `"AgileEdge Training" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: `🎟️ Seat Reserved — ${course} | Complete Your Payment`,
    html,
  });
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { name, email, course, sessionDate, sessionFormat, sessionTz, regId, price } = body;

  if (!email || !name) {
    return Response.json({ error: 'name and email are required' }, { status: 400 });
  }

  try {
    await sendEmail({ name, email, course, sessionDate, sessionFormat, sessionTz, price, regId });
    return Response.json({ email: true }, { status: 200 });
  } catch (err) {
    console.error('[notify] Email failed:', err.message);
    return Response.json({ email: false, error: err.message }, { status: 207 });
  }
}
