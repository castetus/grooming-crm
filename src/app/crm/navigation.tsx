'use client';

import {
  Calendar03Icon,
  Cancel01Icon,
  HistoryIcon,
  Menu01Icon,
  PawPrintIcon,
  Settings01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { EntityFormSheet, type EntityFormType } from './entity-form-sheet';

const navigationItems = [
  { label: 'Календарь', href: '/crm', icon: Calendar03Icon },
  { label: 'Клиенты', href: '/crm/clients', icon: UserGroupIcon },
  { label: 'Питомцы', href: '/crm/pets', icon: PawPrintIcon },
  { label: 'История', href: '/crm/history', icon: HistoryIcon },
  { label: 'Настройки', href: '/crm/settings', icon: Settings01Icon },
];

const mobileActions: { href: string; label: string; type: EntityFormType }[] = [
  { href: '/crm', label: 'Добавить запись', type: 'appointment' },
  { href: '/crm/clients', label: 'Добавить клиента', type: 'client' },
  { href: '/crm/pets', label: 'Добавить питомца', type: 'pet' },
  {
    href: '/crm/settings/grooming-services',
    label: 'Добавить услугу',
    type: 'grooming-service',
  },
];

export function CrmNavigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const mobileAction = mobileActions.find(({ href }) => pathname === href);

  return (
    <>
      <aside className="hidden border-r bg-sidebar lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:px-4 lg:py-6">
        <Link href="/" className="px-3 pb-6 text-lg font-semibold">
          Grooming CRM
        </Link>
        <NavigationLinks pathname={pathname} />
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:hidden">
        <Link href="/crm" className="font-semibold">
          Grooming CRM
        </Link>
        <div className="flex items-center gap-1">
          {mobileAction && (
            <EntityFormSheet
              type={mobileAction.type}
              actionLabel={mobileAction.label}
              mobile
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsOpen(!isOpen)}
          >
            <HugeiconsIcon icon={isOpen ? Cancel01Icon : Menu01Icon} strokeWidth={2} />
          </Button>
        </div>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            className="absolute inset-0 bg-foreground/20"
            aria-label="Закрыть меню"
            onClick={() => setIsOpen(false)}
          />
          <div
            id="mobile-navigation"
            className="absolute right-3 top-18 w-[calc(100%-1.5rem)] max-w-sm rounded-2xl border bg-popover p-2 text-popover-foreground shadow-xl"
          >
            <NavigationLinks pathname={pathname} onNavigate={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

function NavigationLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Основная навигация" className="flex flex-col gap-1">
      {navigationItems.map((item) => {
        const isActive =
          item.href === '/crm'
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            onClick={onNavigate}
            className={cn(
              'flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
            )}
          >
            <HugeiconsIcon icon={item.icon} className="size-5" strokeWidth={1.8} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
