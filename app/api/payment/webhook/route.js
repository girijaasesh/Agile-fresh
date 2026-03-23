export const dynamic = 'force-dynamic';
const Stripe = require('stripe');
const { pool } = require('../../../../lib/db');
const nodemailer = require('nodemailer');

async function sendConfirmationEmail(data) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.EMAIL_PORT || '465', 10),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const dateStr = data.session_date
    ? new Date(data.session_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'TBD';

  await transporter.sendMail({
    from: '"AgileEdge Training" <' + process.env.EMAIL_USER + '>',
    to: data.email,
    subject: 'Registration Confirmed - ' + data.course_title,
    html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">'
      + '<div style="background:#0B1629;padding:32px;text-align:center;">'
      + '<div style="color:#C9A84C;font-size:22px;font-weight:700;">AgileEdge</div>'
      + '<div style="color:rgba(255,255,255,0.6);font-size:13px;">Transform at Scale</div>'
      + '</div>'
      + '<div style="padding:32px;background:white;">'
      + '<div style="background:#D1FAE5;border-left:4px solid #10B981;padding:16px;border-radius:8px;margin-bottom:24px;">'
      + '<div style="color:#065F46;font-weight:700;">Registration Confirmed!</div>'
      + '<div style="color:#065F46;font-size:14px;">Your payment was successful and your seat is reserved.</div>'
      + '</div>'
      + '<h2 style="color:#0B1629;">Hello ' + data.full_name + ',</h2>'
      + '<p style="color:#475569;">Thank you for registering with AgileEdge. We look forward to seeing you!</p>'
      + '<div style="background:#F8FAFC;border-radius:10px;padding:24px;margin:24px 0;">'
      + '<div style="font-weight:700;color:#0B1629;margin-bottom:16px;">Registration Details</div>'
      + '<p style="margin:8px 0;color:#475569;">Course: <strong>' + data.course_title + '</strong></p>'
      + '<p style="margin:8px 0;color:#475569;">Date: <strong>' + dateStr + '</strong></p>'
      + '<p style="margin:8px 0;color:#475569;">Format: <strong>' + (data.format || 'TBD') + '</strong></p>'
      + '</div>'
      + '<p style="color:#475569;font-size:14px;">You will receive joining instructions 48 hours before the session.</p>'
      + '<p style="color:#475569;font-size:14px;">For questions, contact us at ' + process.env.EMAIL_USER + '</p>'
      + '</div>'
      + '<div style="background:#F8FAFC;padding:16px;text-align:center;border-top:1px solid #E2E8F0;">'
      + '<p style="color:#94A3B8;font-size:12px;margin:0;">AgileEdge Training | agile.optim-soln.com</p>'
      + '</div>'
      + '</div>',
  });
}

export async function POST(req) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      console.log('PaymentIntent metadata:', JSON.stringify(paymentIntent.metadata));
      console.log('PaymentIntent receipt_email:', paymentIntent.receipt_email);
      
      const email = paymentIntent.metadata?.customerEmail || paymentIntent.receipt_email;
      console.log('Using email:', email);

      if (!email) {
        console.error('No email found in payment');
        return Response.json({ received: true });
      }

      await pool.query(
        'UPDATE registrations SET payment_status = $1, stripe_payment_id = $2 WHERE email = $3 AND payment_status = $4',
        ['paid', paymentIntent.id, email, 'pending']
      );
      console.log('Registration updated to paid for:', email);

      const result = await pool.query(
        'SELECT r.full_name, r.email, c.title as course_title, s.session_date, s.format FROM registrations r LEFT JOIN sessions s ON r.session_id = s.id LEFT JOIN certifications c ON s.certification_id = c.id WHERE r.email = $1 AND r.payment_status = $2 ORDER BY r.created_at DESC LIMIT 1',
        [email, 'paid']
      );

      console.log('DB result rows:', result.rows.length);

      if (result.rows.length > 0) {
        await sendConfirmationEmail(result.rows[0]);
      } else {
        console.error('No registration found for email:', email);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
}
