'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ClientFields, PetFields } from './entity-fields';

export function InlineEntityForm({ type, formId, clientId, onSave, onCancel }: {
  type: 'client' | 'pet';
  formId: string;
  clientId?: string;
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLFieldSetElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    const fieldset = ref.current;
    const form = fieldset?.form;
    if (!fieldset || !form || pending) return;

    for (const control of fieldset.querySelectorAll('input, select, textarea')) {
      if ((control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement) && !control.reportValidity()) return;
    }

    const prefix = type === 'client' ? 'newClient' : 'newPet';
    const data = new FormData();
    for (const [name, value] of new FormData(form)) {
      if (name.startsWith(prefix)) {
        const key = name.slice(prefix.length);
        data.append(key.charAt(0).toLowerCase() + key.slice(1), value);
      }
    }

    setPending(true);
    setError('');
    try {
      await onSave(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Не удалось сохранить данные');
    } finally {
      setPending(false);
    }
  }

  return (
    <fieldset
      ref={ref}
      disabled={pending}
      className="min-w-0 space-y-4 rounded-xl border bg-muted/30 p-4"
      onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
          event.preventDefault();
          void save();
        }
      }}
    >
      <p className="font-medium">{type === 'client' ? 'Новый клиент' : 'Новый питомец'}</p>
      {type === 'client'
        ? <ClientFields formId={formId} embedded />
        : <PetFields formId={formId} clientId={clientId} hideClientSelection embedded />}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" className="flex-1" onClick={() => void save()}>{pending ? 'Сохранение...' : 'Создать'}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Отмена</Button>
      </div>
    </fieldset>
  );
}
