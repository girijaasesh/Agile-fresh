'use client';
import dynamic from 'next/dynamic';

const AgileEdgeMVP = dynamic(() => import('../components/AgileEdgeMVP'), {
  ssr: false,
});

export default function Page() {
  return <AgileEdgeMVP />;
}