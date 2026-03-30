'use client';
import { Component } from 'react';
import dynamic from 'next/dynamic';

const LoadingFallback = () => (
  <div style={{
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0B1629 0%, #162240 50%, #0D1F3C 100%)',
    fontFamily: 'DM Sans, sans-serif',
  }}>
    <div style={{ textAlign: 'center', color: 'white' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
      <p style={{ fontSize: '18px', marginBottom: '8px' }}>Loading AgileEdge...</p>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Setting up your training platform</p>
    </div>
  </div>
);

const AgileEdgeMVP = dynamic(() => import('./AgileEdgeMVP'), {
  ssr: false,
  loading: () => <LoadingFallback />,
});

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
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
          fontFamily: 'DM Sans, sans-serif',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ marginBottom: '12px', fontSize: '22px' }}>Something went wrong</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '8px', maxWidth: 500 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '24px', padding: '10px 24px', background: '#C9A84C', color: '#0B1629', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ClientWrapper() {
  return (
    <ErrorBoundary>
      <AgileEdgeMVP />
    </ErrorBoundary>
  );
}
