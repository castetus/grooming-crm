'use client';

import { Cancel01Icon, Menu01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { defaultLocale, locales, type Locale } from '@/lib/i18n/config';
import { siteLabels } from '@/lib/i18n/site';

export function SiteHeader({ locale = defaultLocale }: { locale?: Locale }) {
  const labels = siteLabels[locale];
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { href: `/${locale}`, label: labels.home },
    { href: `/${locale}/works`, label: labels.works },
    { href: `/${locale}/services`, label: labels.services },
    { href: `/${locale}/contacts`, label: labels.contacts },
  ];

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <nav aria-label={labels.navigation} className="hidden items-center gap-4 text-sm md:flex">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined} className="hover:underline aria-[current=page]:font-semibold">
              {label}
            </Link>
          ))}
          {/* <Link href="/">Главная</Link>
          <Link href="/crm">CRM</Link> */}
        </nav>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon-lg" className="md:hidden" aria-label={labels.openMenu} />}>
            <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
          </SheetTrigger>
          <SheetContent side="left" showCloseButton={false}>
            <SheetHeader>
              <SheetTitle className="pr-10">{labels.navigation}</SheetTitle>
            </SheetHeader>
            <SheetClose render={<Button variant="ghost" size="icon-lg" className="absolute top-3 right-3" aria-label={labels.closeMenu} />}>
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
            </SheetClose>
            <nav aria-label={labels.navigation} className="flex flex-col gap-2 px-4 pb-6">
              {links.map(({ href, label }) => (
                <Link key={href} href={href} onClick={() => setMenuOpen(false)} aria-current={pathname === href ? 'page' : undefined} className="rounded-lg px-3 py-3 hover:bg-muted aria-[current=page]:bg-muted aria-[current=page]:font-semibold">
                  {label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <select
          aria-label={labels.language}
          value={locale}
          onChange={(event) => {
            setMenuOpen(false);
            router.push(`/${event.target.value}${pathname.slice(locale.length + 1)}`);
          }}
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {locales.map((language) => (
            <option key={language} value={language} lang={language}>
              {language.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
