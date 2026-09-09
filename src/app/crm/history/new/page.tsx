import { notFound } from 'next/navigation';
import { getAppointmentById } from '@/services/appointments.service';
import { searchValue, type FormSearchParams } from '../../entity-form/routes';
import { CompletionForm } from './completion-form';

export default async function Page({ searchParams }: { searchParams: Promise<FormSearchParams> }) {
  const id = searchValue(await searchParams, 'appointmentId');
  if (!id) notFound();
  const appointment = await getAppointmentById(id);
  if (!appointment || appointment.status !== 'confirmed') notFound();
  return <CompletionForm appointment={appointment} />;
}
