import { createClient } from '@/lib/supabase/server';
import type { GroomingService } from '@/types/entities';
import { mapGroomingService } from './mappers';

export interface CreateGroomingServiceInput {
  name: string;
  description?: string | null;
  defaultPrice?: number | null;
  defaultDurationMinutes?: number | null;
  active?: boolean;
}

export type UpdateGroomingServiceInput =
  Partial<CreateGroomingServiceInput>;

export async function getGroomingServices(): Promise<GroomingService[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('grooming_services')
    .select('*')
    .order('name');

  if (error) throw error;

  return data.map(mapGroomingService);
}

export async function getActiveGroomingServices(): Promise<GroomingService[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('grooming_services')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) throw error;

  return data.map(mapGroomingService);
}

export async function getGroomingServiceById(
  id: string,
): Promise<GroomingService | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('grooming_services')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;

  return data ? mapGroomingService(data) : null;
}

export async function createGroomingService(
  input: CreateGroomingServiceInput,
): Promise<GroomingService> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('grooming_services')
    .insert({
      name: input.name,
      description: input.description ?? null,
      default_price: input.defaultPrice ?? null,
      default_duration_minutes: input.defaultDurationMinutes ?? null,
      active: input.active ?? true,
    })
    .select()
    .single();

  if (error) throw error;

  return mapGroomingService(data);
}

export async function updateGroomingService(
  id: string,
  input: UpdateGroomingServiceInput,
): Promise<GroomingService> {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {};

  if (input.name !== undefined) payload.name = input.name;
  if (input.description !== undefined) {
    payload.description = input.description;
  }
  if (input.defaultPrice !== undefined) {
    payload.default_price = input.defaultPrice;
  }
  if (input.defaultDurationMinutes !== undefined) {
    payload.default_duration_minutes = input.defaultDurationMinutes;
  }
  if (input.active !== undefined) {
    payload.active = input.active;
  }

  const { data, error } = await supabase
    .from('grooming_services')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapGroomingService(data);
}

export async function deleteGroomingService(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('grooming_services')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function archiveGroomingService(id: string): Promise<GroomingService> {
  return updateGroomingService(id, { active: false });
}
