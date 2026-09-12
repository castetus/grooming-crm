import Link from 'next/link';

import type { Locale } from '@/lib/i18n/config';
import { siteLabels } from '@/lib/i18n/site';

export function SiteHeader({ locale }: { locale: Locale }) {
  const labels = siteLabels[locale];

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <nav aria-label={labels.navigation} className="flex flex-wrap items-center gap-4 text-sm">
          <Link href={`/${locale}`}>{labels.home}</Link>
          <Link href={`/${locale}/works`}>{labels.works}</Link>
          <Link href={`/${locale}/services`}>{labels.services}</Link>
          <Link href={`/${locale}/contacts`}>{labels.contacts}</Link>
          {/* <Link href="/">Главная</Link>
          <Link href="/crm">CRM</Link> */}
        </nav>
      </div>
    </header>
  );
}
