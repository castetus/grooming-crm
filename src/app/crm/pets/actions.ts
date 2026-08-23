'use server';

import { getClients } from '@/services/client.service';
import { createClientEntity } from '@/services/client.service';
import { createPet } from '@/services/pets.service';
import { revalidatePath } from 'next/cache';

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

  revalidatePath('/crm/clients');
  revalidatePath('/crm/pets');

  return { petId: pet.id };
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
