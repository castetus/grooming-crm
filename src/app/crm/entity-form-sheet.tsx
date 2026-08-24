'use client';

import {
  Add01Icon,
  ArrowDown02Icon,
  ArrowUpRight01Icon,
  Cancel01Icon,
  Edit02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Dialog } from '@base-ui/react/dialog';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useId, useState, useTransition } from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import { DatePicker } from '@/components/date-picker';
import { TimePicker } from '@/components/time-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { Appointment, Client, GroomingService, Pet } from '@/types/entities';

import {
  cancelAppointmentAction,
  completeAppointmentAction,
  confirmAppointmentAction,
  createAppointmentAction,
  getAppointmentFormOptions,
  restoreAppointmentAction,
  updateAppointmentAction,
} from './appointment-actions';
import { createClientAction, updateClientAction } from './clients/actions';
import { createPetAction, getClientsForSelect, updatePetAction } from './pets/actions';
import {
  createGroomingServiceAction,
  updateGroomingServiceAction,
} from './settings/grooming-services/actions';

type ClientOption = Awaited<ReturnType<typeof getClientsForSelect>>[number];
type AppointmentFormOptions = Awaited<ReturnType<typeof getAppointmentFormOptions>>;

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
          clients={clients}
          groomingService={groomingService}
          client={client}
          pet={pet}
          appointmentDate={appointmentDate}
          appointment={appointment}
          appointmentOptions={appointmentOptions}
          onCreateClientRequested={() => setFormType('client')}
          onCreatePetRequested={(selectedClientId) => {
            setClientId(selectedClientId || undefined);
            setFormType('pet');
            void loadClients();
          }}
          onClientCreated={(createdClientId) => {
            setClientId(createdClientId);
            setFormType('pet');
            void loadClients();
          }}
          onPetCreated={() => handleOpenChange(false)}
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
  clients,
  groomingService,
  client,
  pet,
  appointmentDate,
  appointment,
  appointmentOptions,
  onCreateClientRequested,
  onCreatePetRequested,
  onClientCreated,
  onPetCreated,
  onGroomingServiceCreated,
  onAppointmentCreated,
}: {
  type: EntityFormType;
  clientId?: string;
  clients?: ClientOption[];
  groomingService?: GroomingService;
  client?: Client;
  pet?: Pet;
  appointmentDate?: string;
  appointment?: Appointment;
  appointmentOptions?: AppointmentFormOptions;
  onCreateClientRequested: () => void;
  onCreatePetRequested: (clientId: string) => void;
  onClientCreated: (clientId: string) => void;
  onPetCreated: () => void;
  onGroomingServiceCreated: () => void;
  onAppointmentCreated: () => void;
}) {
  const formId = useId();

  async function handleAction(formData: FormData) {
    if (type !== 'client') {
      if (type === 'appointment') {
        if (appointment) {
          await updateAppointmentAction(appointment.id, formData);
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
            onCreateClient={onCreateClientRequested}
            onCreatePet={onCreatePetRequested}
          />
        )}
      </div>
      {type === 'appointment' && appointment ? (
        <AppointmentActions
          appointment={appointment}
          onStatusChanged={onAppointmentCreated}
        />
      ) : (
        <div className='border-t p-6'>
          <Button type='submit' className='w-full'>
            Сохранить
          </Button>
        </div>
      )}
    </form>
  );
}

type StatusAction = 'confirm' | 'cancel' | 'restore';

const statusActionCopy: Record<StatusAction, { title: string; description: string; label: string }> = {
  confirm: {
    title: 'Подтвердить запись?',
    description: 'Запись получит статус «Подтверждена».',
    label: 'Подтвердить',
  },
  cancel: {
    title: 'Отменить запись?',
    description: 'Запись будет отменена. Позже её можно будет восстановить.',
    label: 'Отменить',
  },
  restore: {
    title: 'Восстановить запись?',
    description: 'Запись снова получит статус «Подтверждена».',
    label: 'Восстановить',
  },
};

function AppointmentActions({
  appointment,
  onStatusChanged,
}: {
  appointment: Appointment;
  onStatusChanged: () => void;
}) {
  const [statusAction, setStatusAction] = useState<StatusAction>();
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function applyStatusChange() {
    if (!statusAction) {
      return;
    }

    startTransition(async () => {
      if (statusAction === 'confirm') {
        await confirmAppointmentAction(appointment.id);
      }

      if (statusAction === 'cancel') {
        await cancelAppointmentAction(appointment.id);
      }

      if (statusAction === 'restore') {
        await restoreAppointmentAction(appointment.id);
      }

      setStatusAction(undefined);
      onStatusChanged();
    });
  }

  if (appointment.status === 'completed') {
    return null;
  }

  return (
    <>
      <div className="border-t p-6">
        {appointment.status === 'pending' && (
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" onClick={() => setStatusAction('confirm')}>
              Подтвердить
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setStatusAction('cancel')}
            >
              Отменить
            </Button>
          </div>
        )}
        {appointment.status === 'confirmed' && (
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" onClick={() => setIsCompletionOpen(true)}>
              Завершить
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setStatusAction('cancel')}
            >
              Отменить
            </Button>
          </div>
        )}
        {appointment.status === 'cancelled' && (
          <Button
            type="button"
            className="w-full"
            onClick={() => setStatusAction('restore')}
          >
            Восстановить
          </Button>
        )}
      </div>
      <StatusConfirmationDialog
        action={statusAction}
        pending={isPending}
        onOpenChange={(open) => {
          if (!open && !isPending) {
            setStatusAction(undefined);
          }
        }}
        onConfirm={applyStatusChange}
      />
      <CompleteAppointmentDialog
        appointment={appointment}
        open={isCompletionOpen}
        onOpenChange={setIsCompletionOpen}
        onCompleted={onStatusChanged}
      />
    </>
  );
}

function CompleteAppointmentDialog({
  appointment,
  open,
  onOpenChange,
  onCompleted,
}: {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: () => void;
}) {
  const [isPending, setIsPending] = useState(false);

  async function handleAction(formData: FormData) {
    setIsPending(true);

    try {
      await completeAppointmentAction(appointment.id, formData);
      onOpenChange(false);
      onCompleted();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[60] bg-black/80 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-[60] max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-popover p-6 text-popover-foreground shadow-lg">
          <Dialog.Title className="text-base font-medium">Завершение груминга</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            Заполните результаты и добавьте фотографии после груминга.
          </Dialog.Description>
          <form action={handleAction} className="mt-6 space-y-5">
            <FormField id="completion-price" label="Итоговая стоимость" required>
              <Input
                id="completion-price"
                name="totalPrice"
                type="number"
                min="0"
                step="0.01"
                defaultValue={appointment.estimatedPrice ?? ''}
                required
              />
            </FormField>
            <FormField id="completion-details" label="Что было сделано">
              <Textarea id="completion-details" name="groomingDetails" />
            </FormField>
            <FormField id="completion-notes" label="Заметки">
              <Textarea
                id="completion-notes"
                name="notes"
                defaultValue={appointment.notes ?? ''}
              />
            </FormField>
            <FormField id="completion-photos" label="Фотографии после груминга">
              <Input
                id="completion-photos"
                name="photos"
                type="file"
                accept="image/*"
                multiple
              />
            </FormField>
            <div className="flex justify-end gap-3 pt-1">
              <Dialog.Close
                disabled={isPending}
                render={<Button type="button" variant="outline" />}
              >
                Назад
              </Dialog.Close>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Завершение...' : 'Завершить'}
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function StatusConfirmationDialog({
  action,
  pending,
  onOpenChange,
  onConfirm,
}: {
  action?: StatusAction;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const copy = action ? statusActionCopy[action] : undefined;

  return (
    <Dialog.Root open={Boolean(action)} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[60] bg-black/80 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-popover p-6 text-popover-foreground shadow-lg">
          <Dialog.Title className="text-base font-medium">{copy?.title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            {copy?.description}
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close
              disabled={pending}
              render={<Button type="button" variant="outline" />}
            >
              Назад
            </Dialog.Close>
            <Button
              type="button"
              variant={action === 'cancel' ? 'destructive' : 'default'}
              disabled={pending}
              onClick={onConfirm}
            >
              {copy?.label}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ClientFields({
  formId,
  embedded = false,
  client,
}: {
  formId: string;
  embedded?: boolean;
  client?: Client;
}) {
  const fieldName = (name: string) =>
    embedded ? `newClient${name.charAt(0).toUpperCase()}${name.slice(1)}` : name;

  return (
    <>
      <FormField id={`${formId}-name`} label='Имя' required>
        <Input id={`${formId}-name`} name={fieldName('name')} defaultValue={client?.name} required />
      </FormField>
      <FormField id={`${formId}-phone`} label='Телефон'>
        <Input id={`${formId}-phone`} name={fieldName('phone')} type='tel' defaultValue={client?.phone ?? ''} />
      </FormField>
      <FormField id={`${formId}-telegram-username`} label='Имя пользователя в Telegram'>
        <Input
          id={`${formId}-telegram-username`}
          name={fieldName('telegramUsername')}
          placeholder='@username'
          defaultValue={client?.telegramUsername ?? ''}
        />
      </FormField>
      <FormField id={`${formId}-language`} label='Предпочитаемый язык'>
        <Select
          id={`${formId}-language`}
          name={fieldName('preferredLanguage')}
          defaultValue={client?.preferredLanguage ?? 'ru'}
        >
          <option value='ru'>Русский</option>
          <option value='sr'>Сербский</option>
        </Select>
      </FormField>
      <FormField id={`${formId}-address`} label='Адрес'>
        <Input id={`${formId}-address`} name={fieldName('address')} defaultValue={client?.address ?? ''} />
      </FormField>
      <FormField id={`${formId}-notes`} label='Заметки'>
        <Textarea id={`${formId}-notes`} name={fieldName('notes')} defaultValue={client?.notes ?? ''} />
      </FormField>
    </>
  );
}

function PetFields({
  formId,
  clientId,
  clients,
  pet,
}: {
  formId: string;
  clientId?: string;
  clients?: ClientOption[];
  pet?: Pet;
}) {
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  return (
    <>
      <FormField id={`${formId}-client`} label='Клиент' required={!isCreatingClient}>
        <ClientSelect
          key={`${clientId}-${clients?.length ?? 0}`}
          id={`${formId}-client`}
          clients={clients}
          defaultClientId={clientId}
          disabled={isCreatingClient || Boolean(pet)}
        />
        {!pet && (
          <Button
            type='button'
            variant='outline'
            className='mt-2 w-full'
            onClick={() => setIsCreatingClient(!isCreatingClient)}
          >
            {isCreatingClient ? 'Выбрать существующего клиента' : 'Создать нового клиента'}
          </Button>
        )}
      </FormField>
      {isCreatingClient && (
        <div className='space-y-5 rounded-xl border bg-muted/30 p-4'>
          <p className='font-medium'>Новый клиент</p>
          <ClientFields formId={`${formId}-new-client`} embedded />
        </div>
      )}
      <FormField id={`${formId}-name`} label='Кличка' required>
        <Input id={`${formId}-name`} name='name' defaultValue={pet?.name} required />
      </FormField>
      <FormField id={`${formId}-photo`} label='Фотография'>
        <Input id={`${formId}-photo`} name='photo' type='file' accept='image/*' />
        {pet?.photoPath && (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="break-all">{pet.photoPath}</p>
            <p>Новый файл заменит текущую фотографию.</p>
          </div>
        )}
      </FormField>
      <FormField id={`${formId}-species`} label='Вид' required>
        <Select id={`${formId}-species`} name='species' required defaultValue={pet?.species ?? 'dog'}>
          <option value='dog'>Собака</option>
          <option value='cat'>Кошка</option>
        </Select>
      </FormField>
      <FormField id={`${formId}-breed`} label='Порода'>
        <Input id={`${formId}-breed`} name='breed' defaultValue={pet?.breed ?? ''} />
      </FormField>
      <FormField id={`${formId}-birth-date`} label='Дата рождения'>
        {pet ? (
          <Input
            id={`${formId}-birth-date`}
            name='birthDate'
            type='date'
            defaultValue={pet.birthDate ?? ''}
          />
        ) : (
          <DatePicker id={`${formId}-birth-date`} name='birthDate' />
        )}
      </FormField>
      <FormField id={`${formId}-sex`} label='Пол' required>
        <Select id={`${formId}-sex`} name='sex' required defaultValue={pet?.sex ?? 'male'}>
          <option value='male'>Самец</option>
          <option value='female'>Самка</option>
        </Select>
      </FormField>
      <FormField id={`${formId}-grooming-plan`} label='План груминга'>
        <Textarea id={`${formId}-grooming-plan`} name='groomingPlan' defaultValue={pet?.groomingPlan ?? ''} />
      </FormField>
      <FormField id={`${formId}-interval`} label='Рекомендуемый интервал, дней'>
        <Input
          id={`${formId}-interval`}
          name='recommendedIntervalDays'
          type='number'
          min='1'
          defaultValue={pet?.recommendedIntervalDays ?? ''}
        />
      </FormField>
      <FormField id={`${formId}-notes`} label='Заметки'>
        <Textarea id={`${formId}-notes`} name='notes' defaultValue={pet?.notes ?? ''} />
      </FormField>
    </>
  );
}

function ClientSelect({
  id,
  clients,
  defaultClientId,
  disabled = false,
}: {
  id: string;
  clients?: ClientOption[];
  defaultClientId?: string;
  disabled?: boolean;
}) {
  const initialClient = clients?.find((client) => client.id === defaultClientId);
  const [query, setQuery] = useState(initialClient ? formatClientOption(initialClient) : '');
  const [selectedClientId, setSelectedClientId] = useState(initialClient?.id ?? '');
  const listId = `${id}-options`;

  return (
    <>
      <Input
        id={id}
        list={listId}
        value={query}
        placeholder={clients ? 'Начните вводить имя или телефон' : 'Загрузка клиентов...'}
        disabled={!clients || disabled}
        required={!disabled}
        onChange={(event) => {
          const value = event.target.value;
          const selectedClient = clients?.find(
            (client) => formatClientOption(client) === value,
          );

          setQuery(value);
          setSelectedClientId(selectedClient?.id ?? '');
        }}
      />
      <input type='hidden' name='clientId' value={disabled ? '' : selectedClientId} />
      <datalist id={listId}>
        {clients?.map((client) => (
          <option key={client.id} value={formatClientOption(client)} />
        ))}
      </datalist>
    </>
  );
}

function formatClientOption(client: ClientOption) {
  return client.phone ? `${client.name} — ${client.phone}` : client.name;
}

function GroomingServiceFields({
  formId,
  service,
}: {
  formId: string;
  service?: GroomingService;
}) {
  return (
    <>
      <FormField id={`${formId}-name`} label='Название' required>
        <Input id={`${formId}-name`} name='name' defaultValue={service?.name} required />
      </FormField>
      <FormField id={`${formId}-description`} label='Описание'>
        <Textarea id={`${formId}-description`} name='description' defaultValue={service?.description ?? ''} />
      </FormField>
      <FormField id={`${formId}-price`} label='Стоимость по умолчанию'>
        <Input
          id={`${formId}-price`}
          name='defaultPrice'
          type='number'
          min='0'
          step='0.01'
          defaultValue={service?.defaultPrice ?? ''}
        />
      </FormField>
      <FormField id={`${formId}-duration`} label='Продолжительность, минут'>
        <Input
          id={`${formId}-duration`}
          name='defaultDurationMinutes'
          type='number'
          min='1'
          defaultValue={service?.defaultDurationMinutes ?? ''}
        />
      </FormField>
      <label className='flex items-center gap-3 text-sm font-medium'>
        <input
          name='active'
          type='checkbox'
          defaultChecked={service?.active ?? true}
          className='size-4 accent-primary'
        />
        Активная услуга
      </label>
    </>
  );
}

function AppointmentFields({
  formId,
  appointmentDate,
  options,
  appointment,
  onCreateClient,
  onCreatePet,
}: {
  formId: string;
  appointmentDate?: string;
  options?: AppointmentFormOptions;
  appointment?: Appointment;
  onCreateClient: () => void;
  onCreatePet: (clientId: string) => void;
}) {
  const [selectedClientId, setSelectedClientId] = useState(appointment?.clientId ?? '');
  const [selectedPetId, setSelectedPetId] = useState(appointment?.petId ?? '');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [manualPrice, setManualPrice] = useState(
    appointment?.estimatedPrice === null || appointment?.estimatedPrice === undefined
      ? ''
      : String(appointment.estimatedPrice),
  );
  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);
  const [locationType, setLocationType] = useState<'salon' | 'mobile'>(
    appointment?.locationType ?? 'salon',
  );
  const start = appointment ? new Date(appointment.scheduledStart) : undefined;
  const end = appointment ? new Date(appointment.scheduledEnd) : undefined;
  const initialStartTime = start ? formatFormTime(start) : '';
  const [startTime, setStartTime] = useState(initialStartTime);
  const selectedDate = appointmentDate ?? (start ? formatFormDate(start) : undefined);
  const availablePets = selectedClientId
    ? (options?.pets.filter((pet) => pet.clientId === selectedClientId) ?? [])
    : (options?.pets ?? []);
  const selectedServices =
    options?.services.filter((service) => selectedServiceIds.includes(service.id)) ?? [];
  const selectedPet = options?.pets.find((pet) => pet.id === selectedPetId);
  const calculatedPrice = selectedServices.reduce(
    (total, service) => total + (service.defaultPrice ?? 0),
    0,
  );

  return (
    <>
      <FormField id={`${formId}-client`} label='Клиент' required>
        <div className='flex gap-2'>
          <Select
            id={`${formId}-client`}
            name='clientId'
            value={selectedClientId}
            className='min-w-0'
            disabled={!options}
            required
            onChange={(event) => {
              setSelectedClientId(event.target.value);
              setSelectedPetId('');
            }}
          >
            <option value=''>{options ? 'Выберите клиента' : 'Загрузка клиентов...'}</option>
            {options?.clients.map((clientOption) => (
              <option key={clientOption.id} value={clientOption.id}>
                {formatClientOption(clientOption)}
              </option>
            ))}
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Добавить клиента"
            title="Добавить клиента"
            onClick={onCreateClient}
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
          </Button>
          {selectedClientId && (
            <Link
              href={`/crm/clients/${selectedClientId}`}
              className={buttonVariants({ variant: 'outline', size: 'icon' })}
              aria-label='Открыть страницу клиента'
              title='Открыть страницу клиента'
            >
              <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} />
            </Link>
          )}
        </div>
      </FormField>
      <FormField id={`${formId}-pet`} label='Питомец' required>
        <div className='flex gap-2'>
          <Select
            id={`${formId}-pet`}
            name='petId'
            value={selectedPetId}
            className='min-w-0'
            disabled={!options}
            required
            onChange={(event) => {
              const petId = event.target.value;
              const pet = options?.pets.find((petOption) => petOption.id === petId);

              setSelectedPetId(petId);

              if (pet) {
                setSelectedClientId(pet.clientId);
              }
            }}
          >
            <option value=''>
              {!options
                ? 'Загрузка питомцев...'
                : availablePets.length
                  ? 'Выберите питомца'
                  : 'У клиента нет питомцев'}
            </option>
            {availablePets.map((petOption) => (
              <option key={petOption.id} value={petOption.id}>
                {petOption.breed ? `${petOption.name} — ${petOption.breed}` : petOption.name}
              </option>
            ))}
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Добавить питомца"
            title="Добавить питомца"
            onClick={() => onCreatePet(selectedClientId)}
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
          </Button>
          {selectedPetId && (
            <Link
              href={`/crm/pets/${selectedPetId}`}
              className={buttonVariants({ variant: 'outline', size: 'icon' })}
              aria-label='Открыть страницу питомца'
              title='Открыть страницу питомца'
            >
              <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} />
            </Link>
          )}
        </div>
      </FormField>
      <FormField id={`${formId}-date`} label='Дата' required>
        <DatePicker
          key={appointmentDate}
          id={`${formId}-date`}
          name='scheduledDate'
          defaultValue={selectedDate}
          futureYears={5}
        />
      </FormField>
      <div className='grid grid-cols-2 gap-3'>
        <FormField id={`${formId}-start-time`} label='Начало' required>
          <TimePicker
            id={`${formId}-start-time`}
            name='scheduledStartTime'
            defaultValue={initialStartTime}
            onValueChange={setStartTime}
            required
          />
        </FormField>
        <FormField id={`${formId}-end-time`} label='Окончание' required>
          <TimePicker
            key={startTime}
            id={`${formId}-end-time`}
            name='scheduledEndTime'
            defaultValue={startTime === initialStartTime && end ? formatFormTime(end) : ''}
            after={startTime}
            required
          />
        </FormField>
      </div>
      <FormField id={`${formId}-location`} label='Место' required>
        <Select
          id={`${formId}-location`}
          name='locationType'
          value={locationType}
          required
          onChange={(event) =>
            setLocationType(event.target.value === 'mobile' ? 'mobile' : 'salon')
          }
        >
          <option value='salon'>В салоне</option>
          <option value='mobile'>С выездом</option>
        </Select>
      </FormField>
      {locationType === 'mobile' && (
        <FormField id={`${formId}-address`} label='Адрес' required>
          <Input
            id={`${formId}-address`}
            name='address'
            defaultValue={appointment?.address ?? ''}
            required
          />
        </FormField>
      )}
      <FormField id={`${formId}-services`} label='Услуги'>
        <div className='relative'>
          <Button
            id={`${formId}-services`}
            type='button'
            variant='outline'
            className='w-full'
            aria-expanded={isServiceMenuOpen}
            onClick={() => setIsServiceMenuOpen(!isServiceMenuOpen)}
          >
            Добавить услугу
          </Button>
          {isServiceMenuOpen && (
            <div className='absolute inset-x-0 top-full z-30 mt-2 max-h-56 overflow-y-auto rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg'>
              {options?.services.length ? (
                options.services.map((service) => {
                  const isSelected = selectedServiceIds.includes(service.id);

                  return (
                    <button
                      key={service.id}
                      type='button'
                      disabled={isSelected}
                      className='flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-50'
                      onClick={() => {
                        setSelectedServiceIds([...selectedServiceIds, service.id]);
                        setIsServiceMenuOpen(false);
                      }}
                    >
                      <span>{service.name}</span>
                      <span className='shrink-0 text-muted-foreground'>
                        {formatServicePrice(service.defaultPrice)}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className='px-3 py-2 text-sm text-muted-foreground'>
                  {options ? 'Услуг пока нет' : 'Загрузка услуг...'}
                </p>
              )}
            </div>
          )}
        </div>

        {selectedServices.length > 0 && (
          <div className='flex min-h-11 flex-wrap gap-2 rounded-xl border border-input p-2'>
            {selectedServices.map((service) => (
              <span
                key={service.id}
                className='inline-flex items-center gap-1 rounded-full bg-secondary py-1 pl-3 pr-1 text-sm text-secondary-foreground'
              >
                {service.name}
                <button
                  type='button'
                  className='flex size-6 items-center justify-center rounded-full hover:bg-foreground/10'
                  aria-label={`Удалить услугу «${service.name}»`}
                  onClick={() => {
                    setSelectedServiceIds(
                      selectedServiceIds.filter((serviceId) => serviceId !== service.id),
                    );
                  }}
                >
                  <HugeiconsIcon icon={Cancel01Icon} className='size-3.5' strokeWidth={2} />
                </button>
                <input type='hidden' name='serviceIds' value={service.id} />
              </span>
            ))}
          </div>
        )}
      </FormField>
      <FormField id={`${formId}-calculated-price`} label='Предварительная стоимость'>
        <Input
          id={`${formId}-calculated-price`}
          type='number'
          min='0'
          step='0.01'
          value={calculatedPrice}
          readOnly
        />
      </FormField>
      <div className='-my-3 flex justify-center'>
        <Button
          type='button'
          variant='ghost'
          size='icon-lg'
          aria-label='Подставить предварительную стоимость в итоговую'
          title='Подставить предварительную стоимость'
          disabled={calculatedPrice === 0}
          onClick={() => setManualPrice(String(calculatedPrice))}
        >
          <HugeiconsIcon icon={ArrowDown02Icon} className='size-6' strokeWidth={2} />
        </Button>
      </div>
      <FormField id={`${formId}-price`} label='Итоговая стоимость'>
        <Input
          id={`${formId}-price`}
          name='estimatedPrice'
          type='number'
          min='0'
          step='0.01'
          value={manualPrice}
          className='bg-white dark:bg-white dark:text-black'
          onChange={(event) => setManualPrice(event.target.value)}
        />
      </FormField>
      {!appointment && (
        <FormField id={`${formId}-status`} label='Статус'>
          <Select id={`${formId}-status`} name='status' defaultValue='confirmed'>
            <option value='pending'>Ожидает подтверждения</option>
            <option value='confirmed'>Подтверждена</option>
          </Select>
        </FormField>
      )}
      <FormField id={`${formId}-pet-notes`} label='Заметки о питомце'>
        <Textarea
          id={`${formId}-pet-notes`}
          value={selectedPet?.notes ?? ''}
          placeholder={selectedPetId ? 'Заметок о питомце нет' : 'Сначала выберите питомца'}
          readOnly
        />
      </FormField>
      <FormField id={`${formId}-notes`} label='Заметки'>
        <Textarea id={`${formId}-notes`} name='notes' defaultValue={appointment?.notes ?? ''} />
      </FormField>
    </>
  );
}

function FormField({
  id,
  label,
  required = false,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className='space-y-2'>
      <Label htmlFor={id}>
        {label}
        {required && <span className='text-destructive'> *</span>}
      </Label>
      {children}
    </div>
  );
}

function formatServicePrice(price: number | null) {
  return price === null ? 'Без цены' : new Intl.NumberFormat('ru-RU').format(price);
}

function formatFormDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatFormTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'h-9 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:bg-muted/50 disabled:opacity-50 dark:bg-white dark:text-black dark:disabled:bg-muted/50 dark:disabled:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full resize-y rounded-xl border border-input bg-white px-3 py-2 text-sm outline-none placeholder:text-muted-foreground read-only:bg-muted/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:bg-muted/50 disabled:opacity-50 dark:bg-white dark:text-black dark:read-only:bg-muted/50 dark:read-only:text-foreground dark:disabled:bg-muted/50 dark:disabled:text-foreground',
        className,
      )}
      {...props}
    />
  );
}
