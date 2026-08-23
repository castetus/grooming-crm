import { getAppointmentsByRange } from '@/services/appointments.service';
import { getClients } from '@/services/client.service';
import { getGroomingSessionsByRange } from '@/services/grooming-sessions.service';
import { getPets } from '@/services/pets.service';
import type { Appointment } from '@/types/entities';

import { HistoryList, type HistoryItem, type HistoryPreset } from './history-list';

type HistorySearchParams = {
  preset?: string;
  from?: string;
  to?: string;
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<HistorySearchParams>;
}) {
  const params = await searchParams;
  const preset = getPreset(params.preset);
  const range = getRange(preset, params, new Date());
  const [sessions, appointments, clients, pets] = await Promise.all([
    getGroomingSessionsByRange(range.fromIso, range.toIso),
    getAppointmentsByRange(range.fromIso, range.toIso),
    getClients(),
    getPets(),
  ]);
  const appointmentsById = new Map(
    appointments.map((appointment) => [appointment.id, appointment]),
  );
  const items: HistoryItem[] = [
    ...sessions.map((session) => ({
      id: session.id,
      petId: session.petId,
      performedAt: session.performedAt,
      totalPrice: session.totalPrice,
      durationMinutes: getAppointmentDuration(
        session.appointmentId ? appointmentsById.get(session.appointmentId) : undefined,
      ),
      status: 'completed' as const,
    })),
  ].sort(
    (first, second) =>
      new Date(second.performedAt).getTime() - new Date(first.performedAt).getTime(),
  );

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-semibold tracking-tight'>История записей</h1>
      <HistoryList
        key={`${preset}-${range.from}-${range.to}`}
        items={items}
        clients={clients}
        pets={pets}
        preset={preset}
        from={range.from}
        to={range.to}
      />
    </div>
  );
}

function getAppointmentDuration(appointment: Appointment | undefined) {
  return appointment
    ? getDurationMinutes(appointment.scheduledStart, appointment.scheduledEnd)
    : 0;
}

function getDurationMinutes(start: string, end: string) {
  return Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / 60_000);
}

function getPreset(value: string | undefined): HistoryPreset {
  if (
    value === 'today' ||
    value === 'tomorrow' ||
    value === 'last-month' ||
    value === 'last-week' ||
    value === 'last-year' ||
    value === 'all' ||
    value === 'custom'
  ) {
    return value;
  }

  return 'last-month';
}

function getRange(preset: HistoryPreset, params: HistorySearchParams, today: Date) {
  if (preset === 'custom' && isInputDate(params.from) && isInputDate(params.to)) {
    return createRange(params.from, params.to);
  }

  if (preset === 'all') {
    return createRange('2000-01-01', formatInputDate(today));
  }

  if (preset === 'tomorrow') {
    const tomorrow = formatInputDate(addDays(today, 1));

    return createRange(tomorrow, tomorrow);
  }

  const to = formatInputDate(today);

  if (preset === 'today') {
    return createRange(to, to);
  }

  if (preset === 'last-week') {
    return createRange(formatInputDate(addDays(today, -7)), to);
  }

  if (preset === 'last-year') {
    return createRange(formatInputDate(addYears(today, -1)), to);
  }

  return createRange(formatInputDate(addMonths(today, -1)), to);
}

function createRange(from: string, to: string) {
  const toExclusive = formatInputDate(addDays(new Date(`${to}T00:00:00`), 1));

  return {
    from,
    to,
    fromIso: new Date(`${from}T00:00:00`).toISOString(),
    toIso: new Date(`${toExclusive}T00:00:00`).toISOString(),
  };
}

function isInputDate(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);

  return result;
}

function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);

  return result;
}

function addYears(date: Date, years: number) {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);

  return result;
}

function formatInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
