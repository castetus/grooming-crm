'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClientEntity, getClients } from '@/services/client.service';
import { setPetPhoto } from '@/services/media.service';
import { archivePet, createPet, updatePet } from '@/services/pets.service';

export async function getClientsForSelect() {
  const clients = await getClients();

  return clients.map(({ id, name, phone }) => ({ id, name, phone }));
}

export async function createPetAction(formData: FormData) {
  let clientId = getString(formData, 'clientId');

  if (!clientId) {
    const clientName = getString(formData, 'newClientName');

    if (!clientName) {
      throw new Error('Выберите клиента или создайте нового');
    }

    const client = await createClientEntity({
      name: clientName,
      phone: getString(formData, 'newClientPhone'),
      telegramUsername: getString(formData, 'newClientTelegramUsername'),
      preferredLanguage:
        getString(formData, 'newClientPreferredLanguage') === 'sr' ? 'sr' : 'ru',
      address: getString(formData, 'newClientAddress'),
      notes: getString(formData, 'newClientNotes'),
    });

    clientId = client.id;
  }

  const name = getString(formData, 'name');

  if (!name) {
    throw new Error('Укажите кличку питомца');
  }

  const pet = await createPet({
    clientId,
    name,
    species: getString(formData, 'species') === 'cat' ? 'cat' : 'dog',
    breed: getString(formData, 'breed'),
    birthDate: getString(formData, 'birthDate'),
    sex: getString(formData, 'sex') === 'female' ? 'female' : 'male',
    groomingPlan: getString(formData, 'groomingPlan'),
    recommendedIntervalDays: getNumber(formData, 'recommendedIntervalDays'),
    notes: getString(formData, 'notes'),
  });
  const photo = getImage(formData, 'photo');

  if (photo) {
    await setPetPhoto(pet.id, photo);
  }

  revalidatePath('/crm/clients');
  revalidatePath('/crm/pets');

  return { petId: pet.id };
}

export async function archivePetAction(id: string) {
  await archivePet(id);

  revalidatePath('/crm/pets');
  revalidatePath('/crm/clients');
  redirect('/crm/pets');
}

export async function updatePetAction(id: string, formData: FormData) {
  const name = getString(formData, 'name');

  if (!name) {
    throw new Error('Укажите кличку питомца');
  }

  await updatePet(id, {
    name,
    species: getString(formData, 'species') === 'cat' ? 'cat' : 'dog',
    breed: getString(formData, 'breed'),
    birthDate: getString(formData, 'birthDate'),
    sex: getString(formData, 'sex') === 'female' ? 'female' : 'male',
    groomingPlan: getString(formData, 'groomingPlan'),
    recommendedIntervalDays: getNumber(formData, 'recommendedIntervalDays'),
    notes: getString(formData, 'notes'),
  });
  const photo = getImage(formData, 'photo');

  if (photo) {
    await setPetPhoto(id, photo);
  }

  revalidatePath('/crm/pets');
  revalidatePath(`/crm/pets/${id}`);
  revalidatePath('/crm/clients');
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

function getImage(formData: FormData, name: string) {
  const value = formData.get(name);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  if (!value.type.startsWith('image/')) {
    throw new Error('Можно загружать только изображения');
  }

  return value;
}
