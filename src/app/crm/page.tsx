import { PageHeader } from './page-header';
import { CalendarTimeline } from './calendar-timeline';
import { getCalendarMode } from './calendar-preferences';
import { getAppointments } from '@/services/appointments.service';
import { getClients } from '@/services/client.service';
import { getPets } from '@/services/pets.service';
import { createMockPendingAppointment } from '@/mocks/appointments';

export default async function CalendarPage() {
  const [appointments, clients, pets, mode] = await Promise.all([
    getAppointments(),
    getClients(),
    getPets(),
    getCalendarMode(),
  ]);
  const visibleAppointments = process.env.NODE_ENV === 'development'
    ? [...appointments, createMockPendingAppointment()]
    : appointments;

  return (
    <div className='-mx-4 flex h-[calc(100dvh-1rem)] flex-col gap-6 overflow-hidden sm:mx-0 lg:h-[calc(100dvh-5rem)]'>
      <div className='shrink-0 px-4 sm:px-0'>
        <PageHeader
          title='Календарь записей'
          actionLabel='Добавить запись'
          formType='appointment'
        />
      </div>
      <CalendarTimeline
        key={mode}
        mode={mode}
        appointments={visibleAppointments}
        clients={clients}
        pets={pets}
        initialDate={new Date().toISOString()}
      />
    </div>
  );
}
