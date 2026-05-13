'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

/* ── Palette (matches enterprise-agile/page.js) ─────── */
const BG      = '#F7F6F2';
const BG_ALT  = '#EFECEA';
const BG_DARK = '#2D4A55';
const BG_FND  = '#1A3832';
const BORDER  = '#C8C4BC';
const TEXT    = '#111C20';
const MUTED   = '#3D5A60';
const FAINT   = '#5A7880';
const GOLD    = '#C9973A';
const SAGE    = '#2E7D52';

const TIMELINE = [
  { year: 'Early Career', title: 'First Enterprise Agile Engagement', desc: 'Witnessed a large-scale transformation stall because strategy never connected to execution. That experience became the lens for everything that followed.' },
  { year: 'Mid Career',   title: 'Agile Release Trains That Actually Delivered', desc: "Led Agile transformation for a multi-thousand-person organization — first time a Value Stream delivered on time, every sprint. Proved what's possible when strategy and execution are fully aligned." },
  { year: 'Certification', title: 'Became a SAFe Program Consultant', desc: 'Earning SPC certification confirmed what the field had already taught: credentials alone mean nothing without implementation wisdom. Both matter. Neither is sufficient alone.' },
  { year: 'Founding',     title: 'Founded Optimized Solutions', desc: 'Built the firm that was always missing — practitioner-led, outcome-obsessed, and structured to transfer capability rather than create dependency.' },
  { year: '2025',         title: 'AI-Empowered SAFe Certifications', desc: 'The market needed certifications designed for an AI-augmented enterprise. We built the curriculum first, integrating AI tools into every SAFe practice area.' },
];

const PILLARS = [
  {
    title: 'Strategy Before Framework',
    body: 'No framework saves a misaligned strategy. We align first, then implement — because the best methodology in the wrong context just accelerates failure.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <path d="M6 30L18 6l12 24" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 24h18" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: 'Outcomes Over Outputs',
    body: "We don't count velocity points. We count business results — reduced time to market, measurable ROI, and governance that accelerates instead of obstructs.",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <circle cx="18" cy="18" r="11" stroke={GOLD} strokeWidth="1.8"/>
        <path d="M18 12v6l4 4" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: 'Transformation Is Human Work',
    body: "Technology and process are the easy part. People, culture, and leadership are where transformations win or lose — and that's where we spend most of our energy.",
    icon: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <circle cx="13" cy="13" r="5" stroke={GOLD} strokeWidth="1.8"/>
        <circle cx="25" cy="21" r="5" stroke={GOLD} strokeWidth="1.8"/>
        <path d="M18 13c0 0 4 2 4 8" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const CERTS = ['SAFe SPC 6.0', 'Leading Agilist', 'PMP', 'CSM', 'POPM', 'SSM', 'SA', 'SASM'];

/* ── Scroll-reveal hook ──────────────────────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setOn(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, on];
}

/* ── Individual reveal component ──────────────────────── */
function Reveal({ children, delay = 0, style = {}, as: Tag = 'div' }) {
  const [ref, on] = useReveal();
  return (
    <Tag
      ref={ref}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

export default function AboutPage() {
  /* Parallax hero */
  const heroBgRef = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      if (heroBgRef.current) {
        heroBgRef.current.style.transform = `translateY(${window.scrollY * 0.32}px)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <main style={{ background: BG, minHeight: '100vh', paddingTop: 64, fontFamily: "'DM Sans', Arial, sans-serif" }}>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section style={{ position: 'relative', background: BG_FND, overflow: 'hidden', minHeight: 480, display: 'flex', alignItems: 'center' }}>
        {/* Parallax photo background */}
        <div ref={heroBgRef} style={{ position: 'absolute', inset: 0, willChange: 'transform' }}>
          <Image
            src="/girijaa-photo.png"
            alt=""
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center top', filter: 'brightness(0.32) saturate(0.65)' }}
          />
        </div>
        {/* Diagonal overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(26,56,50,0.96) 45%, rgba(26,56,50,0.52) 100%)', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1060, margin: '0 auto', padding: '100px 28px 88px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(201,151,58,0.85)', marginBottom: 18 }}>About Us</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.025em', color: '#F7F4EF', margin: '0 0 22px', maxWidth: 660 }}>
            Transformation is personal.{' '}
            <em style={{ fontStyle: 'italic', color: '#C9B88A' }}>So is how we lead it.</em>
          </h1>
          <p style={{ fontSize: 15, fontWeight: 500, color: 'rgba(247,244,239,0.58)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Enterprise Agile Consulting
            <span style={{ margin: '0 10px', color: 'rgba(247,244,239,0.25)' }}>·</span>
            SAFe Program Consultants
            <span style={{ margin: '0 10px', color: 'rgba(247,244,239,0.25)' }}>·</span>
            AI Transformation Specialists
          </p>
        </div>
      </section>


      {/* ══ MISSION ═══════════════════════════════════════ */}
      <section style={{ background: BG, borderBottom: `1px solid ${BORDER}`, padding: '80px 28px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <Reveal>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, marginBottom: 14 }}>Our Mission</div>
          </Reveal>
          <Reveal delay={80}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 3.5vw, 38px)', letterSpacing: '-0.02em', lineHeight: 1.12, color: TEXT, margin: '0 0 28px' }}>
              Agile That Actually Works
            </h2>
          </Reveal>
          <Reveal delay={140} style={{ fontSize: 16, color: MUTED, lineHeight: 1.85, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <p style={{ margin: 0 }}>
              Optimized Solutions was founded on a simple belief: agile transformation works best when it's led by practitioners who have done the work — not consultants who have only read the playbook. We bring deep, hands-on experience from the field to every training course, coaching engagement, and organizational transformation we take on.
            </p>
            <p style={{ margin: 0 }}>
              Our approach centres on sustainable change. We don't just introduce frameworks — we embed Lean-Agile thinking into the culture, systems, and leadership mindset of every organization we work with, and we deliberately design every engagement to reduce reliance on us over time.
            </p>
            <p style={{ margin: 0 }}>
              From federal agencies to Fortune 500 enterprises, we've helped organizations across financial services, healthcare, and government achieve real, measurable outcomes — not just framework compliance.
            </p>
          </Reveal>
        </div>
      </section>


      {/* ══ TIMELINE ══════════════════════════════════════ */}
      <section style={{ background: BG_ALT, borderBottom: `1px solid ${BORDER}`, padding: '80px 28px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <Reveal>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, marginBottom: 14 }}>The Journey</div>
          </Reveal>
          <Reveal delay={80}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 3.5vw, 38px)', letterSpacing: '-0.02em', lineHeight: 1.12, color: TEXT, margin: '0 0 56px' }}>
              How We Got Here
            </h2>
          </Reveal>
          <div style={{ position: 'relative', paddingLeft: 36 }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 1, background: BORDER }} />
            {TIMELINE.map(({ year, title, desc }, i) => (
              <TlEntry key={year} year={year} title={title} desc={desc} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>


      {/* ══ PHILOSOPHY ════════════════════════════════════ */}
      <section style={{ background: BG, borderBottom: `1px solid ${BORDER}`, padding: '80px 28px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <Reveal>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, marginBottom: 14 }}>Our Philosophy</div>
          </Reveal>
          <Reveal delay={80}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(26px, 3.5vw, 38px)', letterSpacing: '-0.02em', lineHeight: 1.12, color: TEXT, margin: '0 0 52px' }}>
              Three Principles We Never Compromise
            </h2>
          </Reveal>
          <style>{`
            @media (max-width: 700px) {
              .ab-pillar-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
              .ab-pillar { padding: 0 0 32px 0 !important; border-right: none !important; border-bottom: 1px solid ${BORDER} !important; }
              .ab-pillar:last-child { border-bottom: none !important; padding-bottom: 0 !important; }
              .ab-pillar + .ab-pillar { padding-left: 0 !important; }
            }
          `}</style>
          <div className="ab-pillar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {PILLARS.map(({ title, body, icon }, i) => (
              <Reveal key={title} delay={i * 100} style={{ padding: i === 0 ? '0 40px 0 0' : i === 2 ? '0 0 0 40px' : '0 40px', borderRight: i < 2 ? `1px solid ${BORDER}` : 'none' }} as="div">
                <div className="ab-pillar" style={{ height: '100%' }}>
                  <div style={{ marginBottom: 18 }}>{icon}</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 12, lineHeight: 1.2 }}>{title}</div>
                  <div style={{ fontSize: 15, color: MUTED, lineHeight: 1.78 }}>{body}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      {/* ══ FOUNDER ═══════════════════════════════════════ */}
      <section style={{ background: BG_ALT, borderBottom: `1px solid ${BORDER}`, padding: '80px 28px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <Reveal>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, marginBottom: 14 }}>Our Founder</div>
          </Reveal>
          <style>{`@media(max-width:700px){.ab-founder-grid{grid-template-columns:1fr !important;gap:28px !important;}}`}</style>
          <Reveal delay={80}>
            <div className="ab-founder-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 56, alignItems: 'flex-start' }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', borderRadius: 3, overflow: 'hidden', borderLeft: `3px solid ${GOLD}` }}>
                <Image src="/girijaa-photo.png" alt="Girijaa Seshachala — Founder, Optimized Solutions" fill style={{ objectFit: 'cover', objectPosition: 'top' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Girijaa Seshachala</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
                  Founder · SAFe SPC · Leading Agilist · PMP · CSM
                </div>
                <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.8, marginBottom: 16 }}>
                  Girijaa is a Senior Agile Coach and SAFe Program Consultant with over 15 years of experience helping organizations navigate complex transformations — from federal government agencies to Fortune 500 enterprises across financial services, healthcare, and technology.
                </p>
                <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.8, marginBottom: 28 }}>
                  She founded Optimized Solutions to bridge the gap between certification and real-world implementation, bringing practitioner-grade insight to every training course and coaching engagement the firm delivers.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CERTS.map(c => (
                    <span key={c} style={{ fontSize: 12, fontWeight: 700, color: MUTED, border: `1px solid ${BORDER}`, background: BG, padding: '5px 12px', borderRadius: 20, letterSpacing: '0.04em' }}>{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>


      {/* ══ CTA ═══════════════════════════════════════════ */}
      <section style={{ background: BG_DARK, padding: '88px 28px', textAlign: 'center' }}>
        <Reveal>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#F7F4EF', margin: '0 0 16px' }}>
            Ready to transform —{' '}
            <em style={{ fontStyle: 'italic', color: '#C9B88A' }}>not just transition?</em>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(247,244,239,0.65)', margin: '0 auto 44px', maxWidth: 440 }}>
            The first conversation is a consultation, not a pitch.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/#contact" style={{ background: GOLD, color: '#fff', padding: '15px 36px', borderRadius: 4, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
              Schedule a Conversation
            </a>
            <a href="/quick-register" style={{ background: 'transparent', color: 'rgba(247,244,239,0.85)', padding: '15px 36px', borderRadius: 4, fontSize: 15, fontWeight: 700, textDecoration: 'none', border: '1.5px solid rgba(247,244,239,0.3)' }}>
              View Certifications
            </a>
          </div>
        </Reveal>
      </section>

    </main>
  );
}

/* ── Timeline entry (self-animating) ────────────────── */
function TlEntry({ year, title, desc, delay }) {
  const [ref, on] = useRevealInner();
  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        marginBottom: 52,
        opacity: on ? 1 : 0,
        transform: on ? 'translateX(0)' : 'translateX(-16px)',
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {/* Dot */}
      <div style={{ position: 'absolute', left: -40, top: 8, width: 9, height: 9, borderRadius: '50%', background: GOLD, border: `2px solid ${BG_ALT}`, boxShadow: `0 0 0 1px ${GOLD}` }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{year}</span>
      <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 6, fontFamily: 'Georgia, serif' }}>{title}</div>
      <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.72, maxWidth: 560, margin: 0 }}>{desc}</p>
    </div>
  );
}

function useRevealInner(threshold = 0.12) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setOn(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, on];
}
