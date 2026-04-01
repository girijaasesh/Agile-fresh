'use client';

export default function Error({ error, reset }) {
  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', fontFamily: 'DM Sans, Arial, sans-serif', background: '#FAFAF8',
    }}>
      <h2 style={{ fontSize: 20, color: '#111', marginBottom: 12 }}>Something went wrong</h2>
      <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>{error?.message || 'An unexpected error occurred.'}</p>
      <button onClick={reset} style={{ background: '#111', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
        Try again
      </button>
    </div>
  );
}
