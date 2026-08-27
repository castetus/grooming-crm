import type { Appointment } from '@/types/entities';

import { formatRequestedDateTime } from './utils';

export function AppointmentRequestData({ appointment }: { appointment: Appointment }) {
  const isUnlinked = !appointment.clientId || !appointment.petId;
  const hasClientData = Boolean(
    !appointment.clientId
      && (appointment.clientName || appointment.phone || appointment.telegramUsername),
  );
  const hasPetData = Boolean(
    !appointment.petId
      && (appointment.petName || appointment.species || appointment.breed || appointment.sex),
  );

  if (!isUnlinked || (!hasClientData && !hasPetData && !appointment.notes)) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
      <p className="font-medium">Данные из заявки</p>
      <RequestDataField
        label="Желаемые дата и время"
        value={formatRequestedDateTime(appointment.scheduledStart, appointment.scheduledEnd)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {hasClientData && (
          <div className="space-y-2 text-sm">
            <p className="font-medium">Клиент</p>
            {appointment.clientName && (
              <RequestDataField label="Имя" value={appointment.clientName} />
            )}
            {appointment.phone && (
              <RequestDataField label="Телефон" value={appointment.phone} />
            )}
            {appointment.telegramUsername && (
              <RequestDataField label="Telegram" value={appointment.telegramUsername} />
            )}
          </div>
        )}
        {hasPetData && (
          <div className="space-y-2 text-sm">
            <p className="font-medium">Питомец</p>
            {appointment.petName && (
              <RequestDataField label="Кличка" value={appointment.petName} />
            )}
            {appointment.species && (
              <RequestDataField
                label="Вид"
                value={appointment.species === 'dog' ? 'Собака' : 'Кошка'}
              />
            )}
            {appointment.breed && (
              <RequestDataField label="Порода" value={appointment.breed} />
            )}
            {appointment.sex && (
              <RequestDataField
                label="Пол"
                value={appointment.sex === 'female' ? 'Самка' : 'Самец'}
              />
            )}
          </div>
        )}
      </div>
      {appointment.notes && (
        <RequestDataField label="Комментарий клиента" value={appointment.notes} />
      )}
    </div>
  );
}

function RequestDataField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="whitespace-pre-wrap">{value}</p>
    </div>
  );
}
