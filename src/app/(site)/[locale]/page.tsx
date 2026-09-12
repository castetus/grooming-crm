import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n/config';
import { localBusinessJsonLd } from '@/lib/seo/local-business';
import { pageMetadata } from '@/lib/seo/site';
import Image from 'next/image';
import styles from './page.module.css';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: localBusinessJsonLd(locale) }} />

      </main>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return pageMetadata(locale, '');
}
