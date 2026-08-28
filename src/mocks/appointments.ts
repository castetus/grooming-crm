import type { Appointment } from '@/types/entities';

export function createMockPendingAppointment(referenceDate = new Date()): Appointment {
  const scheduledStart = new Date(referenceDate);
  scheduledStart.setHours(10, 0, 0, 0);

  const scheduledEnd = new Date(scheduledStart);
  scheduledEnd.setHours(11);

  return {
    id: `mock-pending-appointment-${scheduledStart.toISOString()}`,
    temporary: true,
    clientId: null,
    petId: null,
    clientName: 'Тестовый клиент из бота',
    phone: '+381 60 123 45 67',
    telegramUsername: '@test_grooming_client',
    petName: 'Боня',
    species: 'dog',
    breed: 'Померанский шпиц',
    sex: 'female',
    groomerId: null,
    scheduledStart: scheduledStart.toISOString(),
    scheduledEnd: scheduledEnd.toISOString(),
    locationType: 'salon',
    address: null,
    estimatedPrice: null,
    status: 'pending',
    notes: 'Тестовая запись из внешнего источника',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
