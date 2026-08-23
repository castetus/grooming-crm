import { EntityFormSheet, type EntityFormType } from './entity-form-sheet';

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
      <EntityFormSheet
        type={formType}
        actionLabel={actionLabel}
        className='hidden lg:inline-flex'
      />
    </div>
  );
}
