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

const AgileEdgeMVP = dynamic(() => import('../components/AgileEdgeMVP'), {
  ssr: false,
  loading: () => <LoadingFallback />,
});

export default function Page() {
  return <AgileEdgeMVP />;
}
