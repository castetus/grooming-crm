import { notFound } from 'next/navigation';
import { getClientById } from '@/services/client.service';
import { getPetById } from '@/services/pets.service';
import { getGroomingServiceById } from '@/services/grooming-services.service';
import { getAppointmentById } from '@/services/appointments.service';
import { getAppointmentFormOptions } from '../appointment-actions';
import { getClientsForSelect } from '../pets/actions';
import { EntityFormPage } from './form-page';
import { searchValue, type EntityFormType, type FormSearchParams } from './routes';

export async function EntityRoutePage({ type, id, query }: { type: EntityFormType; id?: string; query: FormSearchParams }) {
  const client = type === 'client' && id ? await getClientById(id) : undefined;
  const pet = type === 'pet' && id ? await getPetById(id) : undefined;
  const groomingService = type === 'grooming-service' && id ? await getGroomingServiceById(id) : undefined;
  const appointment = type === 'appointment' && id ? await getAppointmentById(id) : undefined;
  if (id && !client && !pet && !groomingService && !appointment) notFound();
  const [options, clients] = await Promise.all([
    type === 'appointment' ? getAppointmentFormOptions() : undefined,
    type === 'pet' ? getClientsForSelect() : undefined,
  ]);
  const requestedClientId = searchValue(query, 'clientId');
  const selectedClient = options?.clients.find((item) => item.id === requestedClientId);
  const requestedPetId = searchValue(query, 'petId');
  const selectedPet = options?.pets.find((item) => item.id === requestedPetId);

  return <EntityFormPage
    key={`${type}-${id ?? 'new'}-${searchValue(query, 'clientId') ?? ''}-${requestedPetId ?? ''}`}
    type={type}
    client={client ?? undefined}
    pet={pet ?? undefined}
    groomingService={groomingService ?? undefined}
    appointment={appointment ?? undefined}
    initialOptions={options}
    clients={clients}
    appointmentDate={searchValue(query, 'date')}
    defaultClientId={selectedPet?.clientId ?? (type === 'appointment' ? selectedClient?.id : requestedClientId)}
    defaultPetId={selectedPet?.id}
    returnTo={searchValue(query, 'returnTo')}
  />;
}
