'use client';
import { useState, useEffect } from 'react';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutForm({ amount, currency, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      setError('Payment is still loading. Please wait a moment and try again.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message);
        setLoading(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/registration-success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message);
        setLoading(false);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      {!ready && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#94A3B8', fontSize: 14 }}>
          Loading payment form…
        </div>
      )}
      <div style={{ display: ready ? 'block' : 'none' }}>
        <PaymentElement
          onReady={() => setReady(true)}
          options={{
            layout: 'tabs',
            wallets: { applePay: 'auto', googlePay: 'auto' },
            terms: { card: 'never' },
          }}
        />
      </div>
      {error && (
        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px', borderRadius: '8px', marginTop: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={loading || !ready}
        style={{ width: '100%', padding: '14px', background: (loading || !ready) ? '#9CA3AF' : '#0B1629', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: (loading || !ready) ? 'not-allowed' : 'pointer', marginTop: '20px' }}
      >
        {loading ? 'Processing payment…' : `Pay ${currency} ${amount}`}
      </button>
      <p style={{ marginTop: '10px', fontSize: '12px', color: '#9CA3AF', textAlign: 'center' }}>
        🔒 256-bit SSL encrypted · Powered by Stripe
      </p>
    </div>
  );
}

export default function PaymentForm({ amount, currency, name, email, courseTitle, onSuccess }) {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setClientSecret('');
    setError('');
  }, [email, courseTitle]);

  // Auto-initialize payment on mount
  useEffect(() => {
    if (!clientSecret && !loading && !error) {
      initializePayment();
    }
  }, []);

  const initializePayment = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, name, email, courseTitle }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setClientSecret(data.clientSecret);
      }
    } catch (err) {
      setError('Failed to connect to payment service. Please try again.');
    }
    setLoading(false);
  };

  if (!clientSecret) {
    return (
      <div style={{ textAlign: 'center', padding: '24px' }}>
        {loading ? (
          <div>
            <div style={{ width: 32, height: 32, border: '3px solid #E2E8F0', borderTopColor: '#0B1629', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: '#64748B', fontSize: 14 }}>Preparing secure payment…</p>
          </div>
        ) : error ? (
          <div>
            <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </div>
            <button
              onClick={initializePayment}
              style={{ padding: '12px 28px', background: '#0B1629', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Try Again
            </button>
          </div>
        ) : null}
        <p style={{ marginTop: '12px', fontSize: '12px', color: '#9CA3AF' }}>
          🔒 256-bit SSL encrypted · Powered by Stripe
        </p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, loader: 'auto', appearance: { theme: 'stripe' } }}
      key={clientSecret}
    >
      <CheckoutForm
        amount={amount}
        currency={currency}
        name={name}
        email={email}
        courseTitle={courseTitle}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}
