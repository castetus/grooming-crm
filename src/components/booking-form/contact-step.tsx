import { FieldError } from './field-error';
import type { FieldErrors } from './validation';
import { useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type ContactStepLabels = {
  name: string;
  method: string;
  phone: string;
  telegram: string;
  phoneHint: string;
  telegramHint: string;
};

export function ContactStep({ labels, errors, onMethodChange }: { labels: ContactStepLabels; errors: FieldErrors; onMethodChange: () => void }) {
  const id = useId();
  const [method, setMethod] = useState<'phone' | 'telegram'>('phone');
  const [phone, setPhone] = useState('+381');
  const [telegram, setTelegram] = useState('@');

  return (
    <div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-name`}>{labels.name}</Label>
        <Input id={`${id}-name`} aria-required="true" aria-invalid={Boolean(errors.clientName)} aria-describedby={`${id}-name-error`} name="clientName" type="text" autoComplete="name" />
        <FieldError id={`${id}-name-error`} message={errors.clientName} />
      </div>

      <fieldset data-required="true">
        <legend className="mb-2 text-sm font-medium">{labels.method}</legend>
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant={method === 'phone' ? 'default' : 'outline'} aria-pressed={method === 'phone'} onClick={() => { setMethod('phone'); onMethodChange(); }} className="min-h-11">
            {labels.phone}
          </Button>
          <Button type="button" variant={method === 'telegram' ? 'default' : 'outline'} aria-pressed={method === 'telegram'} onClick={() => { setMethod('telegram'); onMethodChange(); }} className="min-h-11">
            {labels.telegram}
          </Button>
        </div>
        <FieldError id={`${id}-method-error`} />
      </fieldset>

      {method === 'phone' && (
        <div className="space-y-2">
          <Label htmlFor={`${id}-phone`}>{labels.phone}</Label>
          <Input
            id={`${id}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={phone}
            onChange={(event) => {
              const digits = event.target.value.replace(/\D/g, '').slice(0, 15);
              setPhone(digits ? `+${digits.replace(/(\d{3})(?=\d)/g, '$1 ')}` : '');
            }}
            aria-required="true" aria-invalid={Boolean(errors.phone)} aria-describedby={`${id}-phone-hint ${id}-phone-error`}
          />
          <FieldError id={`${id}-phone-error`} message={errors.phone} />
          <p id={`${id}-phone-hint`} className="typography-caption text-muted-foreground">{labels.phoneHint}</p>
        </div>
      )}

      {method === 'telegram' && (
        <div className="space-y-2">
          <Label htmlFor={`${id}-telegram`}>{labels.telegram}</Label>
          <Input
            id={`${id}-telegram`}
            name="telegramUsername"
            type="text"
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            value={telegram}
            onChange={(event) => {
              const username = event.target.value.replace(/^@/, '').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 32);
              setTelegram(`@${username}`);
            }}
            aria-required="true" aria-invalid={Boolean(errors.telegramUsername)} aria-describedby={`${id}-telegram-hint ${id}-telegram-error`}
          />
          <FieldError id={`${id}-telegram-error`} message={errors.telegramUsername} />
          <p id={`${id}-telegram-hint`} className="typography-caption text-muted-foreground">{labels.telegramHint}</p>
        </div>
      )}
    </div>
  );
}
