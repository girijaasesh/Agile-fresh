export const dynamic = 'force-dynamic';

import nodemailer from 'nodemailer';

export async function POST(req) {
  const body = await req.json();
  const { name, email, phone, message } = body || {};

  if (!name || !email || !phone) {
    return new Response(JSON.stringify({ error: 'Name, email, and phone are required.' }), { status: 400 });
  }

  // Log the submission for visibility
  console.log('Contact submission:', { name, email, phone, message });

  // Send notification email if configured
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '465', 10),
        secure: true,
        auth: { user, pass },
      });

      const mail = {
        from: user,
        to: user,
        subject: `New contact request from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message || '(none)'}`,
      };

      await transporter.sendMail(mail);
    } catch (err) {
      console.error('Failed to send contact notification email:', err);
      // Don't fail the whole request; just warn.
    }
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
