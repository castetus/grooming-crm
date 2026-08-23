import { createClient } from '@/lib/supabase/server';
import type {
  Appointment,
  AppointmentStatus,
  CompleteAppointmentInput,
  LocationType,
} from '@/types/entities';
import { mapAppointment } from './mappers';

export interface CreateAppointmentInput {
  clientId: string;
  petId: string;
  groomerId?: string | null;
  bookingRequestId?: string | null;

  scheduledStart: string;
  scheduledEnd: string;

  locationType: LocationType;
  address?: string | null;

  estimatedPrice?: number | null;
  status?: AppointmentStatus;
  notes?: string | null;
}

export type UpdateAppointmentInput = Partial<CreateAppointmentInput>;

export async function getAppointments(): Promise<Appointment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('scheduled_start');

  if (error) throw error;

  return data.map(mapAppointment);
}

export async function getAppointmentById(
  id: string,
): Promise<Appointment | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;

  return data ? mapAppointment(data) : null;
}

export async function getAppointmentsByRange(
  from: string,
  to: string,
): Promise<Appointment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .gte('scheduled_start', from)
    .lt('scheduled_start', to)
    .order('scheduled_start');

  if (error) throw error;

  return data.map(mapAppointment);
}

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<Appointment> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      client_id: input.clientId,
      pet_id: input.petId,
      groomer_id: input.groomerId ?? null,
      booking_request_id: input.bookingRequestId ?? null,

      scheduled_start: input.scheduledStart,
      scheduled_end: input.scheduledEnd,

      location_type: input.locationType,
      address: input.address ?? null,

      estimated_price: input.estimatedPrice ?? null,
      status: input.status ?? 'confirmed',
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return mapAppointment(data);
}

export async function updateAppointment(
  id: string,
  input: UpdateAppointmentInput,
): Promise<Appointment> {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {};

  if (input.clientId !== undefined) payload.client_id = input.clientId;
  if (input.petId !== undefined) payload.pet_id = input.petId;
  if (input.groomerId !== undefined) payload.groomer_id = input.groomerId;
  if (input.bookingRequestId !== undefined) {
    payload.booking_request_id = input.bookingRequestId;
  }
  if (input.scheduledStart !== undefined) {
    payload.scheduled_start = input.scheduledStart;
  }
  if (input.scheduledEnd !== undefined) {
    payload.scheduled_end = input.scheduledEnd;
  }
  if (input.locationType !== undefined) {
    payload.location_type = input.locationType;
  }
  if (input.address !== undefined) payload.address = input.address;
  if (input.estimatedPrice !== undefined) {
    payload.estimated_price = input.estimatedPrice;
  }

  if (input.notes !== undefined) payload.notes = input.notes;

  const { data, error } = await supabase
    .from('appointments')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapAppointment(data);
}

export async function deleteAppointment(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function confirmAppointment(
  id: string,
): Promise<Appointment> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appointments")
    .update({
      status: "confirmed",
    })
    .eq("id", id)
    .eq("status", "pending")
    .select()
    .single();

  if (error) throw error;

  return mapAppointment(data);
}

export async function cancelAppointment(
  id: string,
): Promise<Appointment> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appointments")
    .update({
      status: "cancelled",
    })
    .eq("id", id)
    .in("status", ["pending", "confirmed"])
    .select()
    .single();

  if (error) throw error;

  return mapAppointment(data);
}

export async function restoreAppointment(
  id: string,
): Promise<Appointment> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appointments")
    .update({
      status: "confirmed",
    })
    .eq("id", id)
    .eq("status", "cancelled")
    .select()
    .single();

  if (error) throw error;

  return mapAppointment(data);
}

export async function completeAppointment(
  id: string,
  input: CompleteAppointmentInput,
): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("complete_appointment", {
    target_appointment_id: id,
    session_total_price: input.totalPrice,
    session_grooming_details: input.groomingDetails ?? null,
    session_notes: input.notes ?? null,
  });

  if (error) throw error;

  return data;
}