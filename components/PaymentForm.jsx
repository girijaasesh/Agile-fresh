'use client';
import { useState, useEffect, useRef } from 'react';

const SQUARE_JS_URL = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'sandbox'
  ? 'https://sandbox.web.squarecdn.com/v1/square.js'
  : 'https://web.squarecdn.com/v1/square.js';

export default function PaymentForm({ amount, currency, name, email, courseTitle, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const cardRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initSquare = async () => {
      try {
        const payments = window.Square.payments(
          process.env.NEXT_PUBLIC_SQUARE_APP_ID,
          process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID
        );
        const card = await payments.card({
          style: {
            '.input-container': { borderColor: '#E2E8F0', borderRadius: '8px' },
            '.input-container.is-focus': { borderColor: '#C9A84C' },
            '.input-container.is-error': { borderColor: '#EF4444' },
            '.message-text': { color: '#64748B' },
            '.message-icon': { color: '#64748B' },
          },
        });
        await card.attach('#square-card-container');
        cardRef.current = card;
        setReady(true);
      } catch (err) {
        console.error('[Square] init error:', err);
        setError('Failed to load payment form. Please refresh and try again.');
      }
    };

    if (window.Square) {
      initSquare();
    } else {
      const script = document.createElement('script');
      script.src = SQUARE_JS_URL;
      script.onload = initSquare;
      script.onerror = () => setError('Failed to load payment library. Please refresh and try again.');
      document.head.appendChild(script);
    }

    return () => {
      if (cardRef.current) {
        cardRef.current.destroy().catch(() => {});
        cardRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (!cardRef.current || !ready) return;
    setLoading(true);
    setError('');

    try {
      const result = await cardRef.current.tokenize();
      if (result.status !== 'OK') {
        setError(result.errors?.[0]?.message || 'Card details invalid. Please check and try again.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: result.token,
          amount,
          currency: currency || 'USD',
          name,
          email,
          courseTitle,
        }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
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
      {!ready && !error && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#94A3B8', fontSize: 14 }}>
          Loading payment form…
        </div>
      )}
      <div id="square-card-container" style={{ display: ready ? 'block' : 'none', minHeight: 89 }} />
      {error && (
        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px', borderRadius: '8px', marginTop: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={loading || !ready}
        style={{
          width: '100%', padding: '14px',
          background: (loading || !ready) ? '#9CA3AF' : '#1E3A5F',
          color: '#fff', border: 'none', borderRadius: '8px',
          fontSize: '16px', fontWeight: 'bold',
          cursor: (loading || !ready) ? 'not-allowed' : 'pointer',
          marginTop: '20px',
        }}
      >
        {loading ? 'Processing payment…' : `Pay ${currency} ${amount}`}
      </button>
      <p style={{ marginTop: '10px', fontSize: '12px', color: '#9CA3AF', textAlign: 'center' }}>
        🔒 256-bit SSL encrypted · Powered by Square
      </p>
    </div>
  );
}
