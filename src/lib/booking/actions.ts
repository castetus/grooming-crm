'use server';

import type { BookingSubmissionState } from '@/components/booking-form/submission';
import { createPendingAppointment } from '@/services/appointments.service';
import { bookingInput } from './input';

export async function submitBooking(formData: FormData): Promise<BookingSubmissionState> {
  const input = bookingInput(formData);
  if (!input) return { status: 'invalid' };

  try {
    await createPendingAppointment(input);
    return { status: 'success' };
  } catch (error) {
    console.error('Website booking failed', error);
    return { status: 'error' };
  }
}
