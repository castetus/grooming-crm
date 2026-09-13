import { FieldError } from './field-error';
import type { FieldErrors } from './validation';
import type { BookingDetails } from './summary';
import { useId } from 'react';
import { ChoiceButtons } from './choice-buttons';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type PetStepLabels = {
  name: string;
  species: string;
  breed: string;
  sex: string;
  dog: string;
  cat: string;
  male: string;
  female: string;
};

export function PetStep({ labels, onChange, errors }: { labels: PetStepLabels; errors: FieldErrors; onChange: (values: Partial<BookingDetails>) => void }) {
  const id = useId();

  return (
    <div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-name`}>{labels.name}</Label>
        <Input id={`${id}-name`} aria-required="true" aria-invalid={Boolean(errors.petName)} aria-describedby={`${id}-name-error`} name="petName" onChange={(event) => onChange({ petName: event.target.value })} type="text" autoComplete="off" />
        <FieldError id={`${id}-name-error`} message={errors.petName} />
      </div>

      <ChoiceButtons name="species" required error={errors.species} label={labels.species} onValueChange={(species) => onChange({ species })} options={[
        { value: 'dog', label: labels.dog },
        { value: 'cat', label: labels.cat },
      ]} />

      <div className="space-y-2">
        <Label htmlFor={`${id}-breed`}>{labels.breed}</Label>
        <Input id={`${id}-breed`} name="breed" onChange={(event) => onChange({ breed: event.target.value })} type="text" autoComplete="off" />
        <FieldError id={`${id}-breed-error`} />
      </div>

      <ChoiceButtons name="sex" required error={errors.sex} label={labels.sex} onValueChange={(sex) => onChange({ sex })} options={[
        { value: 'male', label: labels.male },
        { value: 'female', label: labels.female },
      ]} />
    </div>
  );
}
