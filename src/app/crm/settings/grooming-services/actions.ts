'use server';

import { revalidatePath } from 'next/cache';

import {
  archiveGroomingService,
  createGroomingService,
  updateGroomingService,
} from '@/services/grooming-services.service';

export async function createGroomingServiceAction(formData: FormData) {
  const name = getString(formData, 'name');

  if (!name) {
    throw new Error('Укажите название услуги');
  }

  const service = await createGroomingService({
    name,
    description: getString(formData, 'description'),
    defaultPrice: getNumber(formData, 'defaultPrice'),
    defaultDurationMinutes: getNumber(formData, 'defaultDurationMinutes'),
    active: formData.get('active') === 'on',
  });

  revalidatePath('/crm/settings/grooming-services');

  return { serviceId: service.id };
}

export async function updateGroomingServiceAction(id: string, formData: FormData) {
  const name = getString(formData, 'name');

  if (!name) {
    throw new Error('Укажите название услуги');
  }

  await updateGroomingService(id, {
    name,
    description: getString(formData, 'description'),
    defaultPrice: getNumber(formData, 'defaultPrice'),
    defaultDurationMinutes: getNumber(formData, 'defaultDurationMinutes'),
    active: formData.get('active') === 'on',
  });

  revalidatePath('/crm/settings/grooming-services');
}

export async function archiveGroomingServiceAction(id: string) {
  await archiveGroomingService(id);
  revalidatePath('/crm/settings/grooming-services');
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
