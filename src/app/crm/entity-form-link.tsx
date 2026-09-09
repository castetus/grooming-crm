import Link from 'next/link';
import { Add01Icon, Edit02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Appointment, Client, Pet, GroomingService } from '@/types/entities';
import { entityPaths, type EntityFormType } from './entity-form/routes';

export type { EntityFormType } from './entity-form/routes';

export function EntityFormLink({ type, actionLabel, mobile = false, className, client, pet, groomingService, appointment }: {
  type: EntityFormType;
  actionLabel: string;
  mobile?: boolean;
  className?: string;
  client?: Client;
  pet?: Pet;
  groomingService?: GroomingService;
  appointment?: Appointment;
}) {
  const id = appointment?.id ?? client?.id ?? pet?.id ?? groomingService?.id;
  const href = `${entityPaths[type]}/${id ? `${encodeURIComponent(id)}/edit` : 'new'}`;

  return (
    <Link href={href} className={cn(buttonVariants({ size: mobile ? 'icon' : 'lg', variant: mobile ? 'ghost' : 'default' }), className)} aria-label={actionLabel} title={actionLabel}>
      <HugeiconsIcon icon={id ? Edit02Icon : Add01Icon} strokeWidth={2} />
      {!mobile && actionLabel}
    </Link>
  );
}
