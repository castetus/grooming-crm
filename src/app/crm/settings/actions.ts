'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { calendarModeCookie, type CalendarMode } from '../calendar-preferences';

export async function setCalendarMode(mode: CalendarMode) {
  if (mode !== 'week' && mode !== 'month') {
    throw new Error('Неизвестный режим календаря');
  }

  (await cookies()).set(calendarModeCookie, mode, {
    path: '/crm',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  revalidatePath('/crm');
  revalidatePath('/crm/settings');
}
