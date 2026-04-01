'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_H = 64;

const LINKS = [
  { label: 'Home',           href: '/' },
  { label: 'Certifications', href: '/quick-register' },
  { label: 'Corporate',      href: '/#contact' },
  { label: 'Knowledge Hub',  href: '/articles' },
];

export default function GlobalHeader() {
  const pathname = usePathname();

  // Hide on admin pages
  if (pathname?.startsWith('/admin')) return null;

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href.split('#')[0]) && href !== '/';
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      background: 'rgba(250,250,248,0.97)', backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #DDD', height: NAV_H,
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 28px',
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        {/* Logo */}
        <Link href="/" style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#111', fontWeight: 700, textDecoration: 'none', letterSpacing: '-0.01em', flexShrink: 0 }}>
          Optimized Solutions
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {LINKS.map(({ label, href }) => (
            <Link key={label} href={href} style={{
              padding: '7px 14px',
              fontSize: 14,
              fontWeight: isActive(href) ? 700 : 500,
              color: isActive(href) ? '#111' : '#666',
              textDecoration: 'none',
              borderBottom: isActive(href) ? '2px solid #111' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
              {label}
            </Link>
          ))}
          <a href="/#contact" style={{
            marginLeft: 12,
            background: '#111', color: '#FAFAF8',
            padding: '9px 22px', fontSize: 13, fontWeight: 600,
            textDecoration: 'none', borderRadius: 3,
          }}>
            Let's Talk
          </a>
        </div>
      </div>
    </nav>
  );
}
