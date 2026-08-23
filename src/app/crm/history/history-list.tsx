'use client';

import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';

import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Client, Pet } from '@/types/entities';

export type HistoryItem = {
  id: string;
  petId: string;
  performedAt: string;
  totalPrice: number;
  durationMinutes: number;
  status: 'completed' | 'cancelled';
};

export type HistoryPreset =
  | 'today'
  | 'tomorrow'
  | 'last-month'
  | 'last-week'
  | 'last-year'
  | 'all'
  | 'custom';

const presets: { value: Exclude<HistoryPreset, 'custom'>; label: string }[] = [
  { value: 'today', label: 'Сегодня' },
  { value: 'tomorrow', label: 'Завтра' },
  { value: 'last-month', label: 'Последний месяц' },
  { value: 'last-week', label: 'Последняя неделя' },
  { value: 'last-year', label: 'Последний год' },
  { value: 'all', label: 'Всё время' },
];

export function HistoryList({
  items,
  clients,
  pets,
  preset,
  from,
  to,
}: {
  items: HistoryItem[];
  clients: Client[];
  pets: Pet[];
  preset: HistoryPreset;
  from: string;
  to: string;
}) {
  const router = useRouter();
  const [showList, setShowList] = useState(false);
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);
  const [isPending, startTransition] = useTransition();
  const clientNames = useMemo(
    () => new Map(clients.map((client) => [client.id, client.name])),
    [clients],
  );
  const petsById = useMemo(() => new Map(pets.map((pet) => [pet.id, pet])), [pets]);
  const completedItems = items.filter((item) => item.status === 'completed');
  const totalMoney = completedItems.reduce((total, item) => total + item.totalPrice, 0);
  const totalMinutes = completedItems.reduce((total, item) => total + item.durationMinutes, 0);

  function navigate(query: string) {
    startTransition(() => router.push(`/crm/history?${query}`));
  }

  useEffect(() => {
    if (!customFrom || !customTo || customFrom > customTo) {
      return;
    }

    if (customFrom === from && customTo === to) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const query = new URLSearchParams({
        preset: 'custom',
        from: customFrom,
        to: customTo,
      }).toString();

      startTransition(() => router.push(`/crm/history?${query}`));
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [customFrom, customTo, from, router, to]);

  return (
    <>
      <details className='group rounded-2xl border bg-card'>
        <summary className='flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 sm:px-5'>
          <div>
            <p className='font-medium'>Период</p>
            <p className='text-sm text-muted-foreground'>{getRangeLabel(preset, from, to)}</p>
          </div>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className='size-5 transition-transform group-open:rotate-180'
            strokeWidth={2}
          />
        </summary>
        <div className='space-y-4 border-t p-4 sm:p-5'>
          <div className='flex flex-wrap gap-2'>
            {presets.map((option) => (
              <Button
                key={option.value}
                type='button'
                size='sm'
                variant={preset === option.value ? 'default' : 'outline'}
                disabled={isPending}
                onClick={() => navigate(`preset=${option.value}`)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className='grid gap-4 lg:grid-cols-2'>
            <DateField label='Дата от'>
              <DatePicker
                key={`from-${from}`}
                id='history-from'
                name='from'
                defaultValue={from}
                ariaLabel='Дата начала'
                onValueChange={setCustomFrom}
              />
            </DateField>
            <DateField label='Дата до'>
              <DatePicker
                key={`to-${to}`}
                id='history-to'
                name='to'
                defaultValue={to}
                futureYears={1}
                ariaLabel='Дата окончания'
                onValueChange={setCustomTo}
              />
            </DateField>
          </div>
        </div>
      </details>

      <div className='flex justify-end'>
        <Button type='button' variant='outline' onClick={() => setShowList(!showList)}>
          {showList ? 'Сводка' : 'Список записей'}
        </Button>
      </div>

      {!showList ? (
        <section className='grid gap-4 sm:grid-cols-3'>
          <SummaryCard label='Количество записей' value={String(items.length)} />
          <SummaryCard label='Общая сумма' value={formatMoney(totalMoney)} />
          <SummaryCard label='Затрачено времени' value={formatDuration(totalMinutes)} />
        </section>
      ) : (
        <section className='overflow-hidden rounded-2xl border bg-card'>
          <div className='border-b px-4 py-3 text-sm text-muted-foreground sm:px-5'>
            Найдено записей: {items.length}
          </div>
          {items.length === 0 ? (
          <div className='px-6 py-12 text-center text-sm text-muted-foreground'>
            За выбранный период записей нет.
          </div>
        ) : (
          <div className='divide-y'>
            {items.map((item) => {
              const pet = petsById.get(item.petId);

              return (
                <article
                  key={item.id}
                  className='grid gap-2 px-4 py-4 sm:grid-cols-[10rem_1fr_auto] sm:items-center sm:px-5'
                >
                  <div>
                    <p className='font-medium'>{formatDate(item.performedAt)}</p>
                    <p className='text-sm text-muted-foreground'>{formatTime(item.performedAt)}</p>
                  </div>
                  <div>
                    <p className='font-medium'>{pet?.name ?? 'Питомец'}</p>
                    <p className='text-sm text-muted-foreground'>
                      {pet ? (clientNames.get(pet.clientId) ?? 'Клиент') : 'Клиент'}
                    </p>
                  </div>
                  <div className='flex items-center gap-3 sm:justify-end'>
                    <span className={getStatusClassName(item.status)}>
                      {item.status === 'completed' ? 'Завершена' : 'Отменена'}
                    </span>
                    <span className='font-medium tabular-nums'>{formatPrice(item.totalPrice)}</span>
                  </div>
                </article>
              );
            })}
          </div>
          )}
        </section>
      )}
    </>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-sm text-muted-foreground'>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-3xl font-semibold tracking-tight tabular-nums'>{value}</p>
      </CardContent>
    </Card>
  );
}

function DateField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className='space-y-2 text-sm font-medium'>
      <span>{label}</span>
      {children}
    </label>
  );
}

function getRangeLabel(preset: HistoryPreset, from: string, to: string) {
  const presetLabel = presets.find((option) => option.value === preset)?.label;

  return presetLabel ?? `${formatShortDate(from)} — ${formatShortDate(to)}`;
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU').format(new Date(`${value}T00:00:00`));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('ru-RU').format(price);
}

function formatMoney(value: number) {
  return `${formatPrice(value)} дин.`;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  return `${hours} ч ${remainingMinutes} мин`;
}

function getStatusClassName(status: HistoryItem['status']) {
  return status === 'completed'
    ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
    : 'rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-800 dark:bg-rose-950/50 dark:text-rose-200';
}
