'use server';

import { getClients } from '@/services/client.service';
import { getActiveGroomingServices } from '@/services/grooming-services.service';
import { getPets } from '@/services/pets.service';

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
