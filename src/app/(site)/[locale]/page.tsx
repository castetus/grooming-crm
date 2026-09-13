import { submitBooking } from '@/lib/booking/actions';
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { siteLabels } from '@/lib/i18n/site';
import { BookingForm } from '@/components/booking-form';
import { Card, CardContent } from '@/components/ui/card';
import { localBusinessJsonLd } from '@/lib/seo/local-business';
import { pageMetadata } from '@/lib/seo/site';
import styles from './page.module.css';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: localBusinessJsonLd(locale) }} />

        <Card className="mx-auto w-full max-w-2xl">
          <CardContent>
            <BookingForm submitAction={submitBooking} locale={locale} labels={siteLabels[locale].bookingForm} className="rounded-none border-0 bg-transparent p-0 sm:p-0" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return pageMetadata(locale, '');
}
