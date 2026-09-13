'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import { siteLabels } from '@/lib/i18n/site';

export function TimePicker({
  id,
  name,
  defaultValue = '',
  labels = siteLabels.ru.bookingForm.booking,
  required = false,
  hoursOnly = false,
  startHour = 0,
  after,
  onValueChange,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  labels?: { hours: string; minutes: string };
  required?: boolean;
  hoursOnly?: boolean;
  startHour?: number;
  after?: string;
  onValueChange?: (value: string) => void;
}) {
  const [defaultHours = '', defaultMinutes = ''] = defaultValue.split(':');
  const [hours, setHours] = useState(defaultHours);
  const [minutes, setMinutes] = useState(hoursOnly ? '00' : defaultMinutes);
  const value = hours && minutes ? `${hours}:${minutes}` : '';
  const [afterHours = '', afterMinutes = ''] = after?.split(':') ?? [];

  function updateHours(nextHours: string) {
    let nextMinutes = hoursOnly ? '00' : minutes;

    if (nextHours && !nextMinutes) {
      nextMinutes =
        nextHours === afterHours && afterMinutes
          ? String(Number(afterMinutes) + 1).padStart(2, '0')
          : '00';
    }

    setHours(nextHours);
    setMinutes(nextMinutes);
    onValueChange?.(nextHours && nextMinutes ? `${nextHours}:${nextMinutes}` : '');
  }

  function updateMinutes(nextMinutes: string) {
    setMinutes(nextMinutes);
    onValueChange?.(hours && nextMinutes ? `${hours}:${nextMinutes}` : '');
  }

  return (
    <div className={cn('grid gap-2', !hoursOnly && 'grid-cols-2')}>
      <TimeSelect
        id={id}
        aria-label={labels.hours}
        value={hours}
        required={required}
        onChange={(event) => updateHours(event.target.value)}
      >
        <option value=''>{labels.hours}</option>
        {Array.from({ length: 24 - startHour }, (_, index) => String(startHour + index).padStart(2, '0')).map((hour) => (
          <option
            key={hour}
            value={hour}
            disabled={
              Boolean(afterHours) &&
              (Number(hour) < Number(afterHours) ||
                (hour === afterHours && (hoursOnly || Number(afterMinutes) === 59)))
            }
          >
            {hoursOnly ? `${hour}:00` : hour}
          </option>
        ))}
      </TimeSelect>

      {!hoursOnly && (
        <TimeSelect
          id={`${id}-minutes`}
          aria-label={labels.minutes}
          value={minutes}
          required={required}
          onChange={(event) => updateMinutes(event.target.value)}
        >
          <option value=''>{labels.minutes}</option>
          {Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, '0')).map((minute) => (
            <option
              key={minute}
              value={minute}
              disabled={
                hours === afterHours && Boolean(afterMinutes) && Number(minute) <= Number(afterMinutes)
              }
            >
              {minute}
            </option>
          ))}
        </TimeSelect>
      )}

      <input type='hidden' name={name} value={value} />
    </div>
  );
}

function TimeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'h-9 min-w-0 rounded-4xl border border-input bg-white px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:bg-muted/50 dark:bg-white dark:text-black dark:disabled:bg-muted/50 dark:disabled:text-foreground',
        className,
      )}
      {...props}
    />
  );
}
