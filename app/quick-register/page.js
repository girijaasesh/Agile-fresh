import dynamic from 'next/dynamic';

const QuickRegisterClient = dynamic(() => import('./QuickRegisterClient'), { ssr: false });

export default function QuickRegisterPage() {
  return <QuickRegisterClient />;
}
