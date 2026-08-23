import { Add01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { Button } from '@/components/ui/button';

export function PageHeader({ title, actionLabel }: { title: string; actionLabel: string }) {
  return (
    <div className='flex items-center justify-between'>
      <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
      <Button type='button' size='lg' className='hidden lg:inline-flex'>
        <HugeiconsIcon icon={Add01Icon} data-icon='inline-start' strokeWidth={2} />
        {actionLabel}
      </Button>
    </div>
  );
}
