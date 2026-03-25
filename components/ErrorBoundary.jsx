'use client';

import React, { useEffect, useState } from 'react';

export default function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      console.error('Caught error:', event.error);
      setHasError(true);
      setError(event.error?.message || 'An unexpected error occurred');
    };

    const handleRejection = (event) => {
      console.error('Caught promise rejection:', event.reason);
      setHasError(true);
      setError(event.reason?.message || 'An unexpected error occurred');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: '#0B1629',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
      }}>
        <h1 style={{ marginBottom: '16px', fontSize: '32px' }}>⚠️ Something went wrong</h1>
        <p style={{ fontSize: '16px', marginBottom: '24px', color: 'rgba(255,255,255,0.7)' }}>
          {error || 'The page encountered an unexpected error. Please try refreshing.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 28px',
            background: '#C9A84C',
            color: '#0B1629',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Refresh Page
        </button>
        <p style={{ marginTop: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
          Error details logged. If this persists, contact support.
        </p>
      </div>
    );
  }

  return children;
}
