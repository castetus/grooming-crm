import type { ReactNode } from 'react';

import { CrmNavigation } from './navigation';

export default function CrmLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30 lg:grid lg:grid-cols-[256px_1fr]">
      <CrmNavigation />
      <main className="min-w-0 px-4 pb-8 pt-20 sm:px-6 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
