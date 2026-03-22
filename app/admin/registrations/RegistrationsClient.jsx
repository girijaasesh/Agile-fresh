'use client';
import { useRouter } from 'next/navigation';

export default function RegistrationsClient({ registrations }) {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#0B1629', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ color: '#C9A84C', fontWeight: 'bold', fontSize: '20px' }}>AgileEdge</span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginLeft: '12px' }}>Registrations</span>
        </div>
        <button onClick={() => router.push('/admin')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
          ← Back
        </button>
      </div>
      <div style={{ padding: '32px' }}>
        <h1 style={{ color: '#0B1629', marginBottom: '24px' }}>All Registrations ({registrations.length})</h1>
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0B1629', color: 'white' }}>
                {['Name', 'Email', 'Course', 'Session Date', 'Payment', 'Registered'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>No registrations yet</td>
                </tr>
              ) : registrations.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #E2E8F0', background: i % 2 === 0 ? 'white' : '#F8FAFC' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{r.full_name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{r.email}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{r.course_title || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{r.session_date ? new Date(r.session_date).toLocaleDateString() : '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                    <span style={{ background: r.payment_status === 'paid' ? '#D1FAE5' : '#FEE2E2', color: r.payment_status === 'paid' ? '#065F46' : '#991B1B', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {r.payment_status || 'pending'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}