import { pageMetadata } from '@/lib/seo/site';
import { notFound } from 'next/navigation';

import { isLocale } from '@/lib/i18n/config';
import { siteLabels } from '@/lib/i18n/site';

export default async function Page({ params }: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const labels = siteLabels[locale];
  const address = 'Ђурђа Бранковића 24, Нови Сад 21101';
  const query = encodeURIComponent(`${address}, Србија`);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1>{labels.contacts}</h1>
      <section className="mt-6 space-y-4">
        <address className="not-italic">{address}</address>
        <iframe
          title={`${labels.mapTitle}: ${address}`}
          src={`https://maps.google.com/maps?q=${query}&hl=${locale}&z=16&output=embed`}
          className="h-80 w-full rounded-xl border md:h-[480px]"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${query}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center text-action hover:underline"
        >
          {labels.openInGoogleMaps}
        </a>
      </section>
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return pageMetadata(locale, 'contacts');
}
