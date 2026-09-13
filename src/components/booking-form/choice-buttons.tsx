import { useId } from 'react';
import { FieldError } from './field-error';

export function ChoiceButtons({ name, label, options, defaultValue, onValueChange, error, required = false }: {
  name: string;
  error?: string;
  required?: boolean;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  label: string;
  options: { value: string; label: string }[];
}) {
  const errorId = useId();
  return (
    <fieldset data-required={required} aria-invalid={Boolean(error)} aria-describedby={required ? errorId : undefined}>
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input type="radio" name={name} required={required} value={option.value} defaultChecked={option.value === defaultValue} onChange={() => onValueChange?.(option.value)} className="peer sr-only" />
            <span className="flex min-h-11 items-center justify-center rounded-4xl border border-input px-3 py-2 text-center typography-button peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {required && <FieldError id={errorId} message={error} />}
    </fieldset>
  );
}
