import { Button } from '@/components/ui/button';

import { EntityFormSheet, type EntityFormType } from './entity-form-sheet';
import { sendTestGroomerMessageAction } from './telegram-actions';

export function PageHeader({
  title,
  actionLabel,
  formType,
}: {
  title: string;
  actionLabel: string;
  formType: EntityFormType;
}) {
  return (
    <div className='flex items-center justify-between'>
      <h1 className='text-2xl font-semibold tracking-tight'>{title}</h1>
      <div className="flex items-center gap-2">
        <form action={sendTestGroomerMessageAction}>
          <Button type="submit" variant="outline">
            Тест Telegram
          </Button>
        </form>
        <EntityFormSheet
          type={formType}
          actionLabel={actionLabel}
          className='hidden lg:inline-flex'
        />
      </div>
    </div>
  );
}
