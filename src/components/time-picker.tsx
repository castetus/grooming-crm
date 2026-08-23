'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

export function TimePicker({
  id,
  name,
  defaultValue = '',
  required = false,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const [defaultHours = '', defaultMinutes = ''] = defaultValue.split(':');
  const [hours, setHours] = useState(defaultHours);
  const [minutes, setMinutes] = useState(defaultMinutes);
  const value = hours && minutes ? `${hours}:${minutes}` : '';

  return (
    <div className='grid grid-cols-2 gap-2'>
      <TimeSelect
        id={id}
        aria-label='Часы'
        value={hours}
        required={required}
        onChange={(event) => setHours(event.target.value)}
      >
        <option value=''>Часы</option>
        {Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0')).map((hour) => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </TimeSelect>

      <TimeSelect
        id={`${id}-minutes`}
        aria-label='Минуты'
        value={minutes}
        required={required}
        onChange={(event) => setMinutes(event.target.value)}
      >
        <option value=''>Минуты</option>
        {Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, '0')).map((minute) => (
          <option key={minute} value={minute}>
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
        'h-9 min-w-0 rounded-xl border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        className,
      )}
      {...props}
    />
  );
}
