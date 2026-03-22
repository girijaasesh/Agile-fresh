'use client';
import { useEffect, useState } from 'react';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', Arial, sans-serif; background: #F1F5F9; color: #0B1629; }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
  @keyframes pop     { 0%{transform:scale(0) rotate(-10deg);opacity:0;} 70%{transform:scale(1.15) rotate(3deg);} 100%{transform:scale(1) rotate(0deg);opacity:1;} }
  @keyframes float   { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
  .fade-up { animation: fadeUp .5s ease both; }
  .card { background:white; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
  .pill { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:20px; font-size:12px; font-weight:600; }
  @media(max-width:600px){ .two-col{ flex-direction:column !important; } }
`;

const fmtDate = (d) => {
  if (!d) return 'To be confirmed';
  return new Date(d).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
};

export default function RegistrationSuccessPage() {
  const [info, setInfo] = useState({ name:'', email:'', course:'', date:'', format:'', price:'', ref:'', paid:false });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setInfo({
      name:   p.get('name')   || '',
      email:  p.get('email')  || '',
      course: p.get('course') || 'SAFe Certification',
      date:   p.get('date')   || '',
      format: p.get('format') || '',
      price:  p.get('price')  || '',
      ref:    p.get('ref')    || '',
      paid:   p.get('paid')   === 'true',
    });
    setReady(true);
  }, []);

  if (!ready) return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #E2E8F0', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const firstName = info.name.split(' ')[0] || 'there';
  const priceStr  = info.price ? `$${Number(info.price).toLocaleString()} USD` : '';
  const paid      = info.paid;

  const nextSteps = paid
    ? [
        { icon: '📧', title: 'Check your inbox',         desc: 'Enrollment confirmation with full details sent to ' + (info.email || 'your email') + '.' },
        { icon: '📚', title: 'Pre-course materials',      desc: 'Sent to your inbox 7 days before the session starts.' },
        { icon: '🔗', title: 'Joining link / venue info', desc: 'Emailed 48 hours before your session.' },
      ]
    : [
        { icon: '📧', title: 'Check your inbox',          desc: 'Confirmation email with full details sent to ' + (info.email || 'your email') + '.' },
        { icon: '💳', title: 'Complete your payment',     desc: 'Use the link in your email or the button below to pay and lock in your seat.' },
        { icon: '📚', title: 'Pre-course materials',      desc: 'Sent to your inbox 7 days before the session starts.' },
        { icon: '🔗', title: 'Joining link / venue info', desc: 'Emailed 48 hours before your session.' },
      ];

  return (
    <>
      <style>{CSS}</style>

      {/* Nav */}
      <div style={{ background:'#0B1629', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <a href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{ width:34, height:34, background:'linear-gradient(135deg,#C9A84C,#E8C97A)', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, color:'#0B1629' }}>AE</div>
          <span style={{ fontFamily:'Playfair Display,serif', fontSize:18, color:'white' }}>AgileEdge</span>
        </a>
        <a href="/" style={{ color:'rgba(255,255,255,.45)', fontSize:13, textDecoration:'none' }}>← Back to main site</a>
      </div>

      <div style={{ minHeight:'calc(100vh - 62px)', padding:'40px 20px', display:'flex', alignItems:'flex-start', justifyContent:'center' }}>
        <div style={{ maxWidth:640, width:'100%' }}>

          {/* ── Main card ── */}
          <div className="card fade-up" style={{ overflow:'hidden', marginBottom:20 }}>

            {/* Header */}
            <div style={{ background: paid ? 'linear-gradient(135deg,#0B1629 0%,#0D3321 100%)' : 'linear-gradient(135deg,#0B1629 0%,#1E3054 100%)', padding:'40px 36px 32px', textAlign:'center', position:'relative', overflow:'hidden' }}>
              {/* Background pattern */}
              <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(201,168,76,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.05) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }} />

              {/* Animated icon */}
              <div style={{ fontSize:72, marginBottom:16, animation:'pop .6s .1s both cubic-bezier(.34,1.56,.64,1)', display:'inline-block', position:'relative', zIndex:1 }}>
                {paid ? '🎉' : '✅'}
              </div>

              <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:28, color:'white', marginBottom:10, position:'relative', zIndex:1 }}>
                {paid ? 'You\'re Enrolled!' : 'Registration Confirmed!'}
              </h1>
              <p style={{ fontSize:15, color:'rgba(255,255,255,.65)', lineHeight:1.6, position:'relative', zIndex:1 }}>
                {paid
                  ? <>Hi <strong style={{ color:'white' }}>{firstName}</strong> — your payment is confirmed and enrollment is complete.</>
                  : <>Hi <strong style={{ color:'white' }}>{firstName}</strong> — your seat is secured and a confirmation email has been sent.</>
                }
              </p>

              {/* Status badges */}
              <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:22, flexWrap:'wrap', position:'relative', zIndex:1 }}>
                {paid && (
                  <span className="pill" style={{ background:'rgba(16,185,129,.15)', color:'#34D399', border:'1px solid rgba(16,185,129,.3)' }}>
                    ✅ Payment confirmed
                  </span>
                )}
                <span className="pill" style={{ background:'rgba(16,185,129,.15)', color:'#34D399', border:'1px solid rgba(16,185,129,.3)' }}>
                  📧 Confirmation email sent
                </span>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding:'32px 36px' }}>

              {/* Booking summary */}
              <div style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:12, padding:'20px 24px', marginBottom:28 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#C9A84C', letterSpacing:'2px', textTransform:'uppercase', marginBottom:14 }}>
                  {paid ? 'Enrollment Summary' : 'Booking Summary'}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 24px' }}>
                  {[
                    ['Course',    info.course],
                    ['Date',      fmtDate(info.date)],
                    ['Format',    info.format || 'To be confirmed'],
                    ['Amount',    priceStr    || 'See invoice'],
                    ['Email',     info.email],
                    ['Reference', info.ref    || '—'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div style={{ fontSize:11, color:'#94A3B8', fontWeight:600, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:2 }}>{label}</div>
                      <div style={{ fontSize:14, color:'#0B1629', fontWeight:500, wordBreak:'break-all' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* What happens next — timeline */}
              <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#C9A84C', letterSpacing:'2px', textTransform:'uppercase', marginBottom:18 }}>What Happens Next</div>
                {nextSteps.map((step, i, arr) => (
                  <div key={i} style={{ display:'flex', gap:16, paddingBottom: i < arr.length-1 ? 20 : 0, position:'relative' }}>
                    {i < arr.length-1 && <div style={{ position:'absolute', left:19, top:40, bottom:0, width:2, background:'#E2E8F0' }} />}
                    <div style={{ width:40, height:40, borderRadius:'50%', background:'#F8FAFC', border:'2px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, position:'relative', zIndex:1 }}>
                      {step.icon}
                    </div>
                    <div style={{ paddingTop:8 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:'#0B1629', marginBottom:2 }}>{step.title}</div>
                      <div style={{ fontSize:13, color:'#64748B', lineHeight:1.5 }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              {paid ? (
                <a href="/"
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'14px 20px', background:'#C9A84C', color:'#0B1629', borderRadius:10, fontWeight:700, fontSize:15, textDecoration:'none' }}>
                  Back to AgileEdge →
                </a>
              ) : (
                <div className="two-col" style={{ display:'flex', gap:12 }}>
                  <a href="/quick-register"
                    style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px 20px', background:'#C9A84C', color:'#0B1629', borderRadius:10, fontWeight:700, fontSize:15, textDecoration:'none' }}>
                    💳 Complete Payment →
                  </a>
                  <a href="/"
                    style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'14px 20px', background:'#F8FAFC', color:'#0B1629', border:'1.5px solid #E2E8F0', borderRadius:10, fontWeight:600, fontSize:14, textDecoration:'none' }}>
                    Back to AgileEdge
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Support note */}
          <p style={{ textAlign:'center', fontSize:13, color:'#94A3B8' }}>
            Need help?{' '}
            <a href="mailto:training@agile.optim-soln.com" style={{ color:'#C9A84C', textDecoration:'none', fontWeight:600 }}>training@agile.optim-soln.com</a>
          </p>

        </div>
      </div>
    </>
  );
}
