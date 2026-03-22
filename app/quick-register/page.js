"use client";

import dynamic from 'next/dynamic';

// Disable SSR entirely — this page is fully client-side interactive and reads
// URL params via window.location. No server/client HTML mismatch possible.
const QuickRegisterClient = dynamic(() => import('./QuickRegisterClient'), { ssr: false });

export default function QuickRegisterPage() {
  return <QuickRegisterClient />;
}
