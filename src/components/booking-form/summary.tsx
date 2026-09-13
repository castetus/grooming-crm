import type { Locale } from '@/lib/i18n/config';
import type { BookingFormLabels } from './booking-form';

export type BookingDetails = {
  petName?: string;
  species?: string;
  breed?: string;
  sex?: string;
  place?: string;
  date?: Date;
  time?: string;
  notes?: string;
};

export function BookingSummary({ details, labels, locale }: {
  details: BookingDetails;
  labels: BookingFormLabels;
  locale: Locale;
}) {
  const species: Record<string, string> = { dog: labels.pet.dog, cat: labels.pet.cat };
  const sex: Record<string, string> = { male: labels.pet.male, female: labels.pet.female };
  const place: Record<string, string> = { salon: labels.booking.salon, home: labels.booking.home };
  const rows = [
    { label: labels.pet.name, value: details.petName },
    { label: labels.pet.species, value: species[details.species ?? ''] },
    { label: labels.pet.breed, value: details.breed },
    { label: labels.pet.sex, value: sex[details.sex ?? ''] },
    { label: labels.booking.place, value: place[details.place ?? ''] },
    { label: labels.booking.date, value: details.date?.toLocaleDateString(locale) },
    { label: labels.booking.time, value: details.time },
    { label: labels.booking.notes, value: details.notes },
  ].filter(({ value }) => value?.trim());

  if (!rows.length) return null;

  return (
    <section className="mt-6 space-y-4 border-t pt-6">
      <h3 className="font-semibold">{labels.summary}</h3>
      <dl className="space-y-3 text-sm">
        {rows.map(({ label, value }) => (
          <div key={label} className="grid gap-1 sm:grid-cols-2 sm:gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="min-w-0 whitespace-pre-wrap break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
