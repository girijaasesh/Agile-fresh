'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BANNER_END = new Date('2026-05-15T23:59:59Z');
const NAV_H = 64;
const BANNER_H = 40;

const LINKS = [
  { label: 'Home',           href: '/' },
  { label: 'Certifications', href: '/quick-register' },
  { label: 'About',          href: '/about' },
  { label: 'Corporate',      href: '/#contact' },
  { label: 'Knowledge Hub',  href: '/articles' },
];

export default function GlobalHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  if (pathname?.startsWith('/admin')) return null;

  const showBanner = !bannerDismissed && new Date() < BANNER_END;
  const navTop = showBanner ? BANNER_H : 0;

  const isActive = (href) => {
    if (href.includes('#')) return false;
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <>
      <style>{`
        .gh-nav-links { display: flex; align-items: center; gap: 4px; }
        .gh-hamburger { display: none; }
        .gh-mobile-menu { display: none; }

        @keyframes gh-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.65); }
          70%  { box-shadow: 0 0 0 12px rgba(249, 115, 22, 0); }
          100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
        }
        @keyframes gh-ring {
          0%   { transform: rotate(0deg); }
          10%  { transform: rotate(-14deg); }
          20%  { transform: rotate(14deg); }
          30%  { transform: rotate(-9deg); }
          40%  { transform: rotate(9deg); }
          50%  { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes gh-flash {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.55; }
        }

        .gh-phone-btn {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 7px 16px 7px 8px;
          border: 2px solid #f97316; border-radius: 50px;
          text-decoration: none; margin-left: 10px;
          transition: background 0.2s;
        }
        .gh-phone-btn:hover { background: rgba(249,115,22,0.07); }
        .gh-phone-icon {
          background: #f97316; color: white;
          width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; flex-shrink: 0;
          animation: gh-pulse 1.8s ease-out infinite, gh-ring 2.5s ease-in-out infinite;
        }
        .gh-phone-num {
          font-size: 13px; font-weight: 700; color: #f97316;
          animation: gh-flash 1.8s ease-in-out infinite;
        }

        @media (max-width: 680px) {
          .gh-nav-links { display: none; }
          .gh-hamburger { display: flex; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 6px; }
          .gh-hamburger span { display: block; width: 22px; height: 2px; background: #111; border-radius: 2px; transition: all 0.2s; }
          .gh-mobile-menu {
            display: flex; flex-direction: column;
            position: fixed; top: ${navTop + NAV_H}px; left: 0; right: 0;
            background: rgba(250,250,248,0.98); backdrop-filter: blur(10px);
            border-bottom: 1px solid #DDD; padding: 12px 20px 20px;
            z-index: 199; gap: 2px;
          }
          .gh-mobile-menu a {
            padding: 12px 4px; font-size: 15px; font-weight: 600;
            color: #555; text-decoration: none;
            border-bottom: 1px solid #EEE;
          }
          .gh-mobile-menu a:last-child { border-bottom: none; }
          .gh-mobile-phone {
            display: flex; align-items: center; justify-content: center; gap: 10px;
            margin-top: 10px; border: 2px solid #f97316; border-radius: 50px;
            padding: 10px 18px; text-decoration: none; border-bottom: 2px solid #f97316 !important;
          }
          .gh-mobile-phone .gh-phone-icon { animation: gh-pulse 1.8s ease-out infinite, gh-ring 2.5s ease-in-out infinite; }
          .gh-mobile-phone .gh-phone-num { font-size: 15px; font-weight: 700; color: #f97316; animation: gh-flash 1.8s ease-in-out infinite; }
        }
      `}</style>

      {showBanner && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 201,
          height: BANNER_H, background: 'linear-gradient(90deg,#b5446e,#e8688a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 600, color: '#fff', gap: 10, padding: '0 40px',
        }}>
          <span>🌸</span>
          <span>Mother's Day Special — <strong>$50 off</strong> any certification! Use code</span>
          <span style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 4, padding: '2px 10px', fontFamily: 'monospace', letterSpacing: 1 }}>MOMDAY50</span>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>· Ends May 15</span>
          <button onClick={() => setBannerDismissed(true)} aria-label="Dismiss" style={{ position: 'absolute', right: 14, background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
      )}

      <nav style={{
        position: 'fixed', top: navTop, left: 0, right: 0, zIndex: 200,
        background: 'rgba(250,250,248,0.97)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #DDD', height: NAV_H,
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '0 20px',
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {/* Logo */}
          <Link href="/" style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#111', fontWeight: 700, textDecoration: 'none', letterSpacing: '-0.01em', flexShrink: 0 }}>
            Optimized Solutions
          </Link>

          {/* Desktop nav */}
          <div className="gh-nav-links">
            {LINKS.map(({ label, href }) => (
              <Link key={label} href={href} style={{
                padding: '7px 14px',
                fontSize: 14,
                fontWeight: 600,
                color: isActive(href) ? '#111' : '#555',
                textDecoration: 'none',
                borderBottom: isActive(href) ? '2px solid #111' : '2px solid transparent',
                transition: 'all 0.15s',
              }}>
                {label}
              </Link>
            ))}
            <Link href="/quick-register" style={{
              marginLeft: 12,
              background: 'transparent', color: '#111',
              padding: '8px 20px', fontSize: 13, fontWeight: 600,
              textDecoration: 'none', borderRadius: 3,
              border: '1.5px solid #111',
            }}>
              Quick Register
            </Link>
            <span className="gh-phone-btn">
              <span className="gh-phone-icon">📞</span>
              <span className="gh-phone-num">+12272921497</span>
            </span>
          </div>

          {/* Hamburger */}
          <button className="gh-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="gh-mobile-menu" onClick={() => setMenuOpen(false)}>
          {LINKS.map(({ label, href }) => (
            <Link key={label} href={href} style={{ color: isActive(href) ? '#111' : '#555' }}>
              {label}
            </Link>
          ))}
          <Link href="/quick-register" style={{ color: '#111', fontWeight: 700, border: '1.5px solid #111', borderRadius: 4, textAlign: 'center', padding: '12px 22px', marginTop: 4, borderBottom: 'none' }}>Quick Register</Link>
          <span className="gh-mobile-phone">
            <span className="gh-phone-icon">📞</span>
            <span className="gh-phone-num">+12272921497</span>
          </span>
        </div>
      )}
    </>
  );
}
