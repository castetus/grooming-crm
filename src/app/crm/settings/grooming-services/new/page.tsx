import { EntityRoutePage } from '@/app/crm/entity-form/route-page';
import type { FormSearchParams } from '@/app/crm/entity-form/routes';

export default async function Page({ searchParams }: { searchParams: Promise<FormSearchParams> }) {
  return <EntityRoutePage type="grooming-service" query={await searchParams} />;
}
