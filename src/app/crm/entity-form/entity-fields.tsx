'use client';

import { useState } from 'react';

import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Client, GroomingService, Pet } from '@/types/entities';

import { FormField, Select, Textarea } from './form-controls';

export type ClientOption = {
  id: string;
  name: string;
  phone: string | null;
};

export function ClientFields({
  formId,
  embedded = false,
  client,
}: {
  formId: string;
  embedded?: boolean;
  client?: Client;
}) {
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
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
        <Input id={`${formId}-telegram-username`} name={fieldName('telegramUsername')} placeholder='@username' defaultValue={client?.telegramUsername ?? ''} />
      </FormField>
      {embedded && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          aria-expanded={showAdditionalFields}
          aria-controls={`${formId}-additional-fields`}
          onClick={() => setShowAdditionalFields(!showAdditionalFields)}
        >
          {showAdditionalFields ? 'Скрыть дополнительные поля' : 'Показать дополнительные поля'}
        </Button>
      )}
      <div id={`${formId}-additional-fields`} hidden={embedded && !showAdditionalFields} className="space-y-4">
      <FormField id={`${formId}-language`} label='Предпочитаемый язык'>
        <Select id={`${formId}-language`} name={fieldName('preferredLanguage')} defaultValue={client?.preferredLanguage ?? 'ru'}>
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
      </div>
    </>
  );
}

export function PetFields({ formId, clientId, clients, pet, hideClientSelection = false, onCreateClient, embedded = false }: {
  formId: string;
  embedded?: boolean;
  clientId?: string;
  clients?: ClientOption[];
  pet?: Pet;
  hideClientSelection?: boolean;
  onCreateClient?: () => void;
}) {
  const fieldName = (name: string) =>
    embedded ? `newPet${name.charAt(0).toUpperCase()}${name.slice(1)}` : name;

  return (
    <>
      {hideClientSelection ? <input type='hidden' name={fieldName('clientId')} value={clientId} /> : (
        <>
          <FormField id={`${formId}-client`} label='Клиент' required>
            <ClientSelect key={`${clientId}-${clients?.length ?? 0}`} id={`${formId}-client`} clients={clients} defaultClientId={clientId} disabled={Boolean(pet)} />
            {!pet && onCreateClient && <Button type="button" variant="outline" className="mt-2 w-full" onClick={onCreateClient}>Создать нового клиента</Button>}
          </FormField>
        </>
      )}
      <FormField id={`${formId}-name`} label='Кличка' required><Input id={`${formId}-name`} name={fieldName('name')} defaultValue={pet?.name} required /></FormField>
      <FormField id={`${formId}-photo`} label='Фотография'>
        <Input id={`${formId}-photo`} name={fieldName('photo')} type='file' accept='image/*' />
        {pet?.photoPath && <div className='space-y-1 text-xs text-muted-foreground'><p className='break-all'>{pet.photoPath}</p><p>Новый файл заменит текущую фотографию.</p></div>}
      </FormField>
      <FormField id={`${formId}-species`} label='Вид' required><Select id={`${formId}-species`} name={fieldName('species')} required defaultValue={pet?.species ?? 'dog'}><option value='dog'>Собака</option><option value='cat'>Кошка</option></Select></FormField>
      <FormField id={`${formId}-breed`} label='Порода'><Input id={`${formId}-breed`} name={fieldName('breed')} defaultValue={pet?.breed ?? ''} /></FormField>
      <FormField id={`${formId}-birth-date`} label='Дата рождения'>{pet ? <Input id={`${formId}-birth-date`} name={fieldName('birthDate')} type='date' defaultValue={pet.birthDate ?? ''} /> : <DatePicker id={`${formId}-birth-date`} name={fieldName('birthDate')} />}</FormField>
      <FormField id={`${formId}-sex`} label='Пол' required><Select id={`${formId}-sex`} name={fieldName('sex')} required defaultValue={pet?.sex ?? 'male'}><option value='male'>Самец</option><option value='female'>Самка</option></Select></FormField>
      <FormField id={`${formId}-grooming-plan`} label='План груминга'><Textarea id={`${formId}-grooming-plan`} name={fieldName('groomingPlan')} defaultValue={pet?.groomingPlan ?? ''} /></FormField>
      <FormField id={`${formId}-interval`} label='Рекомендуемый интервал, дней'><Input id={`${formId}-interval`} name={fieldName('recommendedIntervalDays')} type='number' min='1' defaultValue={pet?.recommendedIntervalDays ?? ''} /></FormField>
      <FormField id={`${formId}-notes`} label='Заметки'><Textarea id={`${formId}-notes`} name={fieldName('notes')} defaultValue={pet?.notes ?? ''} /></FormField>
    </>
  );
}

function ClientSelect({ id, clients, defaultClientId, disabled = false }: { id: string; clients?: ClientOption[]; defaultClientId?: string; disabled?: boolean }) {
  const initialClient = clients?.find((client) => client.id === defaultClientId);
  const [query, setQuery] = useState(initialClient ? formatClientOption(initialClient) : '');
  const [selectedClientId, setSelectedClientId] = useState(initialClient?.id ?? '');
  const listId = `${id}-options`;

  return <><Input id={id} list={listId} value={query} placeholder={clients ? 'Начните вводить имя или телефон' : 'Загрузка клиентов...'} disabled={!clients || disabled} required={!disabled} onChange={(event) => { const value = event.target.value; const selectedClient = clients?.find((client) => formatClientOption(client) === value); setQuery(value); setSelectedClientId(selectedClient?.id ?? ''); }} /><input type='hidden' name='clientId' value={selectedClientId} /><datalist id={listId}>{clients?.map((client) => <option key={client.id} value={formatClientOption(client)} />)}</datalist></>;
}

export function formatClientOption(client: ClientOption) {
  return client.phone ? `${client.name} — ${client.phone}` : client.name;
}

export function GroomingServiceFields({ formId, service }: { formId: string; service?: GroomingService }) {
  return <>
    <FormField id={`${formId}-name`} label='Название' required><Input id={`${formId}-name`} name='name' defaultValue={service?.name} required /></FormField>
    <FormField id={`${formId}-description`} label='Описание'><Textarea id={`${formId}-description`} name='description' defaultValue={service?.description ?? ''} /></FormField>
    <FormField id={`${formId}-price`} label='Стоимость по умолчанию'><Input id={`${formId}-price`} name='defaultPrice' type='number' min='0' step='0.01' defaultValue={service?.defaultPrice ?? ''} /></FormField>
    <FormField id={`${formId}-duration`} label='Продолжительность, минут'><Input id={`${formId}-duration`} name='defaultDurationMinutes' type='number' min='1' defaultValue={service?.defaultDurationMinutes ?? ''} /></FormField>
    <label className='flex items-center gap-3 text-sm font-medium'><input name='active' type='checkbox' defaultChecked={service?.active ?? true} className='size-4 accent-primary' />Активная услуга</label>
  </>;
}
