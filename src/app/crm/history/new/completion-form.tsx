'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Input } from '@/components/ui/input';
import type { Appointment } from '@/types/entities';
import { completeAppointmentAction } from '../../appointment-actions';
import { FormField, Textarea } from '../../entity-form/form-controls';

export function CompletionForm({ appointment }: { appointment: Appointment }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleAction(data: FormData) {
    setPending(true);
    setError('');
    try {
      await completeAppointmentAction(appointment.id, data);
      router.push('/crm/history');
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Не удалось завершить груминг');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8 pt-18 lg:pt-0">
      <div className="flex items-center gap-3">
        <Link href={`/crm/appointments/${encodeURIComponent(appointment.id)}/edit`} className={buttonVariants({ variant: 'outline', size: 'icon' })} aria-label="Назад к записи" title="Назад к записи">
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
        </Link>
        <h1 className="min-w-0 text-2xl font-semibold">Завершение груминга</h1>
      </div>
      <form action={handleAction} className="rounded-xl border bg-card p-4 sm:p-6">
        <fieldset disabled={pending} className="space-y-5">
          <FormField id="completion-price" label="Итоговая стоимость" required><Input id="completion-price" name="totalPrice" type="number" min="0" step="0.01" defaultValue={appointment.estimatedPrice ?? ''} required /></FormField>
          <FormField id="completion-details" label="Что было сделано"><Textarea id="completion-details" name="groomingDetails" /></FormField>
          <FormField id="completion-notes" label="Заметки"><Textarea id="completion-notes" name="notes" defaultValue={appointment.notes ?? ''} /></FormField>
          <FormField id="completion-photos" label="Фотографии после груминга"><Input id="completion-photos" name="photos" type="file" accept="image/*" multiple /></FormField>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">{pending ? 'Завершение...' : 'Завершить'}</Button>
        </fieldset>
      </form>
    </div>
  );
}
