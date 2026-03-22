'use client';
import { Suspense } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RegisterRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const queryString = searchParams.toString();
    if (queryString) {
      router.push(`/?${queryString}`);
    } else {
      router.push('/');
    }
  }, [searchParams, router]);

  return null;
}

export default function RegisterPage() {
  return (
    <div style={{ paddingTop: '100px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 18, color: '#64748B' }}>Loading registration...⏳</div>
      <Suspense>
        <RegisterRedirect />
      </Suspense>
    </div>
  );
}
