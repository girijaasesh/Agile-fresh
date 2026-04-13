'use client';

import { useEffect, useRef } from 'react';
import { SessionProvider, useSession, signOut } from 'next-auth/react';

const INACTIVITY_MS = 60 * 60 * 1000; // 1 hour

function InactivityLogout() {
  const { data: session } = useSession();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!session) return;

    const reset = () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        signOut({ callbackUrl: '/' });
      }, INACTIVITY_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset(); // start the timer immediately

    return () => {
      clearTimeout(timerRef.current);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  }, [session]);

  return null;
}

export default function Providers({ children }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <InactivityLogout />
      {children}
    </SessionProvider>
  );
}