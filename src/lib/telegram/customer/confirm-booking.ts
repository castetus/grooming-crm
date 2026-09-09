import { BookingSession } from './types';
import { createPendingAppointment } from '@/services/appointments.service';

export async function confirmBooking(session: BookingSession) {
  const start = new Date();

  start.setDate(start.getDate() + 1);
  start.setHours(11, 0, 0, 0);

  const end = new Date(start);
  end.setHours(14, 0, 0, 0);

  await createPendingAppointment({
    clientId: undefined,
    petId: undefined,
    clientName: session.data.clientName ?? undefined,
    phone: session.data.phone ?? undefined,
    telegramUsername: session.data.telegramUsername ?? undefined,
    telegramUserId: session.telegram_user_id,
    petName: session.data.petName ?? undefined,
    species: session.data.species === 'dog' || session.data.species === 'cat'
      ? session.data.species
      : undefined,
    breed: session.data.breed ?? undefined,
    sex: session.data.sex === 'male' || session.data.sex === 'female'
      ? session.data.sex
      : undefined,
    scheduledStart: start.toISOString(),
    scheduledEnd: end.toISOString(),
    locationType: session.data.locationType === 'mobile' ? 'mobile' : 'salon',
    address: undefined,
    estimatedPrice: undefined,
    status: 'pending',
    notes: [
      `Желаемые дата и время: ${session.data.requestedDateTime}`,
      session.data.notes,
    ]
      .filter(Boolean)
      .join('\n'),
  });
}
