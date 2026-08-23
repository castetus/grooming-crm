import { createClient } from '@/lib/supabase/server';
import type { Pet, PetSex, PetSpecies } from '@/types/entities';
import { mapPet } from './mappers';

export interface CreatePetInput {
  clientId: string;
  name: string;
  species: PetSpecies;
  breed?: string | null;
  birthDate?: string | null;
  sex: PetSex;
  groomingPlan?: string | null;
  recommendedIntervalDays?: number | null;
  notes?: string | null;
}

export type UpdatePetInput = Partial<Omit<CreatePetInput, 'clientId'>>;

export async function getPets(): Promise<Pet[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .is('archived_at', null)
    .order('name');

  if (error) throw error;

  return data.map(mapPet);
}

export async function getPetById(id: string): Promise<Pet | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;

  return data ? mapPet(data) : null;
}

export async function getPetsByClientId(clientId: string): Promise<Pet[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('client_id', clientId)
    .order('name');

  if (error) throw error;

  return data.map(mapPet);
}

export async function createPet(input: CreatePetInput): Promise<Pet> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pets')
    .insert({
      client_id: input.clientId,
      name: input.name,
      species: input.species,
      breed: input.breed ?? null,
      birth_date: input.birthDate ?? null,
      sex: input.sex,
      grooming_plan: input.groomingPlan ?? null,
      recommended_interval_days: input.recommendedIntervalDays ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return mapPet(data);
}

export async function updatePet(
  id: string,
  input: UpdatePetInput,
): Promise<Pet> {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {};

  if (input.name !== undefined) payload.name = input.name;
  if (input.species !== undefined) payload.species = input.species;
  if (input.breed !== undefined) payload.breed = input.breed;
  if (input.birthDate !== undefined) payload.birth_date = input.birthDate;
  if (input.sex !== undefined) payload.sex = input.sex;
  if (input.groomingPlan !== undefined) {
    payload.grooming_plan = input.groomingPlan;
  }
  if (input.recommendedIntervalDays !== undefined) {
    payload.recommended_interval_days = input.recommendedIntervalDays;
  }
  if (input.notes !== undefined) payload.notes = input.notes;

  const { data, error } = await supabase
    .from('pets')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapPet(data);
}

export async function archivePet(id: string): Promise<Pet> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pets')
    .update({
      archived_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapPet(data);
}

export async function restorePet(id: string): Promise<Pet> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pets')
    .update({
      archived_at: null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapPet(data);
}

export async function getArchivedPets(): Promise<Pet[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .not('archived_at', 'is', null)
    .order('name');

  if (error) throw error;

  return data.map(mapPet);
}