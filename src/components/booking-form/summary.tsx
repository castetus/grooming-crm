import type { Specie, Sex } from '@/types/entities';
import type { Locale } from '@/lib/i18n/config';
import type { BookingFormLabels } from './booking-form';

export type BookingDetails = {
  petName?: string;
  species?: Specie;
  breed?: string;
  sex?: Sex;
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
  const species: Record<Specie, string> = { dog: labels.pet.dog, cat: labels.pet.cat };
  const sex: Record<Sex, string> = { male: labels.pet.male, female: labels.pet.female };
  const place: Record<string, string> = { salon: labels.booking.salon, home: labels.booking.home };
  const rows = [
    { label: labels.pet.name, value: details.petName },
    { label: labels.pet.species, value: details.species ? species[details.species] : undefined },
    { label: labels.pet.breed, value: details.breed },
    { label: labels.pet.sex, value: details.sex ? sex[details.sex] : undefined },
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
