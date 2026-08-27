import { PageHeader } from './page-header';
import { WeekCalendar } from './week-calendar';
import { getAppointments } from '@/services/appointments.service';
import { getClients } from '@/services/client.service';
import { getPets } from '@/services/pets.service';

export default async function CalendarPage() {
  const [appointments, clients, pets] = await Promise.all([
    getAppointments(),
    getClients(),
    getPets(),
  ]);

  return (
    <div className='-mx-4 flex h-[calc(100dvh-1rem)] flex-col gap-6 overflow-hidden sm:mx-0 lg:h-[calc(100dvh-5rem)]'>
      <div className='shrink-0 px-4 sm:px-0'>
        <PageHeader
          title='Календарь записей'
          actionLabel='Добавить запись'
          formType='appointment'
        />
      </div>
      <WeekCalendar
        appointments={appointments}
        clients={clients}
        pets={pets}
        initialDate={new Date().toISOString()}
      />
    </div>
  );
}
