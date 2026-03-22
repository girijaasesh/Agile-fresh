export const dynamic = 'force-dynamic';
const Stripe = require('stripe');

export async function POST(req) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { amount, currency, name, email, courseTitle } = await req.json();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata: {
        customerName: name,
        customerEmail: email,
        courseTitle: courseTitle,
      },
      receipt_email: email,
      automatic_payment_methods: { 
        enabled: true,
        allow_redirects: 'never'
      },
    });
    return Response.json({ 
      clientSecret: paymentIntent.client_secret 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}