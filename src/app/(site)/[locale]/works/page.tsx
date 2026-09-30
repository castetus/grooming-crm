import { pageMetadata } from '@/lib/seo/site';
import { notFound } from 'next/navigation';

import { isLocale } from '@/lib/i18n/config';
import { siteLabels } from '@/lib/i18n/site';
import { PortfolioCaseCard } from '@/components/portfolio-case-card';
import { portfolioCases } from '@/mocks/portfolio-cases';
import { SitePageProps } from '../types';

export default async function Page({ params }: SitePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const cases = portfolioCases.filter((item) => item.isPublished)
    .sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1>{siteLabels[locale].works}</h1>
      <p className="mt-4 text-muted-foreground">{siteLabels[locale].portfolio.demoNotice}</p>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cases.map((item) => <PortfolioCaseCard key={item.id} item={item} locale={locale} />)}
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return pageMetadata(locale, 'works');
}
