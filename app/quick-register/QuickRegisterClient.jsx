'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import dynamic from 'next/dynamic';

const PaymentForm = dynamic(() => import('../../components/PaymentForm'), { ssr: false });

// ─── Brand data (mirrors AgileEdgeMVP) ───────────────────────────────────────
const COUPON_COURSES = ['sa', 'ssm']; // courses that show coupon field

const CERTIFICATIONS = [
  { id: 'sa',     code: 'SA',   title: 'SAFe Agilist',               role: 'Leadership',    price: 995,  earlyBird: 400,  duration: '2 Days', desc: 'Foundation certification for enterprise agile leaders. Lean-Agile mindset and enterprise-scale transformation.' },
  { id: 'ssm',    code: 'SSM',  title: 'SAFe Scrum Master',          role: 'Scrum Master',  price: 895,  earlyBird: 350,  duration: '2 Days', desc: 'Become a skilled Scrum Master in a SAFe enterprise environment. Facilitation, coaching, servant leadership.' },
  { id: 'sasm',   code: 'SASM', title: 'SAFe Advanced Scrum Master', role: 'Scrum Master',  price: 1095, earlyBird: 895,  duration: '2 Days', desc: 'Advanced coaching techniques. Master patterns, anti-patterns, and ART-level coaching.' },
  { id: 'popm',   code: 'POPM', title: 'SAFe Product Owner/PM',      role: 'Product Owner', price: 995,  earlyBird: 795,  duration: '2 Days', desc: 'Master product ownership at scale. Vision, roadmaps, backlog prioritisation at enterprise scale.' },
  { id: 'devops', code: 'SDP',  title: 'SAFe DevOps',                role: 'Technical',     price: 995,  earlyBird: 795,  duration: '2 Days', desc: 'Implement DevOps and continuous delivery pipelines in SAFe. Accelerate value delivery through technical excellence.' },
  { id: 'rte',    code: 'RTE',  title: 'SAFe Release Train Engineer', role: 'Leadership',   price: 1295, earlyBird: 1095, duration: '3 Days', desc: 'Chief Scrum Master of the Agile Release Train. ART facilitation, coaching, and continuous improvement.' },
  { id: 'spc',    code: 'SPC',  title: 'SAFe Program Consultant',    role: 'Leadership',    price: 3995, earlyBird: 3495, duration: '4 Days', desc: 'The most comprehensive SAFe certification. Train others, lead transformations, deliver SAFe training at scale.' },
];

const UPCOMING = [
  { certId: 'sa',     date: '2026-04-19', tz: 'EST', format: 'Virtual',            earlyBird: 400,  price: 995,  ebDeadline: '2026-04-30', seats: 20, booked: 13 },
  { certId: 'ssm',    date: '2026-04-09', tz: 'EST', format: 'Virtual',            earlyBird: 350,  price: 895,  ebDeadline: '2026-04-30', seats: 20, booked: 8  },
  { certId: 'popm',   date: '2026-04-05', tz: 'PST', format: 'In-Person, Chicago', earlyBird: 795,  price: 995,  ebDeadline: '2026-03-22', seats: 20, booked: 11 },
  { certId: 'rte',    date: '2026-04-12', tz: 'EST', format: 'Virtual',            earlyBird: 1095, price: 1295, ebDeadline: '2026-03-29', seats: 12, booked: 9  },
  { certId: 'spc',    date: '2026-04-28', tz: 'CST', format: 'In-Person, Chicago', earlyBird: 3495, price: 3995, ebDeadline: '2026-04-14', seats: 10, booked: 8  },
];

const TESTIMONIALS = [
  { name: 'Sarah Chen',      title: 'VP Engineering, Accenture',   cert: 'SAFe SPC', rating: 5, text: 'The SPC training transformed how our entire portfolio operates. 40% improvement in delivery predictability within 6 months.' },
  { name: 'Marcus Williams', title: 'Agile Coach, JPMorgan Chase',  cert: 'SAFe RTE', rating: 5, text: 'World-class facilitation and deep expertise. The most practical, applicable, and energising SAFe training I\'ve attended.' },
  { name: 'Priya Patel',     title: 'Director PMO, Cognizant',      cert: 'SAFe SSM', rating: 5, text: 'Our team of 12 went through SSM together. The cohort approach and real-world case studies made all the difference.' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parseLocalDate = (d) => {
  if (!d) return new Date(NaN);
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day);
};
const isEarlyBird = (dl)  => dl && new Date() < parseLocalDate(dl);
const seatsLeft   = (s)   => s.seats - s.booked;
const fmtDate     = (d)   => parseLocalDate(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const fmtPrice    = (n)   => `$${n.toLocaleString('en-US')}`;
const getCert     = (id)  => CERTIFICATIONS.find(c => c.id === id);
const getSessions = (id)  => UPCOMING.filter(s => s.certId === id);

// ─── Validators ───────────────────────────────────────────────────────────────
const validate = (f) => {
  const e = {};
  if (!f.name.trim())                          e.name     = 'Full name is required';
  if (!f.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email';
  if (!f.phone.match(/^[\d\s\+\-\(\)]{7,}$/)) e.phone    = 'Enter a valid phone number';
  if (!f.certId)                               e.certId   = 'Please select a course';
  if (f.isCorporate && !f.company.trim())      e.company  = 'Company name is required';
  return e;
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --navy:       #0B1629;
    --navy-mid:   #162240;
    --navy-light: #1E3054;
    --gold:       #C9A84C;
    --gold-light: #E8C97A;
    --gold-pale:  #F5EDD6;
    --cream:      #FAFAF7;
    --slate:      #64748B;
    --slate-lt:   #94A3B8;
    --success:    #10B981;
    --danger:     #EF4444;
    --border:     rgba(201,168,76,0.2);
    --white:      #FFFFFF;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html  { scroll-behavior: smooth; font-size: 16px; }
  body  { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--navy); overflow-x: hidden; }
  input, select, textarea { font-family: 'DM Sans', sans-serif; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse-g { 0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,.3);} 50%{box-shadow:0 0 0 8px rgba(201,168,76,0);} }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes tick    { 0%{transform:scale(0);} 60%{transform:scale(1.2);} 100%{transform:scale(1);} }
  @keyframes countUp { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }

  .fade-up { animation: fadeUp .5s ease both; }
  .fade-in { animation: fadeIn .4s ease both; }

  .qr-wrap  { max-width:1200px; margin:0 auto; padding:0 20px; }
  .qr-grid  { display:grid; grid-template-columns:1fr 420px; gap:40px; align-items:start; }

  .qr-nav { position:fixed; top:0; left:0; right:0; z-index:200; background:rgba(11,22,41,.97); backdrop-filter:blur(16px); border-bottom:1px solid var(--border); height:60px; display:flex; align-items:center; }
  .qr-nav-inner { display:flex; align-items:center; justify-content:space-between; width:100%; max-width:1200px; margin:0 auto; padding:0 20px; }
  .qr-logo { display:flex; align-items:center; gap:10px; text-decoration:none; }
  .qr-logo-mark { width:34px; height:34px; background:linear-gradient(135deg,var(--gold),var(--gold-light)); border-radius:7px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; color:var(--navy); }
  .qr-logo-text { font-family:'Playfair Display',serif; font-size:18px; color:white; }
  .qr-nav-right { display:flex; align-items:center; gap:12px; }

  .btn { display:inline-flex; align-items:center; gap:8px; padding:11px 24px; border-radius:7px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all .2s; border:none; text-decoration:none; white-space:nowrap; }
  .btn-gold { background:var(--gold); color:var(--navy); }
  .btn-gold:hover { background:var(--gold-light); transform:translateY(-1px); box-shadow:0 8px 24px rgba(201,168,76,.3); }
  .btn-gold:disabled { background:#CBD5E1; color:#94A3B8; cursor:not-allowed; transform:none; box-shadow:none; }
  .btn-outline { background:transparent; color:white; border:1.5px solid rgba(255,255,255,.35); }
  .btn-outline:hover { border-color:var(--gold); color:var(--gold); }
  .btn-ghost-navy { background:transparent; color:rgba(255,255,255,.6); font-size:13px; padding:8px 12px; }
  .btn-ghost-navy:hover { color:white; }
  .btn-lg { padding:15px 32px; font-size:16px; border-radius:8px; }
  .btn-full { width:100%; justify-content:center; }

  .qr-hero { background:linear-gradient(135deg,var(--navy) 0%,var(--navy-mid) 55%,#0D1F3C 100%); padding:100px 0 60px; position:relative; overflow:hidden; }
  .qr-hero-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(201,168,76,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.04) 1px,transparent 1px); background-size:60px 60px; pointer-events:none; }
  .qr-hero-glow { position:absolute; top:10%; left:50%; width:600px; height:600px; background:radial-gradient(circle,rgba(201,168,76,.05) 0%,transparent 70%); pointer-events:none; }
  .qr-eyebrow { display:inline-flex; align-items:center; gap:8px; background:rgba(201,168,76,.1); border:1px solid var(--border); border-radius:20px; padding:5px 14px; font-size:11px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--gold); margin-bottom:18px; }
  .qr-hero-title { font-family:'Playfair Display',serif; font-size:clamp(30px,4.5vw,56px); color:white; line-height:1.12; margin-bottom:18px; }
  .qr-hero-title em { color:var(--gold); font-style:normal; }
  .qr-hero-sub { font-size:17px; color:rgba(255,255,255,.65); line-height:1.7; margin-bottom:28px; max-width:500px; }
  .qr-trust-row { display:flex; flex-wrap:wrap; gap:20px; margin-top:32px; padding-top:28px; border-top:1px solid rgba(255,255,255,.1); }
  .qr-trust-stat { }
  .qr-trust-num { font-family:'Playfair Display',serif; font-size:26px; color:var(--gold); }
  .qr-trust-lbl { font-size:12px; color:rgba(255,255,255,.5); margin-top:2px; }

  .qr-form-card { background:white; border-radius:16px; padding:32px; box-shadow:0 24px 64px rgba(0,0,0,.25); border:1px solid rgba(255,255,255,.1); position:sticky; top:72px; }
  .qr-form-title { font-family:'Playfair Display',serif; font-size:20px; color:var(--navy); margin-bottom:4px; }
  .qr-form-sub   { font-size:13px; color:var(--slate); margin-bottom:24px; }

  .qr-field { margin-bottom:16px; }
  .qr-label { display:block; font-size:12px; font-weight:600; color:var(--navy); margin-bottom:5px; letter-spacing:.3px; }
  .qr-input { width:100%; padding:10px 13px; border:1.5px solid #E2E8F0; border-radius:8px; font-size:14px; color:var(--navy); background:white; transition:border-color .2s,box-shadow .2s; outline:none; }
  .qr-input:focus { border-color:var(--gold); box-shadow:0 0 0 3px rgba(201,168,76,.1); }
  .qr-input.err  { border-color:var(--danger); }
  .qr-err { font-size:11px; color:var(--danger); margin-top:4px; display:flex; align-items:center; gap:4px; }
  .qr-row2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

  .qr-urgency { display:flex; align-items:center; gap:8px; background:#FFFBEB; border:1px solid #FCD34D; border-radius:8px; padding:10px 14px; margin-bottom:20px; font-size:13px; color:#92400E; font-weight:500; }

  .qr-submit { width:100%; padding:14px; background:var(--gold); color:var(--navy); border:none; border-radius:10px; font-family:'DM Sans',sans-serif; font-size:16px; font-weight:700; cursor:pointer; transition:all .2s; margin-top:4px; display:flex; align-items:center; justify-content:center; gap:8px; }
  .qr-submit:hover:not(:disabled) { background:var(--gold-light); transform:translateY(-1px); box-shadow:0 10px 28px rgba(201,168,76,.35); }
  .qr-submit:disabled { background:#CBD5E1; color:#94A3B8; cursor:not-allowed; transform:none; }

  .qr-trust-pills { display:flex; flex-wrap:wrap; gap:6px; margin-top:14px; }
  .qr-trust-pill  { font-size:11px; color:var(--slate); display:flex; align-items:center; gap:4px; }

  .qr-section { padding:60px 0; }
  .qr-section-alt { background:white; }
  .qr-highlights { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:20px; margin-top:32px; }
  .qr-highlight { display:flex; align-items:flex-start; gap:14px; padding:20px; background:var(--cream); border-radius:12px; border:1px solid rgba(0,0,0,.05); }
  .qr-highlight-icon { width:42px; height:42px; background:linear-gradient(135deg,var(--navy),var(--navy-mid)); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
  .qr-highlight-title { font-size:14px; font-weight:600; color:var(--navy); margin-bottom:3px; }
  .qr-highlight-desc  { font-size:13px; color:var(--slate); line-height:1.5; }

  .qr-pricing-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:20px; margin-top:32px; }
  .qr-price-card { background:white; border:2px solid #E2E8F0; border-radius:14px; padding:24px; position:relative; transition:all .2s; }
  .qr-price-card.recommended { border-color:var(--gold); box-shadow:0 0 0 4px rgba(201,168,76,.1); }
  .qr-price-rec-badge { position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:var(--gold); color:var(--navy); font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; padding:4px 14px; border-radius:20px; white-space:nowrap; }
  .qr-price-code  { font-size:11px; font-weight:700; color:var(--gold); letter-spacing:1px; text-transform:uppercase; margin-bottom:6px; }
  .qr-price-title { font-family:'Playfair Display',serif; font-size:18px; color:var(--navy); margin-bottom:4px; }
  .qr-price-role  { font-size:12px; color:var(--slate); margin-bottom:16px; }
  .qr-price-eb    { font-size:12px; color:var(--success); font-weight:600; }
  .qr-price-full  { font-size:12px; color:var(--slate-lt); text-decoration:line-through; }
  .qr-price-num   { font-family:'Playfair Display',serif; font-size:32px; color:var(--navy); }
  .qr-price-dur   { font-size:12px; color:var(--slate); margin-top:4px; }
  .qr-price-btn   { margin-top:16px; width:100%; }

  .qr-testimonials { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; margin-top:32px; }
  .qr-testimonial  { background:var(--navy); border-radius:14px; padding:24px; }
  .qr-test-stars   { color:var(--gold); font-size:14px; margin-bottom:12px; letter-spacing:2px; }
  .qr-test-text    { font-size:14px; color:rgba(255,255,255,.8); line-height:1.7; margin-bottom:16px; font-style:italic; }
  .qr-test-name    { font-size:14px; font-weight:600; color:white; }
  .qr-test-role    { font-size:12px; color:rgba(255,255,255,.45); margin-top:2px; }
  .qr-test-cert    { display:inline-block; margin-top:10px; font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:var(--gold); background:rgba(201,168,76,.1); border:1px solid rgba(201,168,76,.3); border-radius:20px; padding:3px 10px; }

  .qr-success { text-align:center; padding:40px 20px; animation:fadeIn .5s ease; }
  .qr-success-icon { font-size:64px; margin-bottom:16px; animation:tick .5s .2s both cubic-bezier(.34,1.56,.64,1); display:block; }
  .qr-success-title { font-family:'Playfair Display',serif; font-size:26px; color:var(--navy); margin-bottom:8px; }
  .qr-success-sub   { font-size:15px; color:var(--slate); line-height:1.6; margin-bottom:28px; }
  .qr-next-steps    { background:#F0F9FF; border:1px solid #BAE6FD; border-radius:12px; padding:20px; text-align:left; margin-bottom:24px; }
  .qr-next-steps h4 { font-size:14px; font-weight:700; color:var(--navy); margin-bottom:12px; }
  .qr-next-step     { display:flex; align-items:flex-start; gap:10px; font-size:13px; color:var(--slate); margin-bottom:8px; line-height:1.5; }

  .qr-sticky-bar { display:none; position:fixed; bottom:0; left:0; right:0; z-index:150; background:var(--navy); padding:12px 20px; border-top:1px solid var(--border); }

  .qr-toggle-wrap { display:flex; align-items:center; gap:10px; padding:12px; background:#F8FAFC; border-radius:8px; margin-bottom:16px; border:1px solid #E2E8F0; cursor:pointer; }
  .qr-toggle { position:relative; width:38px; height:22px; flex-shrink:0; }
  .qr-toggle input { opacity:0; width:0; height:0; }
  .qr-toggle-slider { position:absolute; cursor:pointer; inset:0; background:#CBD5E1; border-radius:11px; transition:.3s; }
  .qr-toggle-slider::before { content:''; position:absolute; height:16px; width:16px; left:3px; bottom:3px; background:white; border-radius:50%; transition:.3s; }
  .qr-toggle input:checked+.qr-toggle-slider { background:var(--gold); }
  .qr-toggle input:checked+.qr-toggle-slider::before { transform:translateX(16px); }

  .qr-seat-wrap { font-size:12px; color:var(--slate); margin-top:4px; display:flex; align-items:center; gap:8px; }
  .qr-seat-bar  { flex:1; height:4px; background:#E2E8F0; border-radius:2px; overflow:hidden; }
  .qr-seat-fill { height:100%; border-radius:2px; transition:width .4s; }

  .qr-lbl { font-size:11px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:var(--gold); margin-bottom:10px; }
  .qr-sec-title { font-family:'Playfair Display',serif; font-size:clamp(24px,3.5vw,36px); color:var(--navy); line-height:1.2; }
  .qr-sec-title.light { color:white; }
  .qr-sec-sub { font-size:16px; color:var(--slate); margin-top:10px; line-height:1.6; }
  .qr-sec-sub.light { color:rgba(255,255,255,.6); }

  .qr-spinner { width:20px; height:20px; border:3px solid rgba(11,22,41,.2); border-top-color:var(--navy); border-radius:50%; animation:spin .7s linear infinite; }

  @media (max-width: 900px) {
    .qr-grid { grid-template-columns:1fr; gap:0; }
    .qr-form-card { position:static; border-radius:0; box-shadow:0 -4px 20px rgba(0,0,0,.15); margin:0 -20px; padding:28px 20px; }
    .qr-hero { padding-bottom:0; }
    .qr-trust-row { display:none; }
    .qr-sticky-bar { display:block; }
    .qr-row2 { grid-template-columns:1fr; }
    .qr-nav-phone, .qr-nav-back { display:none; }
    .qr-pricing-grid { grid-template-columns:1fr; max-width:380px; }
  }

  @media (max-width: 520px) {
    .qr-highlights { grid-template-columns:1fr; }
    .qr-testimonials { grid-template-columns:1fr; }
  }
`;

// ─── Main component ────────────────────────────────────────────────────────────
export default function QuickRegisterClient() {
  const formRef = useRef(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', certId: '', sessionIdx: '', company: '', corpSize: '', isCorporate: false,
  });
  const [errors,        setErrors]        = useState({});
  const [touched,       setTouched]       = useState({});
  const [phase,         setPhase]         = useState('form');
  const [submitting,    setSubmitting]    = useState(false);
  const [regId,         setRegId]         = useState(null);
  const [apiError,      setApiError]      = useState('');
  const [couponCode,    setCouponCode]    = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError,   setCouponError]   = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [liveSessions,  setLiveSessions]  = useState(UPCOMING);

  const { data: authSession, status: authStatus } = useSession();

  // Auto-fill name & email from authenticated session (Google or credentials)
  useEffect(() => {
    if (authSession?.user) {
      setForm(f => ({
        ...f,
        name:  f.name  || authSession.user.name  || '',
        email: f.email || authSession.user.email || '',
      }));
    }
  }, [authSession]);

  // Fetch live sessions from DB on mount
  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(s => ({
            certId:     s.code.toLowerCase(),
            date:       s.session_date.split('T')[0],
            tz:         s.timezone || 'EST',
            format:     s.format,
            earlyBird:  Number(s.early_bird_price),
            price:      Number(s.price),
            ebDeadline: '2099-12-31',
            seats:      s.max_seats,
            booked:     0,
          }));
          setLiveSessions(mapped);
        }
      })
      .catch(() => {}); // keep hardcoded fallback on error
  }, []);

  const cert     = useMemo(() => getCert(form.certId),     [form.certId]);
  const sessions = useMemo(() => liveSessions.filter(s => s.certId === form.certId), [liveSessions, form.certId]);
  const session  = useMemo(() => sessions[parseInt(form.sessionIdx, 10)] ?? null, [sessions, form.sessionIdx]);
  const eb       = session && isEarlyBird(session.ebDeadline);
  const basePrice = session ? (eb ? session.earlyBird : session.price) : cert?.earlyBird ?? 0;
  const couponDiscount = couponApplied ? (couponApplied.discount_type === 'fixed' ? couponApplied.discount_value : Math.round(basePrice * couponApplied.discount_value / 100)) : 0;
  const price    = Math.max(0, basePrice - couponDiscount);

  const showCoupon = COUPON_COURSES.includes(form.certId);

  useEffect(() => { setCouponApplied(null); setCouponCode(''); setCouponError(''); }, [form.certId]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true); setCouponError('');
    try {
      const res  = await fetch('/api/coupon', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: couponCode.trim() }) });
      const data = await res.json();
      if (data.valid) { setCouponApplied(data.coupon); setCouponError(''); }
      else            { setCouponApplied(null); setCouponError('Invalid or expired coupon code.'); }
    } catch { setCouponError('Could not verify coupon. Try again.'); }
    finally  { setCouponLoading(false); }
  };

  useEffect(() => {
    if (sessions.length === 1) setForm(f => ({ ...f, sessionIdx: '0' }));
    else                        setForm(f => ({ ...f, sessionIdx: '' }));
  }, [form.certId, sessions.length]);

  useEffect(() => {
    const p   = new URLSearchParams(window.location.search);
    const upd = {};
    const c   = p.get('course') || p.get('cert');
    if (c && CERTIFICATIONS.find(x => x.id === c)) upd.certId = c;
    if (p.get('name'))  upd.name  = p.get('name');
    if (p.get('email')) upd.email = p.get('email');
    if (Object.keys(upd).length) setForm(f => ({ ...f, ...upd }));
  }, []);

  const set = useCallback((k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setTouched(t => ({ ...t, [k]: true }));
  }, []);

  const blur = useCallback((k) => {
    setTouched(t => ({ ...t, [k]: true }));
    setErrors(validate({ ...form }));
  }, [form]);

  const fieldErr = useCallback((k) => touched[k] ? errors[k] : undefined, [touched, errors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setTouched({ name: true, email: true, phone: true, certId: true, company: true });
      return;
    }
    setSubmitting(true);
    setApiError('');
    try {
      const res = await fetch('/api/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name:   form.name.trim(),
          email:       form.email.trim(),
          phone:       form.phone.trim(),
          company:     form.isCorporate ? form.company.trim() : null,
          job_title:   null,
          country:     null,
          session_id:  null,
          coupon_code: couponApplied ? couponCode.trim().toUpperCase() : null,
          amount_paid: price || null,
          currency:    'USD',
        }),
      });

      let data;
      try { data = await res.json(); } catch { throw new Error('Server error — please try again'); }
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setRegId(data.id);
      // Send seat-reserved email immediately after registration
      fetch('/api/notify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:          form.name.trim(),
          email:         form.email.trim(),
          course:        cert?.title || 'SAFe Certification',
          sessionDate:   session?.date   || null,
          sessionFormat: session?.format || null,
          sessionTz:     session?.tz     || null,
          price:         price           || null,
          regId:         data.id,
        }),
      }).catch(() => {}); // fire-and-forget — don't block payment flow
      setPhase('payment');  // show Stripe payment form
    } catch (err) {
      setApiError(err.message);
      setSubmitting(false);
    }
  };

  // Called by PaymentForm after Stripe confirms payment
  const handlePaymentSuccess = useCallback(() => {
    // Send confirmation email now that payment is complete
    fetch('/api/notify', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:          form.name.trim(),
        email:         form.email.trim(),
        course:        cert?.title || 'SAFe Certification',
        sessionDate:   session?.date   || null,
        sessionFormat: session?.format || null,
        sessionTz:     session?.tz     || null,
        regId,
        price,
      }),
    }).catch(() => {});

    const confirmUrl = new URL('/registration-success', window.location.origin);
    confirmUrl.searchParams.set('name',   form.name.trim());
    confirmUrl.searchParams.set('email',  form.email.trim());
    confirmUrl.searchParams.set('course', cert?.title || '');
    confirmUrl.searchParams.set('date',   session?.date || '');
    confirmUrl.searchParams.set('format', session?.format || '');
    confirmUrl.searchParams.set('price',  String(price || ''));
    confirmUrl.searchParams.set('ref',    regId ? String(regId).slice(0, 8).toUpperCase() : '');
    confirmUrl.searchParams.set('paid',   'true');
    window.location.href = confirmUrl.toString();
  }, [form, cert, session, price, regId]);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const seats   = session ? seatsLeft(session) : null;
  const urgency = seats !== null && seats <= 6;

  return (
    <>
      <style>{CSS}</style>

      <nav className="qr-nav">
        <div className="qr-nav-inner">
          <a href="/" className="qr-logo">
            <div className="qr-logo-mark">AE</div>
            <span className="qr-logo-text">AgileEdge</span>
          </a>
          <div className="qr-nav-right">
            <a href="tel:+1-800-AGILE" className="btn-ghost-navy btn qr-nav-phone" style={{ color: 'rgba(255,255,255,.55)', fontSize: 13 }}>
              📞 +1-800-AGILE
            </a>
            <a href="/" className="btn btn-outline qr-nav-back" style={{ padding: '7px 14px', fontSize: 12 }}>
              ← Main site
            </a>
            {authSession?.user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {authSession.user.image ? (
                  <img
                    src={authSession.user.image}
                    alt={authSession.user.name || 'User'}
                    referrerPolicy="no-referrer"
                    style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid var(--gold)', objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'var(--navy)', flexShrink: 0 }}>
                    {(authSession.user.name || authSession.user.email || '?')[0].toUpperCase()}
                  </div>
                )}
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', fontWeight: 500, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {authSession.user.name || authSession.user.email}
                </span>
                <button
                  className="btn btn-outline"
                  style={{ padding: '6px 12px', fontSize: 12 }}
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button className="btn btn-gold" style={{ padding: '8px 18px', fontSize: 13 }} onClick={scrollToForm}>
                Register Now
              </button>
            )}
          </div>
        </div>
      </nav>

      <section className="qr-hero">
        <div className="qr-hero-grid" />
        <div className="qr-hero-glow" />
        <div className="qr-wrap">
          <div className="qr-grid" style={{ alignItems: 'center' }}>
            <div className="fade-up">
              <div className="qr-eyebrow">⚡ Register in 60 seconds</div>
              <h1 className="qr-hero-title">
                Earn Your SAFe<br />Certification — <em>Fast.</em>
              </h1>
              <p className="qr-hero-sub">
                Skip the back-and-forth. Choose your course, pick a date, and secure your seat in under a minute. Trusted by 30,000+ professionals worldwide.
              </p>
              <button className="btn btn-gold btn-lg" onClick={scrollToForm}>
                Secure My Seat — Takes 60s →
              </button>
              <div className="qr-trust-row">
                {[['30,000+','Professionals certified'],['94%','Completion rate'],['4.9★','Average rating'],['SAFe®','Certified trainers']].map(([n,l]) => (
                  <div className="qr-trust-stat" key={l}>
                    <div className="qr-trust-num">{n}</div>
                    <div className="qr-trust-lbl">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div ref={formRef}>
              <div className="qr-form-card">

                {/* ── Loading ── */}
                {authStatus === 'loading' && (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div className="qr-spinner" style={{ margin: '0 auto', width: 32, height: 32 }} />
                  </div>
                )}

                {/* ── Not signed in: inline auth panel ── */}
                {authStatus === 'unauthenticated' && (
                  <div>
                    <div className="qr-form-title">Sign in to Register</div>
                    <p className="qr-form-sub">Sign in to secure your seat — takes under 60 seconds</p>

                    {/* Google button */}
                    <button
                      onClick={() => signIn('google', { callbackUrl: '/quick-register' })}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '13px 20px', border: '1.5px solid #E2E8F0', borderRadius: 9, background: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, color: '#0B1629', cursor: 'pointer', marginBottom: 16, transition: 'all .2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.background = '#FAFAF7'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = 'white'; }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </button>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 }}>or</span>
                      <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
                    </div>

                    {/* Email/password link */}
                    <a
                      href="/auth?callbackUrl=/quick-register"
                      style={{ display: 'block', textAlign: 'center', padding: '11px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 14, fontWeight: 600, color: '#0B1629', textDecoration: 'none', marginBottom: 16, transition: 'border-color .2s' }}
                    >
                      Sign in with Email / Password
                    </a>

                    <p style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8' }}>
                      No account?{' '}
                      <a href="/auth?callbackUrl=/quick-register" style={{ color: '#C9A84C', fontWeight: 600, textDecoration: 'none' }}>Create one free →</a>
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16, justifyContent: 'center' }}>
                      {['🔒 256-bit SSL', '✅ No spam', '⚡ 60-second setup'].map(t => (
                        <span key={t} style={{ fontSize: 11, color: '#94A3B8' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Signed in: show banner + form ── */}
                {authStatus === 'authenticated' && (
                  <>
                    {/* Signed-in banner */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
                      {authSession.user.image ? (
                        <img src={authSession.user.image} alt="" referrerPolicy="no-referrer" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, border: '2px solid #86EFAC' }} />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#0B1629', flexShrink: 0 }}>
                          {(authSession.user.name || authSession.user.email || '?')[0].toUpperCase()}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#15803D' }}>✓ Signed in</div>
                        <div style={{ fontSize: 12, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {authSession.user.name ? `${authSession.user.name} · ` : ''}{authSession.user.email}
                        </div>
                      </div>
                      <button onClick={() => signOut({ callbackUrl: '/quick-register' })} style={{ background: 'none', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 11, color: '#64748B', cursor: 'pointer', padding: '4px 8px', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>
                        Switch account
                      </button>
                    </div>

                    {phase === 'form'    && <RegistrationForm form={form} set={set} blur={blur} fieldErr={fieldErr} cert={cert} sessions={sessions} session={session} price={price} basePrice={basePrice} couponDiscount={couponDiscount} eb={eb} seats={seats} urgency={urgency} submitting={submitting} apiError={apiError} onSubmit={handleSubmit} showCoupon={showCoupon} couponCode={couponCode} setCouponCode={setCouponCode} couponApplied={couponApplied} couponError={couponError} couponLoading={couponLoading} applyCoupon={applyCoupon} />}
                    {phase === 'payment' && <PaymentSection   form={form} cert={cert} session={session} price={price} regId={regId} onSuccess={handlePaymentSuccess} />}
                  </>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="qr-section">
        <div className="qr-wrap">
          <div className="qr-lbl">Why AgileEdge</div>
          <h2 className="qr-sec-title">Everything you need, nothing you don't</h2>
          <div className="qr-highlights">
            {[
              { icon: '🏅', title: 'SAFe® Official Certification', desc: 'Globally recognised credentials valid across 70+ countries. Issued by Scaled Agile, Inc.' },
              { icon: '📅', title: 'Flexible Schedules', desc: 'Virtual and in-person cohorts every 2–4 weeks. Morning, afternoon, and weekend slots available.' },
              { icon: '🎓', title: 'SPC-Certified Trainers', desc: 'Learn from practitioners who\'ve led SAFe transformations at Fortune 500 companies.' },
              { icon: '⚡', title: 'Instant Seat Confirmation', desc: 'Register in 60 seconds. Receive your enrollment email within 5 minutes of payment.' },
            ].map(h => (
              <div className="qr-highlight" key={h.title}>
                <div className="qr-highlight-icon">{h.icon}</div>
                <div>
                  <div className="qr-highlight-title">{h.title}</div>
                  <div className="qr-highlight-desc">{h.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="qr-section qr-section-alt">
        <div className="qr-wrap">
          <div className="qr-lbl">Pricing</div>
          <h2 className="qr-sec-title">Choose your certification</h2>
          <p className="qr-sec-sub">All prices include SAFe® exam fee, digital badge, and 1-year membership.</p>
          <div className="qr-pricing-grid">
            {[
              { id: 'ssm',  recommended: false },
              { id: 'sa',   recommended: true  },
              { id: 'popm', recommended: false },
            ].map(({ id, recommended }) => {
              const c   = getCert(id);
              const s   = getSessions(id)[0];
              const isEB = s && isEarlyBird(s.ebDeadline);
              return (
                <div className={`qr-price-card${recommended ? ' recommended' : ''}`} key={id}>
                  {recommended && <div className="qr-price-rec-badge">Most Popular</div>}
                  <div className="qr-price-code">{c.code}</div>
                  <div className="qr-price-title">{c.title}</div>
                  <div className="qr-price-role">{c.role} · {c.duration}</div>
                  {isEB && <div className="qr-price-eb">⚡ Early bird active</div>}
                  <div style={{ marginTop: 12 }}>
                    {isEB && <div className="qr-price-full">{fmtPrice(c.price)}</div>}
                    <span className="qr-price-num">{fmtPrice(isEB ? c.earlyBird : c.price)}</span>
                  </div>
                  {s && <div className="qr-price-dur">📅 Next: {fmtDate(s.date)}</div>}
                  <button className="btn btn-gold qr-price-btn" onClick={() => { setForm(f => ({ ...f, certId: id })); scrollToForm(); }}>
                    Select &amp; Register →
                  </button>
                </div>
              );
            })}
          </div>
          <p style={{ marginTop: 20, fontSize: 13, color: 'var(--slate)' }}>
            Looking for RTE, SPC, or Advanced Scrum Master?{' '}
            <button onClick={scrollToForm} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>View all courses in the form →</button>
          </p>
        </div>
      </section>

      <section className="qr-section" style={{ background: 'var(--navy)' }}>
        <div className="qr-wrap">
          <div className="qr-lbl">Social Proof</div>
          <h2 className="qr-sec-title light">Trusted by enterprise agile leaders</h2>
          <div className="qr-testimonials">
            {TESTIMONIALS.map(t => (
              <div className="qr-testimonial" key={t.name}>
                <div className="qr-test-stars">{'★'.repeat(t.rating)}</div>
                <p className="qr-test-text">"{t.text}"</p>
                <div className="qr-test-name">{t.name}</div>
                <span className="qr-test-cert">{t.cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="qr-section" style={{ textAlign: 'center' }}>
        <div className="qr-wrap">
          <div className="qr-lbl">Ready?</div>
          <h2 className="qr-sec-title">Your seat is one click away</h2>
          <p className="qr-sec-sub" style={{ maxWidth: 480, margin: '10px auto 28px' }}>
            Join 30,000+ certified agile professionals. Most cohorts fill in under 72 hours.
          </p>
          <button className="btn btn-gold btn-lg" onClick={scrollToForm}>
            Register Now — Takes 60 Seconds →
          </button>
        </div>
      </section>

      <div style={{ background: 'var(--navy)', padding: '20px', textAlign: 'center' }}>
        <a href="/" style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, textDecoration: 'none' }}>
          ← Back to AgileEdge main site
        </a>
        <span style={{ color: 'rgba(255,255,255,.15)', margin: '0 12px' }}>|</span>
        <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 12 }}>© 2026 AgileEdge · All rights reserved</span>
      </div>

      <div className="qr-sticky-bar">
        <button className="btn btn-gold btn-full btn-lg" onClick={scrollToForm} style={{ borderRadius: 10 }}>
          Secure Your Seat →
        </button>
      </div>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RegistrationForm({ form, set, blur, fieldErr, cert, sessions, session, price, basePrice, couponDiscount, eb, seats, urgency, submitting, apiError, onSubmit, showCoupon, couponCode, setCouponCode, couponApplied, couponError, couponLoading, applyCoupon }) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="qr-form-title">Quick Registration</div>
      <p className="qr-form-sub">Secure your seat — takes under 60 seconds</p>

      {urgency && seats !== null && (
        <div className="qr-urgency">
          🔥 Only <strong>{seats} seat{seats !== 1 ? 's' : ''}</strong> remaining for this session!
        </div>
      )}

      <div className="qr-row2">
        <Field label="Full Name *" error={fieldErr('name')}>
          <input className={`qr-input${fieldErr('name') ? ' err' : ''}`} placeholder="Jane Smith" value={form.name} autoFocus
            onChange={e => set('name', e.target.value)} onBlur={() => blur('name')} autoComplete="name" />
        </Field>
        <Field label="Work Email *" error={fieldErr('email')}>
          <input className={`qr-input${fieldErr('email') ? ' err' : ''}`} type="email" placeholder="jane@company.com" value={form.email}
            onChange={e => set('email', e.target.value)} onBlur={() => blur('email')} autoComplete="email" />
        </Field>
      </div>

      <Field label="Phone Number *" error={fieldErr('phone')}>
        <input className={`qr-input${fieldErr('phone') ? ' err' : ''}`} type="tel" placeholder="+1 (555) 000-0000" value={form.phone}
          onChange={e => set('phone', e.target.value)} onBlur={() => blur('phone')} autoComplete="tel" />
      </Field>

      <Field label="Select Course *" error={fieldErr('certId')}>
        <select className={`qr-input${fieldErr('certId') ? ' err' : ''}`} value={form.certId}
          onChange={e => set('certId', e.target.value)} onBlur={() => blur('certId')}
          style={{ appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
          <option value="">— Choose your certification —</option>
          {CERTIFICATIONS.map(c => (
            <option key={c.id} value={c.id}>{c.code} · {c.title} — ${c.earlyBird.toLocaleString('en-US')} (Early Bird)</option>
          ))}
        </select>
      </Field>

      {form.certId && sessions.length > 1 && (
        <Field label="Preferred Session Date *" error={fieldErr('sessionIdx')}>
          <select className="qr-input" value={form.sessionIdx} onChange={e => set('sessionIdx', e.target.value)}>
            <option value="">— Choose a date —</option>
            {sessions.map((s, i) => {
              const left = seatsLeft(s);
              return (
                <option key={i} value={String(i)} disabled={left === 0}>
                  {fmtDate(s.date)} · {s.format} · {s.tz}{left === 0 ? ' (Sold Out)' : ` · ${left} seats left`}
                </option>
              );
            })}
          </select>
        </Field>
      )}

      {session && (
        <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
          <div style={{ fontWeight: 600, color: '#15803D', marginBottom: 3 }}>📅 {fmtDate(session.date)}</div>
          <div style={{ color: 'var(--slate)' }}>{session.format} · {session.tz}</div>
          {seats !== null && (
            <div className="qr-seat-wrap" style={{ marginTop: 8 }}>
              <div className="qr-seat-bar">
                <div className="qr-seat-fill" style={{ width: `${(session.booked / session.seats) * 100}%`, background: seats <= 4 ? 'var(--danger)' : 'var(--success)' }} />
              </div>
              <span style={{ color: seats <= 4 ? 'var(--danger)' : 'var(--slate)' }}>{seats} left</span>
            </div>
          )}
        </div>
      )}

      <label className="qr-toggle-wrap">
        <span className="qr-toggle">
          <input type="checkbox" checked={form.isCorporate} onChange={e => set('isCorporate', e.target.checked)} />
          <span className="qr-toggle-slider" />
        </span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>Registering a corporate group?</div>
          <div style={{ fontSize: 12, color: 'var(--slate)' }}>5+ seats · Group pricing available</div>
        </div>
      </label>

      {form.isCorporate && (
        <div className="qr-row2" style={{ marginBottom: 16 }}>
          <Field label="Company Name *" error={fieldErr('company')}>
            <input className={`qr-input${fieldErr('company') ? ' err' : ''}`} placeholder="Acme Corp" value={form.company}
              onChange={e => set('company', e.target.value)} onBlur={() => blur('company')} autoComplete="organization" />
          </Field>
          <Field label="Number of Seats">
            <select className="qr-input" value={form.corpSize} onChange={e => set('corpSize', e.target.value)}>
              <option value="">Select…</option>
              {['5–10','11–20','21–50','50+'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
        </div>
      )}

      {cert && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--navy)', borderRadius: 10, marginBottom: 16, color: 'white' }}>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 2 }}>{cert.title}</div>
            {eb && <div style={{ fontSize: 11, color: 'var(--success)' }}>⚡ Special rate applied</div>}
          </div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: 'var(--gold)' }}>${price.toLocaleString('en-US')}</div>
        </div>
      )}

      {apiError && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>
          {apiError}
        </div>
      )}

      <button type="submit" className="qr-submit" disabled={submitting}>
        {submitting ? <><div className="qr-spinner" /> Processing…</> : <>Secure My Seat →</>}
      </button>

      <div className="qr-trust-pills">
        {['🔒 256-bit SSL', '✅ Instant confirmation', '📧 Email within 5 min'].map(t => (
          <span className="qr-trust-pill" key={t}>{t}</span>
        ))}
      </div>
    </form>
  );
}

function PaymentSection({ form, cert, session, price, onSuccess }) {
  return (
    <div>
      <div className="qr-form-title" style={{ marginBottom: 4 }}>Complete Payment</div>
      <p className="qr-form-sub">Secure payment via Stripe · 256-bit SSL</p>
      <div style={{ background: 'var(--navy)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, color: 'white' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Order Summary</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{cert?.title}</div>
            {session && <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 3 }}>📅 {fmtDate(session.date)} · {session.format}</div>}
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>👤 {form.name} · {form.email}</div>
          </div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: 'var(--gold)', flexShrink: 0 }}>
            ${price.toLocaleString('en-US')}
          </div>
        </div>
      </div>
      <PaymentForm
        key={form.email + cert?.id}
        amount={price}
        currency="USD"
        name={form.name}
        email={form.email}
        courseTitle={`${cert?.title ?? ''}${session ? ' — ' + fmtDate(session.date) : ''}`}
        onSuccess={onSuccess}
      />
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="qr-field">
      <label className="qr-label">{label}</label>
      {children}
      {error && <div className="qr-err"><span>⚠</span>{error}</div>}
    </div>
  );
}
