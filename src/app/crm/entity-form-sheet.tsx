'use client';

import { Add01Icon, Edit02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ReactNode } from 'react';
import { useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/date-picker';
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
import type { Client, GroomingService, Pet } from '@/types/entities';

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
}: {
  type: EntityFormType;
  actionLabel: string;
  mobile?: boolean;
  className?: string;
  groomingService?: GroomingService;
  client?: Client;
  pet?: Pet;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [formType, setFormType] = useState<EntityFormType>(type);
  const [clientId, setClientId] = useState<string>();
  const [clients, setClients] = useState<ClientOption[]>();
  const isEditing = Boolean(groomingService || client || pet);
  const copy = isEditing
    ? {
        title: `Редактирование: ${groomingService?.name ?? client?.name ?? pet?.name ?? ''}`,
        description: 'Измените данные и сохраните форму.',
      }
    : formCopy[formType];

  function handleOpenChange(open: boolean) {
    setIsOpen(open);

    if (open && type === 'pet') {
      void loadClients();
    }

    if (!open) {
      setFormType(type);
      setClientId(undefined);
      setClients(undefined);
    }
  }

  async function loadClients() {
    setClients(await getClientsForSelect());
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
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
          onClientCreated={(createdClientId) => {
            setClientId(createdClientId);
            setFormType('pet');
            void loadClients();
          }}
          onPetCreated={() => handleOpenChange(false)}
          onGroomingServiceCreated={() => handleOpenChange(false)}
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
  onClientCreated,
  onPetCreated,
  onGroomingServiceCreated,
}: {
  type: EntityFormType;
  clientId?: string;
  clients?: ClientOption[];
  groomingService?: GroomingService;
  client?: Client;
  pet?: Pet;
  onClientCreated: (clientId: string) => void;
  onPetCreated: () => void;
  onGroomingServiceCreated: () => void;
}) {
  const formId = useId();

  async function handleAction(formData: FormData) {
    if (type !== 'client') {
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

  const action = type === 'appointment' ? undefined : handleAction;

  return (
    <form
      className='flex min-h-0 flex-1 flex-col'
      action={action}
      autoComplete='off'
      onSubmit={action ? undefined : (event) => event.preventDefault()}
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
        {type === 'appointment' && <AppointmentFields formId={formId} />}
      </div>
      <div className='border-t p-6'>
        <Button type='submit' className='w-full'>
          Сохранить
        </Button>
      </div>
    </form>
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

function AppointmentFields({ formId }: { formId: string }) {
  return (
    <>
      <FormField id={`${formId}-client`} label='Клиент' required>
        <Input id={`${formId}-client`} name='clientId' placeholder='ID клиента' required />
      </FormField>
      <FormField id={`${formId}-pet`} label='Питомец' required>
        <Input id={`${formId}-pet`} name='petId' placeholder='ID питомца' required />
      </FormField>
      <FormField id={`${formId}-groomer`} label='Грумер'>
        <Input id={`${formId}-groomer`} name='groomerId' placeholder='ID грумера' />
      </FormField>
      <FormField id={`${formId}-booking-request`} label='Заявка на запись'>
        <Input id={`${formId}-booking-request`} name='bookingRequestId' placeholder='ID заявки' />
      </FormField>
      <FormField id={`${formId}-start`} label='Начало' required>
        <Input id={`${formId}-start`} name='scheduledStart' type='datetime-local' required />
      </FormField>
      <FormField id={`${formId}-end`} label='Окончание' required>
        <Input id={`${formId}-end`} name='scheduledEnd' type='datetime-local' required />
      </FormField>
      <FormField id={`${formId}-location`} label='Место' required>
        <Select id={`${formId}-location`} name='locationType' required defaultValue='salon'>
          <option value='salon'>В салоне</option>
          <option value='mobile'>С выездом</option>
        </Select>
      </FormField>
      <FormField id={`${formId}-address`} label='Адрес'>
        <Input id={`${formId}-address`} name='address' />
      </FormField>
      <FormField id={`${formId}-price`} label='Предварительная стоимость'>
        <Input id={`${formId}-price`} name='estimatedPrice' type='number' min='0' step='0.01' />
      </FormField>
      <FormField id={`${formId}-status`} label='Статус'>
        <Select id={`${formId}-status`} name='status' defaultValue='confirmed'>
          <option value='confirmed'>Подтверждена</option>
          <option value='completed'>Завершена</option>
          <option value='cancelled'>Отменена</option>
          <option value='no_show'>Неявка</option>
        </Select>
      </FormField>
      <FormField id={`${formId}-notes`} label='Заметки'>
        <Textarea id={`${formId}-notes`} name='notes' />
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

function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'h-9 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
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
        'min-h-24 w-full resize-y rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        className,
      )}
      {...props}
    />
  );
}
