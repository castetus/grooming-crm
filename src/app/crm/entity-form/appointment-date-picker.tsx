'use client';

import { useState } from 'react';
import { Calendar03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { ru } from 'react-day-picker/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatFormDate } from './utils';

export function AppointmentDatePicker({ id, defaultValue }: { id: string; defaultValue?: string }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    defaultValue ? new Date(`${defaultValue}T00:00:00`) : undefined,
  );

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button id={id} type="button" variant="outline" className="w-full justify-start text-left font-normal" />}>
          <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
          {date ? date.toLocaleDateString('ru-RU') : 'Выберите дату'}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            locale={ru}
            selected={date}
            defaultMonth={date}
            onSelect={(selected) => {
              setDate(selected);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      <input type="hidden" name="scheduledDate" value={date ? formatFormDate(date) : ''} />
    </>
  );
}
