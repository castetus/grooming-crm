export type EntityFormType = 'appointment' | 'client' | 'pet' | 'grooming-service';

export const entityPaths = {
  appointment: '/crm/appointments',
  client: '/crm/clients',
  pet: '/crm/pets',
  'grooming-service': '/crm/settings/grooming-services',
};

export type FormSearchParams = Record<string, string | string[] | undefined>;

export function searchValue(params: FormSearchParams, key: string) {
  const value = params[key];
  return typeof value === 'string' ? value : undefined;
}

export function safeReturnTo(value?: string) {
  return value?.startsWith('/crm/') && !value.includes('\\') ? value : undefined;
}
