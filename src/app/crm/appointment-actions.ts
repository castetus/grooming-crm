'use server';

import { createClientEntity, getClients } from '@/services/client.service';
import { getActiveGroomingServices } from '@/services/grooming-services.service';
import { addGroomingSessionPhotos } from '@/services/grooming-session-photos.service';
import { createPet, getPetById, getPets, updatePet } from '@/services/pets.service';
import {
  cancelAppointment,
  completeAppointment,
  confirmAppointment,
  createAppointment,
  getAppointmentById,
  type CreateAppointmentInput,
  restoreAppointment,
  updateAppointment,
} from '@/services/appointments.service';
import { revalidatePath } from 'next/cache';
import type { PetSex, PetSpecies } from '@/types/entities';
import { notifyGroomerAboutNewAppointment } from '@/lib/telegram/messages';

interface AppointmentRequestData {
  clientName: string | null;
  phone: string | null;
  telegramUsername: string | null;
  petName: string | null;
  species: PetSpecies | null;
  breed: string | null;
  sex: PetSex | null;
}

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

  try {
    await notifyGroomerAboutNewAppointment(appointment);
  } catch (error) {
    console.error('Telegram notification failed', error);
  }

  revalidatePath('/crm');

  return { appointmentId: appointment.id };
}

export async function updateAppointmentAction(id: string, formData: FormData) {
  await updateAppointment(id, { ...getAppointmentInput(formData), status: undefined });
  revalidatePath('/crm');
}

export async function resolvePendingAppointmentAction(id: string, formData: FormData) {
  const appointment = await getAppointmentById(id);

  if (!appointment || appointment.status !== 'pending') {
    throw new Error('Ожидающая запись не найдена');
  }

  const { clientId, petId } = await resolveAppointmentRelations(appointment, formData);
  formData.set('clientId', clientId);
  formData.set('petId', petId);
  await updateAppointment(id, getAppointmentInput(formData));

  revalidatePath('/crm');
  revalidatePath('/crm/clients');
  revalidatePath('/crm/pets');
}

export async function createAppointmentFromRequestAction(
  requestData: AppointmentRequestData,
  formData: FormData,
) {
  const { clientId, petId } = await resolveAppointmentRelations(requestData, formData);

  formData.set('clientId', clientId);
  formData.set('petId', petId);
  await createAppointment(getAppointmentInput(formData));

  revalidatePath('/crm');
  revalidatePath('/crm/clients');
  revalidatePath('/crm/pets');
}

async function resolveAppointmentRelations(
  requestData: AppointmentRequestData,
  formData: FormData,
) {
  const note = getString(formData, 'notes');
  let clientId = getString(formData, 'clientId');
  let petId = getString(formData, 'petId');

  if (petId) {
    const pet = await getPetById(petId);

    if (!pet) {
      throw new Error('Питомец не найден');
    }

    if (clientId && pet.clientId !== clientId) {
      throw new Error('Питомец не принадлежит выбранному клиенту');
    }

    clientId = pet.clientId;

    if (note && !pet.notes) {
      await updatePet(pet.id, { notes: note });
    }
  }

  if (!clientId) {
    if (!requestData.clientName) {
      throw new Error('В заявке не указано имя клиента');
    }

    const client = await createClientEntity({
      name: requestData.clientName,
      phone: requestData.phone,
      telegramUsername: requestData.telegramUsername,
    });

    clientId = client.id;
  }

  if (!petId) {
    if (!requestData.petName || !requestData.species || !requestData.sex) {
      throw new Error('В заявке недостаточно данных для создания питомца');
    }

    const pet = await createPet({
      clientId,
      name: requestData.petName,
      species: requestData.species,
      breed: requestData.breed,
      sex: requestData.sex,
      notes: note,
    });

    petId = pet.id;
  }

  return { clientId, petId };
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
  formData: FormData,
) {
  const totalPrice = getNumber(formData, 'totalPrice');

  if (totalPrice === null || totalPrice < 0) {
    throw new Error('Укажите итоговую стоимость');
  }

  const sessionId = await completeAppointment(id, {
    totalPrice,
    groomingDetails: getString(formData, 'groomingDetails'),
    notes: getString(formData, 'notes'),
  });
  const photos = getImages(formData, 'photos');

  if (photos.length) {
    await addGroomingSessionPhotos(sessionId, photos);
  }

  revalidatePath('/crm');
  revalidatePath('/crm/history');
}

function getImages(formData: FormData, name: string) {
  return formData.getAll(name).filter((value): value is File => {
    if (!(value instanceof File) || value.size === 0) {
      return false;
    }

    if (!value.type.startsWith('image/')) {
      throw new Error('Можно загружать только изображения');
    }

    return true;
  });
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
