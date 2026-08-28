'use client';

import {
  Add01Icon,
  ArrowDown02Icon,
  ArrowUpRight01Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { useState } from 'react';

import { DatePicker } from '@/components/date-picker';
import { TimePicker } from '@/components/time-picker';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Appointment } from '@/types/entities';

import { getAppointmentFormOptions } from '../appointment-actions';
import { createPetAction } from '../pets/actions';
import { AppointmentRequestData } from './appointment-request-data';
import { ClientFields, formatClientOption, PetFields } from './entity-fields';
import { FormField, SearchableSelect, Select, Textarea } from './form-controls';
import {
  formatFormDate,
  formatFormTime,
  formatServicePrice,
} from './utils';

export type AppointmentFormOptions = Awaited<ReturnType<typeof getAppointmentFormOptions>>;

export function AppointmentFields({
  formId,
  appointmentDate,
  options,
  appointment,
  defaultClientId,
  onCreateClient,
  onCreateInlineClient,
  onClientSelected,
  onCreatePet,
  onPetSelected,
  onInlinePetCreated,
}: {
  formId: string;
  appointmentDate?: string;
  options?: AppointmentFormOptions;
  appointment?: Appointment;
  defaultClientId?: string;
  onCreateClient: () => void;
  onCreateInlineClient: (formData: FormData) => Promise<string>;
  onClientSelected: (clientId: string | undefined) => void;
  onCreatePet: (clientId: string) => void;
  onPetSelected: (petId: string | undefined) => void;
  onInlinePetCreated: () => void;
}) {
  const [selectedClientId, setSelectedClientId] = useState(
    appointment?.clientId ?? defaultClientId ?? '',
  );
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [isCreatingPet, setIsCreatingPet] = useState(false);
  const [createdClientId, setCreatedClientId] = useState<string>();
  const [petCreatedInForm, setPetCreatedInForm] = useState(false);
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
  const isUnlinkedPending = Boolean(
    appointment?.status === 'pending' && (!appointment.clientId || !appointment.petId),
  );
  const clientCreatedInForm = createdClientId === selectedClientId;

  async function handleInlineClientAction(formData: FormData) {
    const createdClientId = await onCreateInlineClient(formData);

    setSelectedClientId(createdClientId);
    setIsCreatingClient(false);
    setCreatedClientId(createdClientId);
    setPetCreatedInForm(false);
    onClientSelected(createdClientId);
  }

  async function handleInlinePetAction(formData: FormData) {
    const result = await createPetAction(formData);

    setSelectedPetId(result.petId);
    setIsCreatingPet(false);
    setPetCreatedInForm(true);
    onPetSelected(result.petId);
    onInlinePetCreated();
  }

  return (
    <>
      {appointment && <AppointmentRequestData appointment={appointment} />}
      <FormField id={`${formId}-client`} label='Клиент' required={!isUnlinkedPending}>
        <div className='flex gap-2'>
          <SearchableSelect
            id={`${formId}-client`}
            name='clientId'
            value={selectedClientId}
            className='min-w-0'
            disabled={!options || isCreatingClient}
            required={!isUnlinkedPending && !isCreatingClient}
            options={options?.clients.map((clientOption) => ({
              label: formatClientOption(clientOption),
              value: clientOption.id,
            })) ?? []}
            placeholder={!options
              ? 'Загрузка клиентов...'
              : 'Выберите клиента'}
            emptyMessage='Клиенты не найдены'
            onValueChange={(value) => {
              setSelectedClientId(value);
              setSelectedPetId('');
              setIsCreatingClient(false);
              setIsCreatingPet(false);
              setPetCreatedInForm(false);
              onClientSelected(value || undefined);
              onPetSelected(undefined);
            }}
          />
          {appointment && !isUnlinkedPending && (
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
          )}
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
        {!appointment && !clientCreatedInForm && (
          <Button
            type='button'
            variant='outline'
            className='mt-2 w-full'
            onClick={() => {
              setIsCreatingClient(!isCreatingClient);

              if (!isCreatingClient) {
                setSelectedClientId('');
                setSelectedPetId('');
                onClientSelected(undefined);
                onPetSelected(undefined);
              }
            }}
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
            {isCreatingClient ? 'Выбрать существующего клиента' : 'Создать клиента'}
          </Button>
        )}
      </FormField>
      {!appointment && isCreatingClient && (
        <div className='space-y-5 rounded-xl border bg-muted/30 p-4'>
          <p className='font-medium'>Новый клиент</p>
          <ClientFields formId={`${formId}-new-client`} />
          <Button type='submit' className='w-full' formAction={handleInlineClientAction}>
            Создать клиента
          </Button>
        </div>
      )}
      {(appointment || selectedClientId) && !isCreatingClient && (
        <>
      {(!clientCreatedInForm || petCreatedInForm) && !isCreatingPet && (
        <FormField id={`${formId}-pet`} label='Питомец' required={!isUnlinkedPending}>
        <div className='flex gap-2'>
          <SearchableSelect
            id={`${formId}-pet`}
            name='petId'
            value={selectedPetId}
            className='min-w-0'
            disabled={!options}
            required={!isUnlinkedPending}
            options={availablePets.map((petOption) => ({
              label: petOption.breed ? `${petOption.name} — ${petOption.breed}` : petOption.name,
              value: petOption.id,
            }))}
            placeholder={!options
              ? 'Загрузка питомцев...'
              : availablePets.length
                ? 'Выберите питомца'
                : selectedClientId
                  ? 'У клиента нет питомцев'
                  : 'Выберите питомца'}
            emptyMessage='Питомцы не найдены'
            onValueChange={(petId) => {
              const pet = options?.pets.find((petOption) => petOption.id === petId);

              setSelectedPetId(petId);
              onPetSelected(petId || undefined);

              if (pet) {
                setSelectedClientId(pet.clientId);
                onClientSelected(pet.clientId);
              }
            }}
          />
          {appointment && !isUnlinkedPending && (
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
          )}
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
      )}
      {isUnlinkedPending && (!selectedClientId || !selectedPetId) && !isCreatingPet && (
        <Button type='submit' variant='outline' size='lg' className='w-full'>
          Создать из данных заявки
        </Button>
      )}
      {!appointment && !isCreatingPet && !petCreatedInForm && (
        <Button
          type='button'
          variant='outline'
          size='lg'
          className='w-full'
          onClick={() => {
            setSelectedPetId('');
            setIsCreatingPet(true);
            onPetSelected(undefined);
          }}
        >
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
          Создать питомца
        </Button>
      )}
      {!appointment && isCreatingPet && (
        <div className='space-y-5 rounded-xl border bg-muted/30 p-4'>
          <p className='font-medium'>Новый питомец</p>
          <PetFields
            formId={`${formId}-new-pet`}
            clientId={selectedClientId}
            hideClientSelection
          />
          <Button
            type='submit'
            size='lg'
            className='w-full'
            formAction={handleInlinePetAction}
          >
            Создать питомца
          </Button>
        </div>
      )}
      {(appointment || selectedPetId) && !isCreatingPet && (
        <>
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
      )}
        </>
      )}
    </>
  );
}
