export type FieldErrors = Partial<Record<'petName' | 'species' | 'sex' | 'scheduledDate' | 'clientName' | 'phone' | 'telegramUsername', string>>;

export type ValidationLabels = { required: string; phone: string; telegram: string };

export function validateStep(data: FormData, step: number, labels: ValidationLabels): FieldErrors {
  const value = (name: string) => String(data.get(name) ?? '').trim();
  const errors: FieldErrors = {};
  if (step === 0) {
    if (!value('petName')) errors.petName = labels.required;
    if (!value('species')) errors.species = labels.required;
    if (!value('sex')) errors.sex = labels.required;
  }
  if (step === 1 && !value('scheduledDate')) errors.scheduledDate = labels.required;
  if (step === 2) {
    if (!value('clientName')) errors.clientName = labels.required;
    if (data.has('phone')) {
      const phone = value('phone').replace(/\s/g, '');
      if (!phone || phone === '+381') errors.phone = labels.required;
      else if (!/^\+[1-9]\d{6,14}$/.test(phone)) errors.phone = labels.phone;
    }
    if (data.has('telegramUsername')) {
      const username = value('telegramUsername').replace(/^@/, '');
      if (!username) errors.telegramUsername = labels.required;
      else if (!/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(username)) errors.telegramUsername = labels.telegram;
    }
  }
  return errors;
}
