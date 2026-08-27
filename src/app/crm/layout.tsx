import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { createClient } from '@/lib/supabase/server';

import { CrmNavigation } from './navigation';

export default async function CrmLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-muted/30 lg:grid lg:grid-cols-[256px_1fr]">
      <CrmNavigation />
      <main className="min-w-0 px-4 py-2 sm:px-6 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
