'use client';
import { useState, useEffect } from 'react';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51T7pjcFmjjA2mxuOJX6rGCCXEMZoUPddPSKa3drzGhQFAihfUN4zHbWp9C50Wojh9TBGM1SN9syhmBxwBlVrAHtB00B6i1qkxy');

function CheckoutForm({ amount, currency, name, email, courseTitle, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

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
        payment_method_data: {
          billing_details: { name, email }
        }
      },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message);
      setLoading(false);
    } else {
      try {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, courseTitle }),
        });
      } catch (e) {
        console.error('Email send failed:', e);
      }
      onSuccess();
    }
  };

  return (
    <div>
      <PaymentElement options={{
        layout: 'tabs',
        wallets: { applePay: 'never', googlePay: 'never' },
        terms: { card: 'never' },
        fields: { billingDetails: { name: 'never', email: 'never' } }
      }} />
      {error && (
        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px', borderRadius: '8px', marginTop: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={loading || !stripe}
        style={{ width: '100%', padding: '14px', background: loading ? '#9CA3AF' : '#0B1629', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '24px' }}
      >
        {loading ? 'Processing...' : `Pay ${currency} ${amount}`}
      </button>
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
      setError('Failed to initialize payment. Please try again.');
    }
    setLoading(false);
  };

  if (!clientSecret) {
    return (
      <div style={{ textAlign: 'center', padding: '24px' }}>
        <p style={{ marginBottom: '16px', color: '#374151' }}>
          Course: <strong>{courseTitle}</strong>
        </p>
        <p style={{ marginBottom: '8px', color: '#374151' }}>
          Registering as: <strong>{name}</strong> ({email})
        </p>
        <p style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 'bold', color: '#0B1629' }}>
          {currency} {amount}
        </p>
        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}
        <button
          onClick={initializePayment}
          disabled={loading}
          style={{ width: '100%', padding: '14px', background: loading ? '#9CA3AF' : '#0B1629', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Loading...' : 'Proceed to Payment'}
        </button>
        <p style={{ marginTop: '12px', fontSize: '12px', color: '#9CA3AF' }}>
          🔒 256-bit SSL encrypted · Powered by Stripe
        </p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, loader: 'auto' }}
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