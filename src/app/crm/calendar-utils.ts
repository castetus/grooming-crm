import type { Appointment } from '@/types/entities';

export function getAppointmentColor(status: Appointment['status']) {
  switch (status) {
    case 'completed':
      return 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-100';
    case 'cancelled':
      return 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-100';
    case 'pending':
      return 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-100';
    default:
      return 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800/60 dark:bg-blue-950/50 dark:text-blue-100';
  }
}
