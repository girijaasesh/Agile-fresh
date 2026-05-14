'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const BG_FOUND = '#1A3832';
const GOLD     = '#C9973A';
const CREAM    = '#F7F4EF';
const BORDER   = '#C8C4BC';

export default function FounderStrip() {
  const copyRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = copyRef.current;
    if (!el || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @media (max-width: 700px) {
          .fs-inner { grid-template-columns: 1fr !important; gap: 32px !important; }
          .fs-photo-wrap { max-width: 220px !important; }
        }
      `}</style>

      <section style={{ background: BG_FOUND, padding: '80px 28px', position: 'relative', overflow: 'hidden' }}>
        <div
          className="fs-inner"
          style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '300px 1fr', gap: 72, alignItems: 'center' }}
        >
          {/* Photo */}
          <div className="fs-photo-wrap" style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: -10, left: 0, width: 48, height: 3, background: GOLD, borderRadius: 2 }} />
            <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', borderRadius: 3, overflow: 'hidden' }}>
              <Image
                src="/girijaa-photo.png"
                alt="Girijaa Seshachala — Founder &amp; Lead Consultant"
                fill
                style={{ objectFit: 'cover', objectPosition: 'top', filter: 'contrast(1.04) saturate(0.92)' }}
              />
            </div>
          </div>

          {/* Copy */}
          <div
            ref={copyRef}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(28px)',
              transition: 'opacity 0.85s cubic-bezier(0.16,1,0.3,1), transform 0.85s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, marginBottom: 22 }}>
              Founder &amp; Lead Consultant
            </div>

            <h2 style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(26px, 3.2vw, 42px)',
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              color: CREAM,
              margin: '0 0 28px',
            }}>
              "I've seen transformation fail —{' '}
              <em style={{ fontStyle: 'italic', color: '#C9B88A' }}>and I know exactly why."</em>
            </h2>

            <div style={{ width: 40, height: 1, background: 'rgba(201,151,58,0.35)', marginBottom: 22 }} />

            <p style={{ fontSize: 16, lineHeight: 1.82, color: 'rgba(247,244,239,0.76)', maxWidth: 520, marginBottom: 36 }}>
              After guiding enterprises through Agile transformations across industries, I founded Optimized Solutions with one conviction: most transformations stall not because of bad frameworks — but because of misaligned strategy, siloed execution, and governance that was never designed for flow. I built this to fix that. Every engagement I lead is hands-on, outcome-obsessed, and built around your reality — not a textbook case study.
            </p>

            <a
              href="/about"
              style={{ fontSize: 15, fontWeight: 700, color: GOLD, textDecoration: 'none', borderBottom: `1px solid rgba(201,151,58,0.38)`, paddingBottom: 2 }}
            >
              Read our full story →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
