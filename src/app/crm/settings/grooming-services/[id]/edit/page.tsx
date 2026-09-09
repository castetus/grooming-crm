import { EntityRoutePage } from '@/app/crm/entity-form/route-page';
import type { FormSearchParams } from '@/app/crm/entity-form/routes';

export default async function Page({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<FormSearchParams>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return <EntityRoutePage type="grooming-service" id={id} query={query} />;
}
