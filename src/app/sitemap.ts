import type { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n/config';
import { languageAlternates, pageUrl, publicPages } from '@/lib/seo/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPages.flatMap((page) => locales.map((locale) => ({
    url: pageUrl(locale, page),
    alternates: { languages: languageAlternates(page) },
  })));
}
