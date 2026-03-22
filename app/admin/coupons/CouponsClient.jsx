'use client';
import { useRouter } from 'next/navigation';

export default function CouponsClient({ coupons }) {
  const router = useRouter();
  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#0B1629', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#C9A84C', fontWeight: 'bold', fontSize: '20px' }}>AgileEdge</span>
        <button onClick={() => router.push('/admin')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>← Back</button>
      </div>
      <div style={{ padding: '32px' }}>
        <h1 style={{ color: '#0B1629', marginBottom: '24px' }}>Coupons ({coupons.length})</h1>
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0B1629', color: 'white' }}>
                {['Code', 'Discount', 'Used', 'Max Uses', 'Expires', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #E2E8F0', background: i % 2 === 0 ? 'white' : '#F8FAFC' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 'bold' }}>{c.code}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{c.discount_percent}%</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{c.used_count}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{c.max_uses || '∞'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                    <span style={{ background: c.is_active ? '#D1FAE5' : '#FEE2E2', color: c.is_active ? '#065F46' : '#991B1B', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}