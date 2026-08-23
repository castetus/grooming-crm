'use server';

import { getClients } from '@/services/client.service';
import { getActiveGroomingServices } from '@/services/grooming-services.service';
import { getPets } from '@/services/pets.service';
import {
  cancelAppointment,
  completeAppointment,
  confirmAppointment,
  createAppointment,
  type CreateAppointmentInput,
  restoreAppointment,
  updateAppointment,
} from '@/services/appointments.service';
import { revalidatePath } from 'next/cache';

export async function getAppointmentFormOptions() {
  const [clients, pets, services] = await Promise.all([
    getClients(),
    getPets(),
    getActiveGroomingServices(),
  ]);

  return {
    clients: clients.map(({ id, name, phone }) => ({ id, name, phone })),
    pets: pets.map(({ id, clientId, name, breed, notes }) => ({
      id,
      clientId,
      name,
      breed,
      notes,
    })),
    services: services.map(({ id, name, defaultPrice }) => ({ id, name, defaultPrice })),
  };
}

export async function createAppointmentAction(formData: FormData) {
  const input = getAppointmentInput(formData);
  const appointment = await createAppointment(input);

  revalidatePath('/crm');

  return { appointmentId: appointment.id };
}

export async function updateAppointmentAction(id: string, formData: FormData) {
  await updateAppointment(id, getAppointmentInput(formData));
  revalidatePath('/crm');
}

export async function confirmAppointmentAction(id: string) {
  await confirmAppointment(id);
  revalidatePath('/crm');
}

export async function cancelAppointmentAction(id: string) {
  await cancelAppointment(id);
  revalidatePath('/crm');
}

export async function restoreAppointmentAction(id: string) {
  await restoreAppointment(id);
  revalidatePath('/crm');
}

export async function completeAppointmentAction(
  id: string,
  totalPrice: number,
  notes: string | null,
) {
  await completeAppointment(id, { totalPrice, notes });
  revalidatePath('/crm');
}

function getAppointmentInput(formData: FormData): CreateAppointmentInput {
  const clientId = getString(formData, 'clientId');
  const petId = getString(formData, 'petId');
  const scheduledDate = getString(formData, 'scheduledDate');
  const scheduledStartTime = getString(formData, 'scheduledStartTime');
  const scheduledEndTime = getString(formData, 'scheduledEndTime');

  if (!clientId || !petId) {
    throw new Error('Выберите клиента и питомца');
  }

  if (!scheduledDate || !scheduledStartTime || !scheduledEndTime) {
    throw new Error('Укажите дату и время записи');
  }

  const scheduledStart = new Date(`${scheduledDate}T${scheduledStartTime}:00`);
  const scheduledEnd = new Date(`${scheduledDate}T${scheduledEndTime}:00`);

  if (scheduledEnd <= scheduledStart) {
    throw new Error('Время окончания должно быть позже времени начала');
  }

  const locationType = getString(formData, 'locationType') === 'mobile' ? 'mobile' : 'salon';
  const address = getString(formData, 'address');

  if (locationType === 'mobile' && !address) {
    throw new Error('Укажите адрес для выездной записи');
  }

  return {
    clientId,
    petId,
    scheduledStart: scheduledStart.toISOString(),
    scheduledEnd: scheduledEnd.toISOString(),
    locationType,
    address,
    estimatedPrice: getNumber(formData, 'estimatedPrice'),
    status: getAppointmentStatus(formData),
    notes: getString(formData, 'notes'),
  };
}

function getAppointmentStatus(formData: FormData) {
  const status = getString(formData, 'status');

  if (status === 'pending') {
    return status;
  }

  return 'confirmed';
}

function getString(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getNumber(formData: FormData, name: string) {
  const value = getString(formData, name);

  if (!value) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}
