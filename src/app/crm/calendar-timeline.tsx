'use client';

import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getAppointmentColor } from './calendar-utils';
import type { CalendarMode } from './calendar-preferences';
import type { Appointment, Client, Pet } from '@/types/entities';

import { useRouter } from 'next/navigation';

const hourWidth = 88;
const defaultStartHour = 8;
const defaultEndHour = 20;

export function CalendarTimeline({
  appointments,
  clients,
  pets,
  initialDate,
  mode,
}: {
  appointments: Appointment[];
  clients: Client[];
  pets: Pet[];
  initialDate: string;
  mode: CalendarMode;
}) {
  const [periodStart, setPeriodStart] = useState(() => {
    const date = new Date(initialDate);
    return mode === 'month'
      ? new Date(date.getFullYear(), date.getMonth(), 1)
      : getWeekStart(date);
  });
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const clientNames = useMemo(
    () => new Map(clients.map((client) => [client.id, client.name])),
    [clients],
  );
  const petNames = useMemo(() => new Map(pets.map((pet) => [pet.id, pet.name])), [pets]);
  const dayCount = mode === 'month'
    ? new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0).getDate()
    : 7;
  const days = Array.from({ length: dayCount }, (_, index) => addDays(periodStart, index));
  const periodEnd = addDays(periodStart, dayCount);
  const periodAppointments = appointments.filter((appointment) => {
    const start = new Date(appointment.scheduledStart);

    return start >= periodStart && start < periodEnd;
  });
  const { startHour, endHour } = getVisibleHours(periodAppointments);
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, index) => startHour + index);
  const timelineWidth = (endHour - startHour) * hourWidth;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = (12 - startHour) * hourWidth;
    }
  }, [startHour]);

  function changePeriod(direction: number) {
    setPeriodStart(mode === 'month'
      ? new Date(periodStart.getFullYear(), periodStart.getMonth() + direction, 1)
      : addDays(periodStart, direction * 7));
  }

  return (
    <section className='isolate flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card'>
      <div className='flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 sm:px-5'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          aria-label={mode === 'month' ? 'Предыдущий месяц' : 'Предыдущая неделя'}
          onClick={() => changePeriod(-1)}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
        </Button>
        <div className='text-center'>
          <p className="font-medium">{mode === 'month'
            ? periodStart.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
            : formatWeekRange(periodStart, days[6])}</p>
          <p className="text-xs text-muted-foreground">{mode === 'month' ? 'Месяц' : 'Неделя'}</p>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          aria-label={mode === 'month' ? 'Следующий месяц' : 'Следующая неделя'}
          onClick={() => changePeriod(1)}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
        </Button>
      </div>

      <div ref={scrollRef} className='min-h-0 flex-1 overflow-auto'>
        <div className='min-w-max'>
          <div className='sticky top-0 z-30 flex h-12 items-end border-b bg-card text-xs text-muted-foreground'>
            <div className='sticky left-0 z-40 w-24 shrink-0 border-r bg-card px-4 sm:w-32' />
            <div className='relative h-full' style={{ width: timelineWidth }}>
              {hours.map((hour) => (
                <span
                  key={hour}
                  className='absolute bottom-3 -translate-x-1/2 tabular-nums'
                  style={{ left: (hour - startHour) * hourWidth }}
                >
                  {String(hour).padStart(2, '0')}:00
                </span>
              ))}
            </div>
          </div>

          {days.map((day) => {
            const dayAppointments = periodAppointments.filter((appointment) =>
              isSameDay(new Date(appointment.scheduledStart), day),
            );

            if (dayAppointments.length === 0) {
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  className="block h-5 w-full border-b bg-muted last:border-b-0 hover:bg-muted/80"
                  aria-label={`Добавить запись: ${formatWeekday(day)}, ${formatDayDate(day)}`}
                  title={`${formatWeekday(day)}, ${formatDayDate(day)}`}
                  onClick={() => router.push(`/crm/appointments/new?date=${formatInputDate(day)}`)}
                />
              );
            }

            const layeredDayAppointments = [...dayAppointments].sort(
              (first, second) =>
                new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime(),
            );

            return (
              <div key={day.toISOString()} className='flex h-24 border-b last:border-b-0'>
                <div className='sticky left-0 z-20 flex w-24 shrink-0 flex-col justify-center border-r bg-card px-4 sm:w-32'>
                  <span className='text-sm font-medium capitalize'>{formatWeekday(day)}</span>
                  <span className='text-xs text-muted-foreground'>{formatDayDate(day)}</span>
                </div>
                <div
                  className='relative cursor-pointer'
                  style={{ width: timelineWidth }}
                  onClick={() => {
                    router.push(`/crm/appointments/new?date=${formatInputDate(day)}`);
                  }}
                >
                  {layeredDayAppointments.map((appointment, index) => {
                    const start = new Date(appointment.scheduledStart);
                    const end = new Date(appointment.scheduledEnd);
                    const startPosition = getHourValue(start) - startHour;
                    const duration = Math.max((end.getTime() - start.getTime()) / 3_600_000, 0.5);

                    return (
                      <button
                        key={appointment.id}
                        type='button'
                        className={cn(
                          'absolute top-3 h-[72px] overflow-hidden rounded-xl border px-3 py-2 text-left shadow-sm',
                          getAppointmentColor(appointment.status),
                        )}
                        style={{
                          left: startPosition * hourWidth,
                          width: Math.max(duration * hourWidth - 4, 76),
                          zIndex: appointment.status === 'cancelled' ? 0 : index + 1,
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          router.push(`/crm/appointments/${encodeURIComponent(appointment.id)}/edit`);
                        }}
                      >
                        <div className='flex items-center justify-between gap-2 text-xs font-medium'>
                          <p className='truncate'>
                            {formatTime(start)}–{formatTime(end)}
                          </p>
                          <p className='shrink-0'>{formatPrice(appointment.estimatedPrice)}</p>
                        </div>
                        <p className='mt-1 truncate text-sm'>
                          {appointment.petId
                            ? petNames.get(appointment.petId) ?? 'Питомец'
                            : appointment.petName ?? 'Питомец'}
                        </p>
                        <p className='truncate text-xs opacity-70'>
                          {appointment.clientId
                            ? clientNames.get(appointment.clientId) ?? 'Клиент'
                            : appointment.clientName ?? 'Клиент'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}

function getWeekStart(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const distanceToMonday = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + distanceToMonday);
  result.setHours(0, 0, 0, 0);

  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);

  return result;
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function getVisibleHours(appointments: Appointment[]) {
  const starts = appointments.map((appointment) => getHourValue(new Date(appointment.scheduledStart)));
  const ends = appointments.map((appointment) => getHourValue(new Date(appointment.scheduledEnd)));

  return {
    startHour: Math.max(0, Math.min(defaultStartHour, ...starts.map(Math.floor))),
    endHour: Math.min(24, Math.max(defaultEndHour, ...ends.map(Math.ceil))),
  };
}

function getHourValue(date: Date) {
  return date.getHours() + date.getMinutes() / 60;
}

function formatWeekRange(start: Date, end: Date) {
  const startText = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(start);
  const endText = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(end);

  return `${startText} — ${endText}`;
}

function formatWeekday(date: Date) {
  return new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(date);
}

function formatDayDate(date: Date) {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatPrice(price: number | null) {
  return price === null ? '—' : new Intl.NumberFormat('ru-RU').format(price);
}

function formatInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
