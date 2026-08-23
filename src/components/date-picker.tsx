'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

const months = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

export function DatePicker({
  id,
  name,
  defaultValue = '',
  futureYears = 0,
  ariaLabel = 'Дата',
  onValueChange,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  futureYears?: number;
  ariaLabel?: string;
  onValueChange?: (value: string) => void;
}) {
  const currentYear = new Date().getFullYear();
  const [defaultYear = '', defaultMonth = '', defaultDay = ''] = defaultValue.split('-');
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);
  const [day, setDay] = useState(defaultDay ? String(Number(defaultDay)) : '');
  const daysInMonth = getDaysInMonth(year, month);
  const value = year && month && day ? `${year}-${month}-${day.padStart(2, '0')}` : '';

  function updateYear(nextYear: string) {
    const nextDay = Number(day) > getDaysInMonth(nextYear, month) ? '' : day;

    setYear(nextYear);
    setDay(nextDay);
    onValueChange?.(getDateValue(nextYear, month, nextDay));
  }

  function updateMonth(nextMonth: string) {
    const nextDay = Number(day) > getDaysInMonth(year, nextMonth) ? '' : day;

    setMonth(nextMonth);
    setDay(nextDay);
    onValueChange?.(getDateValue(year, nextMonth, nextDay));
  }

  function updateDay(nextDay: string) {
    setDay(nextDay);
    onValueChange?.(getDateValue(year, month, nextDay));
  }

  return (
    <div className='grid grid-cols-[0.85fr_1.25fr_0.7fr] gap-2'>
      <DateSelect
        id={id}
        aria-label={`${ariaLabel}: год`}
        value={year}
        onChange={(event) => updateYear(event.target.value)}
      >
        <option value=''>Год</option>
        {Array.from(
          { length: 31 + futureYears },
          (_, index) => currentYear + futureYears - index,
        ).map((optionYear) => (
          <option key={optionYear} value={optionYear}>
            {optionYear}
          </option>
        ))}
      </DateSelect>

      <DateSelect
        id={`${id}-month`}
        aria-label={`${ariaLabel}: месяц`}
        value={month}
        onChange={(event) => updateMonth(event.target.value)}
      >
        <option value=''>Месяц</option>
        {months.map((monthName, index) => {
          const monthValue = String(index + 1).padStart(2, '0');

          return (
            <option key={monthValue} value={monthValue}>
              {monthName}
            </option>
          );
        })}
      </DateSelect>

      <DateSelect
        id={`${id}-day`}
        aria-label={`${ariaLabel}: день`}
        value={day}
        disabled={!year || !month}
        onChange={(event) => updateDay(event.target.value)}
      >
        <option value=''>День</option>
        {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((optionDay) => (
          <option key={optionDay} value={optionDay}>
            {optionDay}
          </option>
        ))}
      </DateSelect>

      <input type='hidden' name={name} value={value} />
    </div>
  );
}

function getDateValue(year: string, month: string, day: string) {
  return year && month && day ? `${year}-${month}-${day.padStart(2, '0')}` : '';
}

function DateSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'h-9 min-w-0 rounded-xl border border-input bg-white px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-50 dark:bg-white dark:text-black dark:disabled:bg-muted/50 dark:disabled:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

function getDaysInMonth(year: string, month: string) {
  if (!year || !month) {
    return 0;
  }

  return new Date(Number(year), Number(month), 0).getDate();
}
