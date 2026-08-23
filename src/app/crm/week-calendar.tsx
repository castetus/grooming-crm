'use client';

import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Appointment, Client, Pet } from '@/types/entities';

import { EntityFormSheet } from './entity-form-sheet';

const hourWidth = 88;
const defaultStartHour = 8;
const defaultEndHour = 20;

export function WeekCalendar({
  appointments,
  clients,
  pets,
  initialDate,
}: {
  appointments: Appointment[];
  clients: Client[];
  pets: Pet[];
  initialDate: string;
}) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date(initialDate)));
  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment>();
  const clientNames = useMemo(
    () => new Map(clients.map((client) => [client.id, client.name])),
    [clients],
  );
  const petNames = useMemo(() => new Map(pets.map((pet) => [pet.id, pet.name])), [pets]);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const weekEnd = addDays(weekStart, 7);
  const weekAppointments = appointments.filter((appointment) => {
    const start = new Date(appointment.scheduledStart);

    return start >= weekStart && start < weekEnd;
  });
  const { startHour, endHour } = getVisibleHours(weekAppointments);
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, index) => startHour + index);
  const timelineWidth = (endHour - startHour) * hourWidth;

  return (
    <section className='overflow-hidden rounded-2xl border bg-card'>
      <div className='flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          aria-label='Предыдущая неделя'
          onClick={() => setWeekStart(addDays(weekStart, -7))}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
        </Button>
        <div className='text-center'>
          <p className='font-medium'>{formatWeekRange(weekStart, days[6])}</p>
          <p className='text-xs text-muted-foreground'>Неделя</p>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          aria-label='Следующая неделя'
          onClick={() => setWeekStart(addDays(weekStart, 7))}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
        </Button>
      </div>

      <div className='overflow-x-auto'>
        <div className='min-w-max'>
          <div className='flex h-12 items-end border-b text-xs text-muted-foreground'>
            <div className='sticky left-0 z-20 w-24 shrink-0 border-r bg-card px-4 sm:w-32' />
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
            const dayAppointments = weekAppointments.filter((appointment) =>
              isSameDay(new Date(appointment.scheduledStart), day),
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
                    setSelectedAppointment(undefined);
                    setSelectedDate(formatInputDate(day));
                  }}
                >
                  {dayAppointments.map((appointment) => {
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
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedDate(undefined);
                          setSelectedAppointment(appointment);
                        }}
                      >
                        <div className='flex items-center justify-between gap-2 text-xs font-medium'>
                          <p className='truncate'>
                            {formatTime(start)}–{formatTime(end)}
                          </p>
                          <p className='shrink-0'>{formatPrice(appointment.estimatedPrice)}</p>
                        </div>
                        <p className='mt-1 truncate text-sm'>
                          {petNames.get(appointment.petId) ?? 'Питомец'}
                        </p>
                        <p className='truncate text-xs opacity-70'>
                          {clientNames.get(appointment.clientId) ?? 'Клиент'}
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
      <EntityFormSheet
        type='appointment'
        actionLabel='Добавить запись'
        appointmentDate={
          selectedAppointment
            ? formatInputDate(new Date(selectedAppointment.scheduledStart))
            : selectedDate
        }
        appointment={selectedAppointment}
        open={Boolean(selectedDate || selectedAppointment)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDate(undefined);
            setSelectedAppointment(undefined);
          }
        }}
        hideTrigger
      />
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

function getAppointmentColor(status: Appointment['status']) {
  switch (status) {
    case 'completed':
      return 'border-emerald-600/20 bg-emerald-500 text-white';
    case 'cancelled':
      return 'border-rose-600/20 bg-rose-500 text-white';
    case 'pending':
      return 'border-amber-600/20 bg-amber-400 text-amber-950';
    default:
      return 'border-blue-600/20 bg-blue-500 text-white';
  }
}
