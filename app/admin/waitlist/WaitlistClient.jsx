'use client';
import { useRouter } from 'next/navigation';

export default function WaitlistClient({ waitlist }) {
  const router = useRouter();
  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#0B1629', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#C9A84C', fontWeight: 'bold', fontSize: '20px' }}>AgileEdge</span>
        <button onClick={() => router.push('/admin')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>← Back</button>
      </div>
      <div style={{ padding: '32px' }}>
        <h1 style={{ color: '#0B1629', marginBottom: '24px' }}>Waitlist ({waitlist.length})</h1>
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0B1629', color: 'white' }}>
                {['Name', 'Email', 'Course', 'Registered'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {waitlist.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>No waitlist entries</td></tr>
              ) : waitlist.map((w, i) => (
                <tr key={w.id} style={{ borderBottom: '1px solid #E2E8F0', background: i % 2 === 0 ? 'white' : '#F8FAFC' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{w.full_name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{w.email}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{w.course_title || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px' }}>{new Date(w.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}