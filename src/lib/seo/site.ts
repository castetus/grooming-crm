import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';

export const siteUrl = 'https://grooming-ns.rs';
export const businessName = 'Франц и Феня';
export const publicPages = ['', 'works', 'services', 'contacts'];

const content = {
  ru: {
    '': { title: 'Франц и Феня — груминг собак и кошек', description: 'Груминг собак и кошек в «Франц и Феня». Познакомьтесь с нашими работами, услугами и контактами.' },
    works: { title: 'Наши работы — Франц и Феня', description: 'Работы груминг-салона «Франц и Феня»: уход за собаками и кошками. Раздел с примерами наших работ.' },
    services: { title: 'Услуги груминга — Франц и Феня', description: 'Услуги «Франц и Феня» по уходу за собаками и кошками. Узнайте о груминге и свяжитесь с нами для уточнения деталей.' },
    contacts: { title: 'Контакты — Франц и Феня', description: 'Контакты груминг-салона «Франц и Феня». Свяжитесь с нами по вопросам ухода за питомцем и записи на груминг.' },
  },
  sr: {
    '': { title: 'Франц и Феня — nega pasa i mačaka', description: 'Nega pasa i mačaka u salonu «Франц и Феня». Upoznajte naše radove, usluge i informacije za kontakt.' },
    works: { title: 'Naši radovi — Франц и Феня', description: 'Radovi salona «Франц и Феня»: nega pasa i mačaka. Pogledajte odeljak sa primerima naših radova.' },
    services: { title: 'Usluge nege ljubimaca — Франц и Феня', description: 'Usluge salona «Франц и Феня» za negu pasa i mačaka. Saznajte više o nezi i kontaktirajte nas za detalje.' },
    contacts: { title: 'Kontakt — Франц и Феня', description: 'Kontakt salona «Франц и Феня». Obratite nam se za pitanja o nezi ljubimaca i zakazivanju termina.' },
  },
};

export type PublicPage = keyof typeof content.ru;

export function pageUrl(locale: Locale, page: string = '') {
  return `${siteUrl}/${locale}${page ? `/${page}` : ''}`;
}

export function languageAlternates(page: string = '') {
  return { ru: pageUrl('ru', page), sr: pageUrl('sr', page) };
}

export function pageMetadata(locale: Locale, page: PublicPage): Metadata {
  const { title, description } = content[locale][page];
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: { canonical: pageUrl(locale, page), languages: languageAlternates(page) },
    openGraph: {
      type: 'website',
      title,
      description,
      url: pageUrl(locale, page),
      siteName: businessName,
      locale: locale === 'ru' ? 'ru_RU' : 'sr_RS',
      alternateLocale: locale === 'ru' ? 'sr_RS' : 'ru_RU',
      // TODO: Add verified Open Graph images with absolute URLs, dimensions and alt text.
    },
  };
}
