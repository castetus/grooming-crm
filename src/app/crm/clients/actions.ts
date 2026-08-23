'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { archiveClient, createClientEntity, updateClient } from '@/services/client.service';

export async function createClientAction(formData: FormData) {
  const name = getString(formData, 'name');

  if (!name) {
    throw new Error('Укажите имя клиента');
  }

  const preferredLanguage = getString(formData, 'preferredLanguage') === 'sr' ? 'sr' : 'ru';

  const client = await createClientEntity({
    name,
    phone: getString(formData, 'phone'),
    telegramUsername: getString(formData, 'telegramUsername'),
    preferredLanguage,
    address: getString(formData, 'address'),
    notes: getString(formData, 'notes'),
  });

  revalidatePath('/crm/clients');

  return { clientId: client.id };
}

export async function archiveClientAction(id: string) {
  await archiveClient(id);

  revalidatePath('/crm/clients');
  revalidatePath('/crm/pets');
  redirect('/crm/clients');
}

export async function updateClientAction(id: string, formData: FormData) {
  const name = getString(formData, 'name');

  if (!name) {
    throw new Error('Укажите имя клиента');
  }

  await updateClient(id, {
    name,
    phone: getString(formData, 'phone'),
    telegramUsername: getString(formData, 'telegramUsername'),
    preferredLanguage: getString(formData, 'preferredLanguage') === 'sr' ? 'sr' : 'ru',
    address: getString(formData, 'address'),
    notes: getString(formData, 'notes'),
  });

  revalidatePath('/crm/clients');
  revalidatePath(`/crm/clients/${id}`);
}

function getString(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === 'string' && value.trim() ? value.trim() : null;
}
