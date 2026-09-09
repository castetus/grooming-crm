import { cookies } from 'next/headers';

export type CalendarMode = 'week' | 'month';
export const calendarModeCookie = 'crm-calendar-mode';

export async function getCalendarMode(): Promise<CalendarMode> {
  return (await cookies()).get(calendarModeCookie)?.value === 'month' ? 'month' : 'week';
}
