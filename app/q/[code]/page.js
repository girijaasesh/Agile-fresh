'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const PaymentForm = dynamic(() => import('../../../components/PaymentForm'), { ssr: false });

// ── Course data (mirrors AgileEdgeMVP) ──────────────────────────────────────
const CERTIFICATIONS = [
  { id: "sa",     code: "SA",   title: "SAFe Agilist",               role: "Leadership",   price: 995,  earlyBird: 795,  duration: "2 Days", desc: "Foundation certification for enterprise agile leaders. Understand the Lean-Agile mindset and how to lead an agile transformation at enterprise scale.", outcomes: ["Lead SAFe transformations","Apply SAFe principles","Coach Agile teams","Drive business agility"] },
  { id: "ssm",    code: "SSM",  title: "SAFe Scrum Master",          role: "Scrum Master", price: 895,  earlyBird: 695,  duration: "2 Days", desc: "Become a skilled Scrum Master in a SAFe enterprise environment. Master facilitation, coaching, and servant leadership.", outcomes: ["Facilitate PI Planning","Coach agile teams","Remove impediments at scale","Manage dependencies"] },
  { id: "sasm",   code: "SASM", title: "SAFe Advanced Scrum Master", role: "Scrum Master", price: 1095, earlyBird: 895,  duration: "2 Days", desc: "Advanced coaching techniques for experienced Scrum Masters. Master patterns, anti-patterns, and coaching at ART level.", outcomes: ["Coach multiple teams","ART-level facilitation","Coaching at scale","Lean problem-solving"] },
  { id: "popm",   code: "POPM", title: "SAFe Product Owner/PM",      role: "Product Owner",price: 995,  earlyBird: 795,  duration: "2 Days", desc: "Master product ownership in a scaled agile environment. Learn to define vision, roadmaps, and prioritize the backlog at enterprise scale.", outcomes: ["Define product vision","Prioritize PI objectives","Manage program backlog","Engage stakeholders"] },
  { id: "devops", code: "SDP",  title: "SAFe DevOps",                role: "Technical",    price: 995,  earlyBird: 795,  duration: "2 Days", desc: "Implement DevOps and continuous delivery pipelines in a SAFe environment. Accelerate value delivery through technical excellence.", outcomes: ["Build CDVC pipeline","DevOps culture","Continuous integration","Release on demand"] },
  { id: "rte",    code: "RTE",  title: "SAFe Release Train Engineer",role: "Leadership",   price: 1295, earlyBird: 1095, duration: "3 Days", desc: "Become the chief Scrum Master of the Agile Release Train. Master ART facilitation, coaching, and continuous improvement.", outcomes: ["Facilitate PI Planning","Coach the ART","Drive relentless improvement","Manage program risks"] },
  { id: "spc",    code: "SPC",  title: "SAFe Program Consultant",    role: "Leadership",   price: 3995, earlyBird: 3495, duration: "4 Days", desc: "The most comprehensive SAFe certification. Train and coach others in SAFe, lead transformations, and deliver SAFe training.", outcomes: ["Train all SAFe courses","Lead transformations","Launch ARTs","Coach enterprise agility"] },
];

const UPCOMING = [
  { certId: "sa",     date: "2026-03-15", tz: "EST", format: "Virtual",            price: 995,  earlyBird: 795,  ebDeadline: "2026-03-01", seats: 20, booked: 13 },
  { certId: "ssm",    date: "2026-03-22", tz: "EST", format: "Virtual",            price: 895,  earlyBird: 695,  ebDeadline: "2026-03-08", seats: 20, booked: 8  },
  { certId: "popm",   date: "2026-04-05", tz: "PST", format: "In-Person, Chicago", price: 995,  earlyBird: 795,  ebDeadline: "2026-03-22", seats: 20, booked: 11 },
  { certId: "rte",    date: "2026-04-12", tz: "EST", format: "Virtual",            price: 1295, earlyBird: 1095, ebDeadline: "2026-03-29", seats: 12, booked: 9  },
  { certId: "spc",    date: "2026-04-28", tz: "CST", format: "In-Person, Chicago", price: 3995, earlyBird: 3495, ebDeadline: "2026-04-14", seats: 10, booked: 8  },
];

const getCert    = (id) => CERTIFICATIONS.find(c => c.id === id);
const isEarlyBird = (dl) => dl && new Date() < new Date(dl);
const seatsLeft  = (s) => s.seats - s.booked;
const fmtDate    = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

export default function QuickLinkCheckout({ params }) {
  const { code } = params;

  const [ql, setQl]               = useState(null);   // quick link row from DB
  const [cert, setCert]           = useState(null);
  const [session, setSession]     = useState(null);    // selected UPCOMING session
  const [sessions, setSessions]   = useState([]);      // available sessions for this cert
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [paid, setPaid]           = useState(false);

  // Form fields
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' });
  const [coupon, setCoupon]         = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [formReady, setFormReady]   = useState(false); // show payment section

  // ── Fetch quicklink ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/quicklink/${code}`);
        if (!res.ok) { setError('This link is invalid or has expired.'); setLoading(false); return; }

        const data = await res.json();
        const link = data.quickLink;
        setQl(link);

        const c = getCert(link.cert_id);
        setCert(c);

        if (c) {
          const available = UPCOMING.filter(s => s.certId === c.id);
          setSessions(available);
          // Auto-select first/only session
          if (available.length === 1) setSession(available[0]);
        }

        if (link.coupon_code) {
          setCoupon(link.coupon_code);
          setCouponApplied(true); // pre-apply linked coupon
        }
      } catch {
        setError('Error loading checkout. Please try again.');
      }
      setLoading(false);
    };
    load();
  }, [code]);

  // ── Pricing ───────────────────────────────────────────────────────────────
  const eb         = session && isEarlyBird(session.ebDeadline);
  const basePrice  = session ? (eb ? session.earlyBird : session.price) : (cert?.earlyBird || cert?.price || 0);
  const discount   = couponApplied ? 0.1 : 0;
  const finalPrice = Math.round(basePrice * (1 - discount));

  const applyCoupon = () => {
    const c = coupon.trim().toUpperCase();
    if (c === 'SAFE20' || c === 'EARLY10' || (ql?.coupon_code && c === ql.coupon_code.toUpperCase())) {
      setCouponApplied(true);
    } else {
      alert('Invalid coupon code.');
    }
  };

  const formValid = form.name.trim() && form.email.includes('@') && session;

  // ── States: loading / error / paid / checkout ─────────────────────────────
  if (loading) return (
    <div style={styles.center}>
      <div style={styles.spinner} />
      <p style={{ color: '#64748B', marginTop: 16 }}>Loading your checkout...</p>
    </div>
  );

  if (error) return (
    <div style={styles.center}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h2 style={{ color: '#0B1629', marginBottom: 8 }}>Link Unavailable</h2>
      <p style={{ color: '#64748B' }}>{error}</p>
      <a href="/" style={styles.linkBtn}>Browse all courses →</a>
    </div>
  );

  if (paid) return (
    <div style={styles.center}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: '#0B1629', marginBottom: 8 }}>You're enrolled!</h2>
      <p style={{ color: '#64748B', marginBottom: 8 }}>
        <strong>{cert?.title}</strong> · {session && fmtDate(session.date)}
      </p>
      <p style={{ color: '#64748B', marginBottom: 24 }}>A confirmation email has been sent to <strong>{form.email}</strong>.</p>
      <a href="/" style={styles.linkBtn}>Back to AgileEdge →</a>
    </div>
  );

  if (!cert) return (
    <div style={styles.center}>
      <p style={{ color: '#64748B' }}>Course not found.</p>
      <a href="/" style={styles.linkBtn}>Browse all courses →</a>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #F5F5F0; }
        input, select { font-family: inherit; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field label { font-size: 13px; font-weight: 600; color: #374151; }
        .field input, .field select {
          padding: 11px 14px; border: 1.5px solid #D1D5DB; border-radius: 8px;
          font-size: 14px; color: #111827; outline: none; transition: border-color 0.15s;
        }
        .field input:focus, .field select:focus { border-color: #C9A84C; }
        .session-card {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px; border-radius: 10px; border: 2px solid #E5E7EB;
          background: white; cursor: pointer; transition: border-color 0.15s;
        }
        .session-card.selected { border-color: #C9A84C; background: #FFFBEB; }
        .session-card:hover { border-color: #C9A84C; }
        @media (max-width: 700px) {
          .checkout-grid { flex-direction: column !important; }
          .checkout-sidebar { width: 100% !important; }
        }
      `}</style>

      {/* Top bar */}
      <div style={{ background: '#0B1629', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#C9A84C', textDecoration: 'none' }}>AgileEdge</a>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>🔒 Secure Checkout</span>
      </div>

      <div className="checkout-grid" style={{ display: 'flex', gap: 0, minHeight: 'calc(100vh - 52px)', alignItems: 'flex-start' }}>

        {/* ── LEFT: Course details sidebar ─────────────────────────────────── */}
        <div className="checkout-sidebar" style={{ width: 380, background: '#0B1629', color: 'white', padding: '40px 32px', minHeight: 'calc(100vh - 52px)', flexShrink: 0 }}>

          <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>COURSE DETAILS</div>
          <div style={{ display: 'inline-block', padding: '3px 10px', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 20, fontSize: 12, color: '#C9A84C', marginBottom: 12 }}>{cert.code}</div>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 26, fontWeight: 700, lineHeight: 1.2, marginBottom: 12 }}>{cert.title}</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: 24 }}>{cert.desc}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            <div style={styles.pill}>⏱ {cert.duration}</div>
            <div style={styles.pill}>🎯 {cert.role}</div>
            {session && <div style={styles.pill}>📅 {fmtDate(session.date)}</div>}
            {session && <div style={styles.pill}>📍 {session.format} · {session.tz}</div>}
            {session && seatsLeft(session) <= 5 && seatsLeft(session) > 0 && (
              <div style={{ ...styles.pill, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>
                🔥 Only {seatsLeft(session)} seats left!
              </div>
            )}
          </div>

          {/* Outcomes */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 12 }}>WHAT YOU'LL ACHIEVE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cert.outcomes.map((o, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                  <span style={{ color: '#C9A84C', marginTop: 1, flexShrink: 0 }}>✓</span>
                  {o}
                </div>
              ))}
            </div>
          </div>

          {/* Price */}
          <div style={{ marginTop: 28, padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(201,168,76,0.3)' }}>
            {eb && session && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through', marginBottom: 2 }}>${session.price.toLocaleString()}</div>
            )}
            <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 36, color: '#C9A84C', fontWeight: 700 }}>
              ${finalPrice.toLocaleString()}
            </div>
            {eb && <div style={{ fontSize: 12, color: '#34D399', marginTop: 4 }}>⚡ Early bird price active</div>}
            {couponApplied && <div style={{ fontSize: 12, color: '#34D399', marginTop: 4 }}>✅ 10% coupon discount applied</div>}
            {ql?.campaign_source && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>via {ql.campaign_source}</div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Registration + Payment ────────────────────────────────── */}
        <div style={{ flex: 1, padding: '40px 40px', maxWidth: 620 }}>

          <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 22, color: '#0B1629', marginBottom: 6 }}>Complete Your Registration</h2>
          <p style={{ fontSize: 14, color: '#64748B', marginBottom: 28 }}>Fill in your details below to secure your seat.</p>

          {/* Session picker — only shown if multiple sessions */}
          {sessions.length > 1 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Select a date</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sessions.map((s, i) => {
                  const left = seatsLeft(s);
                  return (
                    <div key={i} className={`session-card${session === s ? ' selected' : ''}`} onClick={() => left > 0 && setSession(s)}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0B1629' }}>📅 {fmtDate(s.date)}</div>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{s.format} · {s.tz}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0B1629' }}>
                          ${(isEarlyBird(s.ebDeadline) ? s.earlyBird : s.price).toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11, color: left <= 5 ? '#EF4444' : '#64748B' }}>
                          {left === 0 ? 'Sold out' : `${left} seats left`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Personal details form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="field">
                <label>Full Name *</label>
                <input placeholder="Jane Smith" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="field">
                <label>Work Email *</label>
                <input type="email" placeholder="jane@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="field">
                <label>Phone</label>
                <input type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="field">
                <label>Company / Organisation</label>
                <input placeholder="Acme Corp" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
              </div>
            </div>

            {/* Coupon */}
            {!ql?.coupon_code && (
              <div style={{ display: 'flex', gap: 8 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>Coupon Code (optional)</label>
                  <input placeholder="e.g., SAFE20" value={coupon} onChange={e => setCoupon(e.target.value)} />
                </div>
                <button
                  onClick={applyCoupon}
                  style={{ alignSelf: 'flex-end', padding: '11px 18px', background: couponApplied ? '#D1FAE5' : '#E0E7FF', color: couponApplied ? '#065F46' : '#0B1629', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  {couponApplied ? '✓ Applied' : 'Apply'}
                </button>
              </div>
            )}
          </div>

          {/* Payment section — show only when form is filled */}
          {!formReady ? (
            <button
              disabled={!formValid}
              onClick={() => setFormReady(true)}
              style={{ width: '100%', padding: '15px', background: formValid ? '#0B1629' : '#CBD5E1', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: formValid ? 'pointer' : 'not-allowed' }}
            >
              Continue to Payment →
            </button>
          ) : (
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 16 }}>
                Payment — <span style={{ color: '#C9A84C' }}>${finalPrice.toLocaleString()} USD</span>
              </div>
              <PaymentForm
                key={form.email + cert.id}
                amount={finalPrice}
                currency="USD"
                name={form.name}
                email={form.email}
                courseTitle={`${cert.title}${session ? ' — ' + fmtDate(session.date) : ''}`}
                onSuccess={() => setPaid(true)}
              />
            </div>
          )}

          {/* Trust signals */}
          <div style={{ marginTop: 20, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {['🔒 256-bit SSL', '✅ Instant confirmation', '📧 Pre-course materials sent 7 days prior', '↩️ Full refund within 7 days'].map(t => (
              <span key={t} style={{ fontSize: 12, color: '#94A3B8' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Local style helpers ───────────────────────────────────────────────────────
const styles = {
  center: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: 24,
    fontFamily: "'DM Sans', sans-serif", background: '#F5F5F0',
  },
  spinner: {
    width: 36, height: 36, borderRadius: '50%',
    border: '3px solid #E2E8F0', borderTopColor: '#C9A84C',
    animation: 'spin 0.8s linear infinite',
  },
  pill: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    fontSize: 13, color: 'rgba(255,255,255,0.8)',
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8, padding: '7px 12px',
  },
  linkBtn: {
    marginTop: 20, display: 'inline-block', padding: '10px 20px',
    background: '#0B1629', color: 'white', borderRadius: 8,
    textDecoration: 'none', fontSize: 14, fontWeight: 600,
  },
};
