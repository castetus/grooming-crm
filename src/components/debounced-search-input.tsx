'use client';

import { Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

import { Input } from '@/components/ui/input';

export function DebouncedSearchInput({
  defaultValue,
  placeholder,
}: {
  defaultValue: string;
  placeholder: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams();

      if (query.trim()) {
        params.set('q', query.trim());
      }

      const search = params.toString();
      startTransition(() => router.replace(search ? `${pathname}?${search}` : pathname));
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [pathname, query, router]);

  return (
    <div className='relative max-w-xl'>
      <HugeiconsIcon
        icon={Search01Icon}
        className='pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground'
        strokeWidth={2}
      />
      <Input
        type='search'
        value={query}
        placeholder={placeholder}
        className='pl-9'
        aria-label={placeholder}
        aria-busy={isPending}
        onChange={(event) => setQuery(event.target.value)}
      />
    </div>
  );
}
