import { FieldError } from './field-error';
import type { FieldErrors } from './validation';
import type { BookingDetails } from './summary';
import { useId, useState } from 'react';
import { ru, srLatn } from 'react-day-picker/locale';

import { TimePicker } from '@/components/time-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import type { Locale } from '@/lib/i18n/config';
import { ChoiceButtons } from './choice-buttons';

const calendarLocales = { ru, sr: srLatn };

export type BookingStepLabels = {
  place: string;
  salon: string;
  home: string;
  date: string;
  chooseDate: string;
  time: string;
  hours: string;
  minutes: string;
  notes: string;
};

export function BookingStep({ labels, locale, onChange, errors }: { labels: BookingStepLabels; errors: FieldErrors; locale: Locale; onChange: (values: Partial<BookingDetails>) => void }) {
  const id = useId();
  const [date, setDate] = useState<Date>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [firstAvailableDate, setFirstAvailableDate] = useState<Date>();
  const dateValue = date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    : '';

  return (
    <div className="space-y-5">
      <ChoiceButtons name="locationType" label={labels.place} defaultValue="salon" onValueChange={(place) => onChange({ place })} options={[
        { value: 'salon', label: labels.salon },
        { value: 'home', label: labels.home },
      ]} />

      <div className="space-y-2">
        <Label htmlFor={`${id}-date`}>{labels.date}</Label>
        <Popover open={calendarOpen} onOpenChange={(open) => {
          if (open) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            setFirstAvailableDate(tomorrow);
          }
          setCalendarOpen(open);
        }}>
          <PopoverTrigger render={<Button id={`${id}-date`} aria-required="true" aria-invalid={Boolean(errors.scheduledDate)} aria-describedby={`${id}-date-error`} type="button" variant="outline" className="w-full justify-start bg-white text-booking-foreground hover:bg-action-soft hover:text-booking-foreground aria-expanded:bg-action-soft aria-expanded:text-booking-foreground" />}>
            {date ? date.toLocaleDateString(locale) : labels.chooseDate}
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar mode="single" locale={calendarLocales[locale]} selected={date} defaultMonth={date ?? firstAvailableDate} disabled={firstAvailableDate ? { before: firstAvailableDate } : undefined} onSelect={(selected) => {
              setDate(selected);
              onChange({ date: selected });
              setCalendarOpen(false);
            }} />
          </PopoverContent>
        </Popover>
        <input type="hidden" name="scheduledDate" value={dateValue} />
        <FieldError id={`${id}-date-error`} message={errors.scheduledDate} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${id}-time`}>{labels.time}</Label>
        <TimePicker id={`${id}-time`} name="scheduledTime" labels={labels} hoursOnly startHour={13} onValueChange={(time) => onChange({ time })} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${id}-notes`}>{labels.notes}</Label>
        <Textarea id={`${id}-notes`} name="notes" rows={4} onChange={(event) => onChange({ notes: event.target.value })} />
      </div>
    </div>
  );
}
