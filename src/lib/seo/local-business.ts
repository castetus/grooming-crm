import type { Locale } from '@/lib/i18n/config';
import { businessName, pageUrl, siteUrl } from './site';

export function localBusinessJsonLd(locale: Locale) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#business`,
    name: businessName,
    url: pageUrl(locale),
    // TODO: Add the verified business address as PostalAddress.
    // TODO: Add the verified telephone number in international format.
    // TODO: Add verified openingHoursSpecification.
    // TODO: Add verified absolute image and logo URLs.
  }).replace(/</g, '\\u003c');
}
