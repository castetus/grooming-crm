import { pageMetadata } from '@/lib/seo/site';
import { notFound } from 'next/navigation';

import { isLocale } from '@/lib/i18n/config';
import { siteLabels } from '@/lib/i18n/site';

export default async function Page({ params }: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1>{siteLabels[locale].contacts}</h1>
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return pageMetadata(locale, 'contacts');
}
