'use client';

import { Dialog } from '@base-ui/react/dialog';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import type { Appointment } from '@/types/entities';

import {
  cancelAppointmentAction,
  restoreAppointmentAction,
} from '../appointment-actions';

type StatusAction = 'cancel' | 'restore';

const statusActionCopy: Record<StatusAction, { title: string; description: string; label: string }> = {
  cancel: { title: 'Отменить запись?', description: 'Запись будет отменена. Позже её можно будет восстановить.', label: 'Отменить' },
  restore: { title: 'Восстановить запись?', description: 'Запись снова получит статус «Подтверждена».', label: 'Восстановить' },
};

export function AppointmentActions({ appointment, onStatusChanged }: { appointment: Appointment; onStatusChanged: () => void }) {
  const [statusAction, setStatusAction] = useState<StatusAction>();
  const [isPending, startTransition] = useTransition();

  function applyStatusChange() {
    if (!statusAction) return;

    startTransition(async () => {
      if (statusAction === 'cancel') await cancelAppointmentAction(appointment.id);
      if (statusAction === 'restore') await restoreAppointmentAction(appointment.id);
      setStatusAction(undefined);
      onStatusChanged();
    });
  }

  if (appointment.status === 'completed') return null;

  return <>
    <div className='space-y-3 border-t pt-6'>
      {appointment.status !== 'pending' && <Button type="submit" className="w-full">Сохранить</Button>}
      {appointment.status === 'pending' && <div className='grid grid-cols-2 gap-3'><Button type='submit'>Подтвердить</Button><Button type='button' variant='destructive' onClick={() => setStatusAction('cancel')}>Отменить</Button></div>}
      {appointment.status === 'confirmed' && <div className='grid grid-cols-2 gap-3'><Link href={`/crm/history/new?appointmentId=${encodeURIComponent(appointment.id)}`} className={buttonVariants()}>Завершить</Link><Button type='button' variant='destructive' onClick={() => setStatusAction('cancel')}>Отменить</Button></div>}
      {appointment.status === 'cancelled' && <Button type='button' className='w-full' onClick={() => setStatusAction('restore')}>Восстановить</Button>}
    </div>
    <StatusConfirmationDialog action={statusAction} pending={isPending} onOpenChange={(open) => { if (!open && !isPending) setStatusAction(undefined); }} onConfirm={applyStatusChange} />
  </>;
}

function StatusConfirmationDialog({ action, pending, onOpenChange, onConfirm }: { action?: StatusAction; pending: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void }) {
  const copy = action ? statusActionCopy[action] : undefined;

  return <Dialog.Root open={Boolean(action)} onOpenChange={onOpenChange}><Dialog.Portal>
    <Dialog.Backdrop className='fixed inset-0 z-[60] bg-black/80 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0' />
    <Dialog.Popup className='fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-popover p-6 text-popover-foreground shadow-lg'><Dialog.Title className='text-base font-medium'>{copy?.title}</Dialog.Title><Dialog.Description className='mt-2 text-sm text-muted-foreground'>{copy?.description}</Dialog.Description><div className='mt-6 flex justify-end gap-3'><Dialog.Close disabled={pending} render={<Button type='button' variant='outline' />}>Назад</Dialog.Close><Button type='button' variant={action === 'cancel' ? 'destructive' : 'default'} disabled={pending} onClick={onConfirm}>{copy?.label}</Button></div></Dialog.Popup>
  </Dialog.Portal></Dialog.Root>;
}
