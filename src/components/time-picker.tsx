'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

export function TimePicker({
  id,
  name,
  defaultValue = '',
  required = false,
  after,
  onValueChange,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  after?: string;
  onValueChange?: (value: string) => void;
}) {
  const [defaultHours = '', defaultMinutes = ''] = defaultValue.split(':');
  const [hours, setHours] = useState(defaultHours);
  const [minutes, setMinutes] = useState(defaultMinutes);
  const value = hours && minutes ? `${hours}:${minutes}` : '';
  const [afterHours = '', afterMinutes = ''] = after?.split(':') ?? [];

  function updateHours(nextHours: string) {
    let nextMinutes = minutes;

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
    <div className='grid grid-cols-2 gap-2'>
      <TimeSelect
        id={id}
        aria-label='Часы'
        value={hours}
        required={required}
        onChange={(event) => updateHours(event.target.value)}
      >
        <option value=''>Часы</option>
        {Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0')).map((hour) => (
          <option
            key={hour}
            value={hour}
            disabled={
              Boolean(afterHours) &&
              (Number(hour) < Number(afterHours) ||
                (hour === afterHours && Number(afterMinutes) === 59))
            }
          >
            {hour}
          </option>
        ))}
      </TimeSelect>

      <TimeSelect
        id={`${id}-minutes`}
        aria-label='Минуты'
        value={minutes}
        required={required}
        onChange={(event) => updateMinutes(event.target.value)}
      >
        <option value=''>Минуты</option>
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

      <input type='hidden' name={name} value={value} />
    </div>
  );
}

function TimeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'h-9 min-w-0 rounded-xl border border-input bg-white px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:bg-muted/50 dark:bg-white dark:text-black dark:disabled:bg-muted/50 dark:disabled:text-foreground',
        className,
      )}
      {...props}
    />
  );
}
