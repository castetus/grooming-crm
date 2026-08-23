import { createClient } from '@/lib/supabase/server';
import type {
  GroomingSession,
  LocationType,
} from '@/types/entities';
import { mapGroomingSession } from './mappers';

export interface CreateGroomingSessionInput {
  appointmentId?: string | null;
  petId: string;
  groomerId?: string | null;

  performedAt?: string;
  locationType: LocationType;

  totalPrice: number;
  groomingDetails?: string | null;
  notes?: string | null;
}

export type UpdateGroomingSessionInput =
  Partial<CreateGroomingSessionInput>;

export async function getGroomingSessions(): Promise<GroomingSession[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('grooming_sessions')
    .select('*')
    .order('performed_at', { ascending: false });

  if (error) throw error;

  return data.map(mapGroomingSession);
}

export async function getGroomingSessionById(
  id: string,
): Promise<GroomingSession | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('grooming_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;

  return data ? mapGroomingSession(data) : null;
}

export async function getGroomingSessionsByPetId(
  petId: string,
): Promise<GroomingSession[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('grooming_sessions')
    .select('*')
    .eq('pet_id', petId)
    .order('performed_at', { ascending: false });

  if (error) throw error;

  return data.map(mapGroomingSession);
}

export async function createGroomingSession(
  input: CreateGroomingSessionInput,
): Promise<GroomingSession> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('grooming_sessions')
    .insert({
      appointment_id: input.appointmentId ?? null,
      pet_id: input.petId,
      groomer_id: input.groomerId ?? null,
      performed_at: input.performedAt ?? new Date().toISOString(),
      location_type: input.locationType,
      total_price: input.totalPrice,
      grooming_details: input.groomingDetails ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return mapGroomingSession(data);
}

export async function updateGroomingSession(
  id: string,
  input: UpdateGroomingSessionInput,
): Promise<GroomingSession> {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {};

  if (input.appointmentId !== undefined) {
    payload.appointment_id = input.appointmentId;
  }
  if (input.petId !== undefined) payload.pet_id = input.petId;
  if (input.groomerId !== undefined) payload.groomer_id = input.groomerId;
  if (input.performedAt !== undefined) {
    payload.performed_at = input.performedAt;
  }
  if (input.locationType !== undefined) {
    payload.location_type = input.locationType;
  }
  if (input.totalPrice !== undefined) payload.total_price = input.totalPrice;
  if (input.groomingDetails !== undefined) {
    payload.grooming_details = input.groomingDetails;
  }
  if (input.notes !== undefined) payload.notes = input.notes;

  const { data, error } = await supabase
    .from('grooming_sessions')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapGroomingSession(data);
}

export async function deleteGroomingSession(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('grooming_sessions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getGroomingSessionsByRange(
  from: string,
  to: string,
): Promise<GroomingSession[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("grooming_sessions")
    .select("*")
    .gte("performed_at", from)
    .lt("performed_at", to)
    .order("performed_at", { ascending: false });

  if (error) throw error;

  return data.map(mapGroomingSession);
}