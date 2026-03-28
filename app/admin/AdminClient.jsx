'use client';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function AdminClient() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#0B1629', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ color: '#C9A84C', fontWeight: 'bold', fontSize: '20px' }}>AgileEdge</span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginLeft: '12px' }}>Admin Dashboard</span>
        </div>
        <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
          Logout
        </button>
      </div>
      <div style={{ padding: '32px' }}>
        <h1 style={{ color: '#0B1629', marginBottom: '8px' }}>Welcome back, Admin</h1>
        <p style={{ color: '#64748B', marginBottom: '32px' }}>Manage your AgileEdge platform</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {[
            { label: 'Total Registrations', value: '—', color: '#0B1629' },
            { label: 'Upcoming Sessions', value: '6', color: '#065F46' },
            { label: 'Active Coupons', value: '1', color: '#C9A84C' },
            { label: 'Waitlisted', value: '—', color: '#991B1B' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#0B1629', marginBottom: '16px', fontSize: '18px' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            {[
              { label: '📋 View Registrations', path: '/admin/registrations' },
              { label: '📅 Manage Sessions', path: '/admin/sessions' },
              { label: '🎟️ Manage Coupons', path: '/admin/coupons' },
              { label: '📚 Course Materials', path: '/admin/materials' },
              { label: '⏳ View Waitlist', path: '/admin/waitlist' },
              { label: '🎓 Certificates', path: '/admin/certificates' },
              { label: '🔗 Quick Links', path: '/admin/quicklinks' },
              { label: '✂️ URL Shortener', path: '/admin/shortlinks' },
              { label: '🏠 Back to Site', path: '/' },
            ].map((item) => (
              <button key={item.label} onClick={() => router.push(item.path)} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', cursor: 'pointer', fontSize: '14px', color: '#0B1629', fontWeight: '500', textAlign: 'left' }}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}