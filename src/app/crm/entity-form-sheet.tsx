'use client';

import {
  Add01Icon,
  Edit02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { Appointment, Client, GroomingService, Pet } from '@/types/entities';
import { AppointmentActions } from './entity-form/appointment-actions';
import {
  AppointmentFields,
  type AppointmentFormOptions,
} from './entity-form/appointment-form';
import {
  ClientFields,
  GroomingServiceFields,
  PetFields,
} from './entity-form/entity-fields';

import {
  confirmAppointmentAction,
  createAppointmentFromRequestAction,
  createAppointmentAction,
  getAppointmentFormOptions,
  resolvePendingAppointmentAction,
  updateAppointmentAction,
} from './appointment-actions';
import { createClientAction, updateClientAction } from './clients/actions';
import { createPetAction, getClientsForSelect, updatePetAction } from './pets/actions';
import {
  createGroomingServiceAction,
  updateGroomingServiceAction,
} from './settings/grooming-services/actions';

type ClientOption = Awaited<ReturnType<typeof getClientsForSelect>>[number];

export type EntityFormType = 'appointment' | 'client' | 'pet' | 'grooming-service';

const formCopy: Record<EntityFormType, { title: string; description: string }> = {
  appointment: {
    title: 'Новая запись',
    description: 'Заполните данные о записи на груминг.',
  },
  client: {
    title: 'Новый клиент',
    description: 'Добавьте контактные данные клиента.',
  },
  pet: {
    title: 'Новый питомец',
    description: 'Добавьте данные питомца и рекомендации по уходу.',
  },
  'grooming-service': {
    title: 'Новая услуга',
    description: 'Добавьте услугу в справочник.',
  },
};

export function EntityFormSheet({
  type,
  actionLabel,
  mobile = false,
  className,
  groomingService,
  client,
  pet,
  open,
  onOpenChange,
  hideTrigger = false,
  appointmentDate,
  appointment,
}: {
  type: EntityFormType;
  actionLabel: string;
  mobile?: boolean;
  className?: string;
  groomingService?: GroomingService;
  client?: Client;
  pet?: Pet;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  appointmentDate?: string;
  appointment?: Appointment;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formType, setFormType] = useState<EntityFormType>(type);
  const [clientId, setClientId] = useState<string>();
  const [appointmentPetId, setAppointmentPetId] = useState<string>();
  const [clients, setClients] = useState<ClientOption[]>();
  const [appointmentOptions, setAppointmentOptions] = useState<AppointmentFormOptions>();
  const isEditing = Boolean(
    (formType === 'grooming-service' && groomingService)
      || (formType === 'client' && client)
      || (formType === 'pet' && pet)
      || (formType === 'appointment' && appointment),
  );
  const isSheetOpen = open ?? internalOpen;
  const copy = isEditing
    ? {
        title: appointment
          ? 'Редактирование записи'
          : `Редактирование: ${groomingService?.name ?? client?.name ?? pet?.name ?? ''}`,
        description: 'Измените данные и сохраните форму.',
      }
    : formCopy[formType];

  useEffect(() => {
    if (isSheetOpen && type === 'appointment') {
      void getAppointmentFormOptions().then(setAppointmentOptions);
    }

    if (isSheetOpen && type === 'pet') {
      void getClientsForSelect().then(setClients);
    }
  }, [isSheetOpen, type]);

  function handleOpenChange(open: boolean) {
    setInternalOpen(open);
    onOpenChange?.(open);

    if (!open) {
      setFormType(type);
      setClientId(undefined);
      setAppointmentPetId(undefined);
      setClients(undefined);
      setAppointmentOptions(undefined);
    }
  }

  async function loadClients() {
    setClients(await getClientsForSelect());
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={handleOpenChange}>
      {!hideTrigger && (
        <SheetTrigger
          render={
            <Button
              type='button'
              size={mobile ? 'icon' : 'lg'}
              variant={mobile ? 'ghost' : 'default'}
              className={className}
              aria-label={mobile ? actionLabel : undefined}
              title={mobile ? actionLabel : undefined}
            />
          }
        >
          <HugeiconsIcon
            icon={isEditing ? Edit02Icon : Add01Icon}
            data-icon='inline-start'
            strokeWidth={2}
          />
          {!mobile && actionLabel}
        </SheetTrigger>
      )}
      <SheetContent className='data-[side=right]:w-full sm:data-[side=right]:w-3/4 sm:data-[side=right]:max-w-lg'>
        <SheetHeader>
          <SheetTitle>{copy.title}</SheetTitle>
          <SheetDescription>{copy.description}</SheetDescription>
        </SheetHeader>
        <EntityForm
          type={formType}
          clientId={clientId}
          appointmentPetId={appointmentPetId}
          clients={clients}
          groomingService={groomingService}
          client={client}
          pet={pet}
          appointmentDate={appointmentDate}
          appointment={appointment}
          appointmentOptions={appointmentOptions}
          onCreateClientRequested={() => setFormType('client')}
          onAppointmentClientSelected={setClientId}
          onAppointmentPetSelected={setAppointmentPetId}
          onCreatePetRequested={(selectedClientId) => {
            setClientId(selectedClientId || undefined);
            setFormType('pet');
            void loadClients();
          }}
          onClientCreated={(createdClientId) => {
            setClientId(createdClientId);
            setFormType(type === 'appointment' ? 'appointment' : 'pet');

            if (type === 'appointment') {
              void getAppointmentFormOptions().then(setAppointmentOptions);
            } else {
              void loadClients();
            }
          }}
          onPetCreated={() => handleOpenChange(false)}
          onInlinePetCreated={() => {
            void getAppointmentFormOptions().then(setAppointmentOptions);
          }}
          onGroomingServiceCreated={() => handleOpenChange(false)}
          onAppointmentCreated={() => handleOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

function EntityForm({
  type,
  clientId,
  appointmentPetId,
  clients,
  groomingService,
  client,
  pet,
  appointmentDate,
  appointment,
  appointmentOptions,
  onCreateClientRequested,
  onAppointmentClientSelected,
  onAppointmentPetSelected,
  onCreatePetRequested,
  onClientCreated,
  onPetCreated,
  onInlinePetCreated,
  onGroomingServiceCreated,
  onAppointmentCreated,
}: {
  type: EntityFormType;
  clientId?: string;
  appointmentPetId?: string;
  clients?: ClientOption[];
  groomingService?: GroomingService;
  client?: Client;
  pet?: Pet;
  appointmentDate?: string;
  appointment?: Appointment;
  appointmentOptions?: AppointmentFormOptions;
  onCreateClientRequested: () => void;
  onAppointmentClientSelected: (clientId: string | undefined) => void;
  onAppointmentPetSelected: (petId: string | undefined) => void;
  onCreatePetRequested: (clientId: string) => void;
  onClientCreated: (clientId: string) => void;
  onPetCreated: () => void;
  onInlinePetCreated: () => void;
  onGroomingServiceCreated: () => void;
  onAppointmentCreated: () => void;
}) {
  const formId = useId();

  async function handleAction(formData: FormData) {
    if (type !== 'client') {
      if (type === 'appointment') {
        if (appointment) {
          if (
            appointment.status === 'pending'
            && (!appointment.clientId || !appointment.petId)
          ) {
            if (appointment.temporary) {
              await createAppointmentFromRequestAction({
                clientName: appointment.clientName,
                phone: appointment.phone,
                telegramUsername: appointment.telegramUsername,
                petName: appointment.petName,
                species: appointment.species,
                breed: appointment.breed,
                sex: appointment.sex,
              }, formData);
            } else {
              await resolvePendingAppointmentAction(appointment.id, formData);
            }
          } else {
            await updateAppointmentAction(appointment.id, formData);

            if (appointment.status === 'pending') {
              await confirmAppointmentAction(appointment.id);
            }
          }
        } else {
          await createAppointmentAction(formData);
        }
        onAppointmentCreated();
      }

      if (type === 'pet') {
        if (pet) {
          await updatePetAction(pet.id, formData);
        } else {
          await createPetAction(formData);
        }
        onPetCreated();
      }

      if (type === 'grooming-service') {
        if (groomingService) {
          await updateGroomingServiceAction(groomingService.id, formData);
        } else {
          await createGroomingServiceAction(formData);
        }
        onGroomingServiceCreated();
      }

      return;
    }

    if (client) {
      await updateClientAction(client.id, formData);
      onPetCreated();
    } else {
      const result = await createClientAction(formData);
      onClientCreated(result.clientId);
    }
  }

  async function handleInlineClientAction(formData: FormData) {
    const result = await createClientAction(formData);

    onClientCreated(result.clientId);

    return result.clientId;
  }

  return (
    <form
      className='flex min-h-0 flex-1 flex-col'
      action={handleAction}
      autoComplete='off'
    >
      <div className='flex-1 space-y-5 overflow-y-auto px-6 pb-6'>
        {type === 'client' && <ClientFields formId={formId} client={client} />}
        {type === 'pet' && (
          <PetFields
            formId={formId}
            clientId={pet?.clientId ?? clientId}
            clients={clients}
            pet={pet}
          />
        )}
        {type === 'grooming-service' && (
          <GroomingServiceFields formId={formId} service={groomingService} />
        )}
        {type === 'appointment' && (
          <AppointmentFields
            formId={formId}
            appointmentDate={appointmentDate}
            appointment={appointment}
            options={appointmentOptions}
            defaultClientId={clientId}
            onCreateClient={onCreateClientRequested}
            onCreateInlineClient={handleInlineClientAction}
            onClientSelected={onAppointmentClientSelected}
            onCreatePet={onCreatePetRequested}
            onPetSelected={onAppointmentPetSelected}
            onInlinePetCreated={onInlinePetCreated}
          />
        )}
      </div>
      {type === 'appointment' && appointment ? (
        <AppointmentActions
          appointment={appointment}
          onStatusChanged={onAppointmentCreated}
        />
      ) : type !== 'appointment' || (clientId && appointmentPetId) ? (
        <div className='border-t p-6'>
          <Button type='submit' className='w-full'>
            Сохранить
          </Button>
        </div>
      ) : null}
    </form>
  );
}
