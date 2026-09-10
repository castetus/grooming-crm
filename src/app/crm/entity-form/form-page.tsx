'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { Appointment, Client, GroomingService, Pet } from '@/types/entities';
import { createClientAction, updateClientAction } from '../clients/actions';
import { createPetAction, updatePetAction } from '../pets/actions';
import { createGroomingServiceAction, updateGroomingServiceAction } from '../settings/grooming-services/actions';
import { confirmAppointmentAction, createAppointmentAction, getAppointmentFormOptions, resolvePendingAppointmentAction, updateAppointmentAction } from '../appointment-actions';
import { AppointmentFields, type AppointmentFormOptions } from './appointment-form';
import { AppointmentActions } from './appointment-actions';
import { ClientFields, PetFields, GroomingServiceFields, type ClientOption } from './entity-fields';
import { entityPaths, safeReturnTo, type EntityFormType } from './routes';

export function EntityFormPage({ type, client, pet, groomingService, appointment, initialOptions, clients, appointmentDate, defaultClientId, defaultPetId, returnTo }: {
  type: EntityFormType;
  client?: Client;
  pet?: Pet;
  groomingService?: GroomingService;
  appointment?: Appointment;
  initialOptions?: AppointmentFormOptions;
  clients?: ClientOption[];
  appointmentDate?: string;
  defaultClientId?: string;
  defaultPetId?: string;
  returnTo?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const formId = useId();
  const [options, setOptions] = useState(initialOptions);
  const [clientId, setClientId] = useState(defaultClientId ?? appointment?.clientId ?? undefined);
  const [petId, setPetId] = useState(defaultPetId ?? appointment?.petId ?? undefined);
  const [pending, setPending] = useState(false);
  const [inlineFormOpen, setInlineFormOpen] = useState(false);
  const [error, setError] = useState('');
  const editing = Boolean(client || pet || groomingService || appointment);
  const titles = { appointment: 'запись', client: 'клиент', pet: 'питомец', 'grooming-service': 'услуга' };
  const backHref = safeReturnTo(returnTo) ?? (type === 'appointment' ? '/crm' : entityPaths[type]);

  function finish(id?: string) {
    const destination = safeReturnTo(returnTo);
    if (destination && id && (type === 'client' || type === 'pet')) {
      const url = new URL(destination, window.location.origin);
      url.searchParams.set(type === 'client' ? 'clientId' : 'petId', id);
      if (type === 'client') url.searchParams.delete('petId');
      if (type === 'pet' && clientId) url.searchParams.set('clientId', clientId);
      router.push(`${url.pathname}${url.search}`);
    } else {
      router.push(backHref);
    }
    router.refresh();
  }

  function openRelatedForm(entity: 'client' | 'pet', selectedClientId?: string) {
    const back = new URL(pathname, window.location.origin);
    if (appointmentDate) back.searchParams.set('date', appointmentDate);
    if (clientId) back.searchParams.set('clientId', clientId);
    if (petId) back.searchParams.set('petId', petId);
    if (safeReturnTo(returnTo)) back.searchParams.set('returnTo', returnTo ?? '');
    const query = new URLSearchParams({ returnTo: `${back.pathname}${back.search}` });
    if (selectedClientId) query.set('clientId', selectedClientId);
    router.push(`${entityPaths[entity]}/new?${query}`);
  }

  async function handleAction(formData: FormData) {
    setPending(true);
    setError('');
    try {
      let createdId: string | undefined;
      if (type === 'client') {
        if (client) await updateClientAction(client.id, formData);
        else createdId = (await createClientAction(formData)).clientId;
      } else if (type === 'pet') {
        if (pet) await updatePetAction(pet.id, formData);
        else createdId = (await createPetAction(formData)).petId;
      } else if (type === 'grooming-service') {
        if (groomingService) await updateGroomingServiceAction(groomingService.id, formData);
        else await createGroomingServiceAction(formData);
      } else if (!appointment) {
        await createAppointmentAction(formData);
      } else if (appointment.status === 'pending' && (!appointment.clientId || !appointment.petId)) {
        await resolvePendingAppointmentAction(appointment.id, formData);
      } else {
        await updateAppointmentAction(appointment.id, formData);
        if (appointment.status === 'pending') await confirmAppointmentAction(appointment.id);
      }
      finish(createdId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Не удалось сохранить данные');
    } finally {
      setPending(false);
    }
  }

  async function createInlineClient(data: FormData) {
    const result = await createClientAction(data);
    setClientId(result.clientId);
    setOptions(await getAppointmentFormOptions());
    return result.clientId;
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 pb-8 pt-4 lg:pt-0">
      <div className="flex items-center gap-3">
        <Link href={backHref} className={buttonVariants({ variant: 'outline', size: 'icon' })} aria-label="Назад" title="Назад">
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
        </Link>
        <h1 className="min-w-0 text-2xl font-semibold">{editing ? 'Редактирование' : 'Создание'}: {titles[type]}</h1>
      </div>
      <form action={handleAction} onSubmit={(event) => { if (inlineFormOpen) event.preventDefault(); }} autoComplete="off" className="space-y-6 rounded-xl border bg-card p-4 sm:p-6">
        <fieldset disabled={pending} className="min-w-0 space-y-5">
          {type === 'client' && <ClientFields formId={formId} client={client} />}
          {type === 'pet' && <PetFields formId={formId} clientId={pet?.clientId ?? clientId} clients={clients} pet={pet} onCreateClient={() => openRelatedForm('client')} />}
          {type === 'grooming-service' && <GroomingServiceFields formId={formId} service={groomingService} />}
          {type === 'appointment' && <AppointmentFields
            formId={formId}
            appointment={appointment}
            appointmentDate={appointmentDate}
            options={options}
            defaultClientId={defaultClientId}
            defaultPetId={defaultPetId}
            onCreateInlineClient={createInlineClient}
            onInlineFormChange={setInlineFormOpen}
            onClientSelected={setClientId}
            onPetSelected={setPetId}
            onInlinePetCreated={() => { void getAppointmentFormOptions().then(setOptions); }}
          />}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <fieldset disabled={inlineFormOpen}>
          {type === 'appointment' && appointment ? (
            <AppointmentActions appointment={appointment} onStatusChanged={() => finish()} />
          ) : <Button type="submit" className="w-full">{pending ? 'Сохранение...' : 'Сохранить'}</Button>}
          </fieldset>
        </fieldset>
      </form>
    </div>
  );
}
