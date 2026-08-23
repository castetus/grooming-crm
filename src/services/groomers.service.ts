import { createClient } from "@/lib/supabase/server";
import type { Groomer } from "@/types/entities";
import { mapGroomer } from "./mappers";

export interface CreateGroomerInput {
  name: string;
  phone?: string | null;
  active?: boolean;
}

export type UpdateGroomerInput = Partial<CreateGroomerInput>;

export async function getGroomers(): Promise<Groomer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("groomers")
    .select("*")
    .order("name");

  if (error) throw error;

  return data.map(mapGroomer);
}

export async function getGroomerById(id: string): Promise<Groomer | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("groomers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data ? mapGroomer(data) : null;
}

export async function createGroomer(
  input: CreateGroomerInput,
): Promise<Groomer> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("groomers")
    .insert({
      name: input.name,
      phone: input.phone ?? null,
      active: input.active ?? true,
    })
    .select()
    .single();

  if (error) throw error;

  return mapGroomer(data);
}

export async function updateGroomer(
  id: string,
  input: UpdateGroomerInput,
): Promise<Groomer> {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {};

  if (input.name !== undefined) payload.name = input.name;
  if (input.phone !== undefined) payload.phone = input.phone;
  if (input.active !== undefined) payload.active = input.active;

  const { data, error } = await supabase
    .from("groomers")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return mapGroomer(data);
}

export async function deleteGroomer(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("groomers")
    .delete()
    .eq("id", id);

  if (error) throw error;
}