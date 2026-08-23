import { CatalogueIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-semibold tracking-tight'>Настройки</h1>
      <Link
        href='/crm/settings/grooming-services'
        className={buttonVariants({ variant: 'outline', size: 'lg' })}
      >
        <HugeiconsIcon icon={CatalogueIcon} data-icon='inline-start' strokeWidth={2} />
        Справочник услуг
      </Link>
    </div>
  );
}
