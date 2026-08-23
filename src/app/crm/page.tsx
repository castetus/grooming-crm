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
    <div className='-mx-4 space-y-6 sm:mx-0'>
      <div className='px-4 sm:px-0'>
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
