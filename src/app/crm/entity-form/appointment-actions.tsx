'use client';

import { Dialog } from '@base-ui/react/dialog';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Appointment } from '@/types/entities';

import {
  cancelAppointmentAction,
  completeAppointmentAction,
  restoreAppointmentAction,
} from '../appointment-actions';
import { FormField, Textarea } from './form-controls';

type StatusAction = 'cancel' | 'restore';

const statusActionCopy: Record<StatusAction, { title: string; description: string; label: string }> = {
  cancel: { title: 'Отменить запись?', description: 'Запись будет отменена. Позже её можно будет восстановить.', label: 'Отменить' },
  restore: { title: 'Восстановить запись?', description: 'Запись снова получит статус «Подтверждена».', label: 'Восстановить' },
};

export function AppointmentActions({ appointment, onStatusChanged }: { appointment: Appointment; onStatusChanged: () => void }) {
  const [statusAction, setStatusAction] = useState<StatusAction>();
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
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
    <div className='border-t p-6'>
      {appointment.status === 'pending' && <div className='grid grid-cols-2 gap-3'><Button type='submit'>Подтвердить</Button><Button type='button' variant='destructive' onClick={() => setStatusAction('cancel')}>Отменить</Button></div>}
      {appointment.status === 'confirmed' && <div className='grid grid-cols-2 gap-3'><Button type='button' onClick={() => setIsCompletionOpen(true)}>Завершить</Button><Button type='button' variant='destructive' onClick={() => setStatusAction('cancel')}>Отменить</Button></div>}
      {appointment.status === 'cancelled' && <Button type='button' className='w-full' onClick={() => setStatusAction('restore')}>Восстановить</Button>}
    </div>
    <StatusConfirmationDialog action={statusAction} pending={isPending} onOpenChange={(open) => { if (!open && !isPending) setStatusAction(undefined); }} onConfirm={applyStatusChange} />
    <CompleteAppointmentDialog appointment={appointment} open={isCompletionOpen} onOpenChange={setIsCompletionOpen} onCompleted={onStatusChanged} />
  </>;
}

function CompleteAppointmentDialog({ appointment, open, onOpenChange, onCompleted }: { appointment: Appointment; open: boolean; onOpenChange: (open: boolean) => void; onCompleted: () => void }) {
  const [isPending, setIsPending] = useState(false);

  async function handleAction(formData: FormData) {
    setIsPending(true);
    try {
      await completeAppointmentAction(appointment.id, formData);
      onOpenChange(false);
      onCompleted();
    } finally {
      setIsPending(false);
    }
  }

  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal>
    <Dialog.Backdrop className='fixed inset-0 z-[60] bg-black/80 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0' />
    <Dialog.Popup className='fixed left-1/2 top-1/2 z-[60] max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-popover p-6 text-popover-foreground shadow-lg'>
      <Dialog.Title className='text-base font-medium'>Завершение груминга</Dialog.Title><Dialog.Description className='mt-2 text-sm text-muted-foreground'>Заполните результаты и добавьте фотографии после груминга.</Dialog.Description>
      <form action={handleAction} className='mt-6 space-y-5'>
        <FormField id='completion-price' label='Итоговая стоимость' required><Input id='completion-price' name='totalPrice' type='number' min='0' step='0.01' defaultValue={appointment.estimatedPrice ?? ''} required /></FormField>
        <FormField id='completion-details' label='Что было сделано'><Textarea id='completion-details' name='groomingDetails' /></FormField>
        <FormField id='completion-notes' label='Заметки'><Textarea id='completion-notes' name='notes' defaultValue={appointment.notes ?? ''} /></FormField>
        <FormField id='completion-photos' label='Фотографии после груминга'><Input id='completion-photos' name='photos' type='file' accept='image/*' multiple /></FormField>
        <div className='flex justify-end gap-3 pt-1'><Dialog.Close disabled={isPending} render={<Button type='button' variant='outline' />}>Назад</Dialog.Close><Button type='submit' disabled={isPending}>{isPending ? 'Завершение...' : 'Завершить'}</Button></div>
      </form>
    </Dialog.Popup>
  </Dialog.Portal></Dialog.Root>;
}

function StatusConfirmationDialog({ action, pending, onOpenChange, onConfirm }: { action?: StatusAction; pending: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void }) {
  const copy = action ? statusActionCopy[action] : undefined;

  return <Dialog.Root open={Boolean(action)} onOpenChange={onOpenChange}><Dialog.Portal>
    <Dialog.Backdrop className='fixed inset-0 z-[60] bg-black/80 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0' />
    <Dialog.Popup className='fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-popover p-6 text-popover-foreground shadow-lg'><Dialog.Title className='text-base font-medium'>{copy?.title}</Dialog.Title><Dialog.Description className='mt-2 text-sm text-muted-foreground'>{copy?.description}</Dialog.Description><div className='mt-6 flex justify-end gap-3'><Dialog.Close disabled={pending} render={<Button type='button' variant='outline' />}>Назад</Dialog.Close><Button type='button' variant={action === 'cancel' ? 'destructive' : 'default'} disabled={pending} onClick={onConfirm}>{copy?.label}</Button></div></Dialog.Popup>
  </Dialog.Portal></Dialog.Root>;
}
