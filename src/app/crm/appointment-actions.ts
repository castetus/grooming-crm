'use server';

import { getClients } from '@/services/client.service';
import { getPets } from '@/services/pets.service';

export async function getAppointmentFormOptions() {
  const [clients, pets] = await Promise.all([getClients(), getPets()]);

  return {
    clients: clients.map(({ id, name, phone }) => ({ id, name, phone })),
    pets: pets.map(({ id, clientId, name, breed }) => ({ id, clientId, name, breed })),
  };
}
