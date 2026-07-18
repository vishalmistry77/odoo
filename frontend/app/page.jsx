'use client';

import dynamic from 'next/dynamic';

const LegacyApp = dynamic(() => import('../src/NextApp'), { ssr: false });

export default function Page() {
  return <LegacyApp />;
}
