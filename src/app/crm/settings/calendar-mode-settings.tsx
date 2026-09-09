'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import type { CalendarMode } from '../calendar-preferences';
import { setCalendarMode } from './actions';

export function CalendarModeSettings({ mode }: { mode: CalendarMode }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function changeMode(next: CalendarMode) {
    setError('');
    startTransition(async () => {
      try {
        await setCalendarMode(next);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Не удалось сохранить настройку');
      }
    });
  }

  return (
    <section className="max-w-lg space-y-4 rounded-xl border bg-card p-4 sm:p-6">
      <h2 className="font-semibold">Вид календаря</h2>
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Вид календаря">
        <Button type="button" variant={mode === 'week' ? 'default' : 'outline'} aria-pressed={mode === 'week'} disabled={pending} onClick={() => changeMode('week')}>Неделя</Button>
        <Button type="button" variant={mode === 'month' ? 'default' : 'outline'} aria-pressed={mode === 'month'} disabled={pending} onClick={() => changeMode('month')}>Месяц</Button>
      </div>
      <p className="text-sm text-muted-foreground">Настройка сохраняется в этом браузере.</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </section>
  );
}
