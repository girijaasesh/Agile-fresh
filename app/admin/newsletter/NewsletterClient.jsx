'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
}

function fmtShort(d) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
}

export default function NewsletterClient({ sends, pending, subscriberCount, unsubCount }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);

  async function triggerSend(articleId = null) {
    setSending(true);
    setSendingId(articleId);
    setResult(null);
    setError(null);
    try {
      const res  = await fetch('/api/cron/daily-article' + (articleId ? `?article_id=${articleId}` : ''), {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}` },
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Send failed');
      setResult(data);
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
      setSendingId(null);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', fontFamily: 'Arial, sans-serif' }}>

      {/* Top bar */}
      <div style={{ background: '#0B1629', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.push('/admin')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14, padding: 0 }}>
          ← Admin
        </button>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
        <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: 16 }}>Newsletter</span>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0B1629', margin: '0 0 4px' }}>Newsletter</h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 32px' }}>Send articles manually to all subscribers.</p>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Active Subscribers', value: subscriberCount, color: '#065F46', bg: '#D1FAE5' },
            { label: 'Articles Sent',       value: sends.length,    color: '#1E3A5F', bg: '#EEF5FF' },
            { label: 'Pending Articles',    value: pending.length,  color: '#92400E', bg: '#FEF3C7' },
            { label: 'Unsubscribed',        value: unsubCount,      color: '#991B1B', bg: '#FEE2E2' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 10, padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Result / error banner */}
        {result && (
          <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 8, padding: '14px 20px', marginBottom: 24, fontSize: 14, color: '#065F46' }}>
            ✅ <strong>Sent!</strong> — "{result.article}" delivered to <strong>{result.sent}</strong> subscriber{result.sent !== 1 ? 's' : ''}.
            {result.errors > 0 && ` (${result.errors} failed)`}
          </div>
        )}
        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '14px 20px', marginBottom: 24, fontSize: 14, color: '#991B1B' }}>
            ❌ {error}
          </div>
        )}

        {/* Pending articles — send queue */}
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 28, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0B1629' }}>Ready to Send</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Published articles not yet emailed to subscribers</div>
            </div>
            {pending.length > 0 && (
              <button
                onClick={() => triggerSend()}
                disabled={sending}
                style={{ background: '#0B1629', color: 'white', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.6 : 1, whiteSpace: 'nowrap' }}
              >
                {sending && !sendingId ? '⏳ Sending…' : '⚡ Send Next Article'}
              </button>
            )}
          </div>

          {pending.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>
              All published articles have been sent. Publish a new article to send it.
            </div>
          ) : (
            <table width="100%" cellPadding="0" cellSpacing="0">
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['Article', 'Published', 'Action'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.map((a, i) => (
                  <tr key={a.id} style={{ borderBottom: i < pending.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0B1629', marginBottom: 2 }}>{a.title}</div>
                      {a.summary && <div style={{ fontSize: 12, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>{a.summary}</div>}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748B', whiteSpace: 'nowrap' }}>{fmtShort(a.published_at)}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <button
                        onClick={() => triggerSend(a.id)}
                        disabled={sending}
                        style={{ background: '#EEF5FF', color: '#1E3A5F', border: '1px solid #BFDBFE', borderRadius: 6, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending && sendingId === a.id ? 0.6 : 1, whiteSpace: 'nowrap' }}
                      >
                        {sending && sendingId === a.id ? '⏳ Sending…' : 'Send This →'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Send history */}
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0B1629' }}>Send History</div>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Articles already delivered to subscribers</div>
          </div>
          {sends.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>
              No emails sent yet.
            </div>
          ) : (
            <table width="100%" cellPadding="0" cellSpacing="0">
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['Article', 'Sent at', 'Recipients'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sends.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: i < sends.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#0B1629' }}>{s.title}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748B', whiteSpace: 'nowrap' }}>{fmtDate(s.sent_at)}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: '#D1FAE5', color: '#065F46', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                        {s.recipient_count} sent
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
