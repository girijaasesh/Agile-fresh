export const dynamic = 'force-dynamic';
const crypto = require('crypto');
const { pool } = require('../../../../lib/db');

// Square webhook signature verification
function verifySquareSignature(body, signature, signatureKey, notificationUrl) {
  const hmac = crypto.createHmac('sha256', signatureKey);
  hmac.update(notificationUrl + body);
  const hash = hmac.digest('base64');
  return hash === signature;
}

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-square-hmacsha256-signature');
    const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
    const notificationUrl = process.env.SQUARE_WEBHOOK_URL ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`;

    // Verify signature if key is configured
    if (signatureKey && signature) {
      const valid = verifySquareSignature(body, signature, signatureKey, notificationUrl);
      if (!valid) {
        console.error('[square-webhook] Invalid signature');
        return Response.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(body);
    console.log('[square-webhook] Event type:', event.type);

    if (event.type === 'payment.completed') {
      const payment = event.data?.object?.payment;
      if (!payment) return Response.json({ received: true });

      const paymentId = payment.id;
      const email = payment.buyer_email_address;

      if (!email) {
        console.error('[square-webhook] No email in payment');
        return Response.json({ received: true });
      }

      console.log('[square-webhook] Payment completed:', paymentId, 'for:', email);

      // Mark as paid (in case payment API route didn't catch it)
      await pool.query(
        'UPDATE registrations SET payment_status = $1, stripe_payment_id = $2 WHERE email = $3 AND payment_status = $4',
        ['paid', paymentId, email, 'pending']
      );
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('[square-webhook] Error:', error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
}
