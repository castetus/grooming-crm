import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { isLocale, locales } from '@/lib/i18n/config';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function SiteLayout({ children, params }: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <SiteHeader locale={locale} />
      <div lang={locale} className="flex-1">{children}</div>
      <SiteFooter />
    </>
  );
}
