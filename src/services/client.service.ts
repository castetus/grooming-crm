import { createClient } from '@/lib/supabase/server';
import type { Client, PreferredLanguage } from '@/types/entities';
import { mapClient } from './mappers';

export interface CreateClientInput {
  name: string;
  phone?: string | null;
  telegramUsername?: string | null;
  telegramChatId?: number | null;
  preferredLanguage?: PreferredLanguage;
  address?: string | null;
  notes?: string | null;
}

export type UpdateClientInput = Partial<CreateClientInput>;

export async function getClients(): Promise<Client[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .is('archived_at', null)
    .order('name');

  if (error) throw error;

  return data.map(mapClient);
}

export async function getClientById(id: string): Promise<Client | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;

  return data ? mapClient(data) : null;
}

export async function createClientEntity(
  input: CreateClientInput,
): Promise<Client> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clients')
    .insert({
      name: input.name,
      phone: input.phone ?? null,
      telegram_username: input.telegramUsername ?? null,
      telegram_chat_id: input.telegramChatId ?? null,
      preferred_language: input.preferredLanguage ?? 'ru',
      address: input.address ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return mapClient(data);
}

export async function updateClient(
  id: string,
  input: UpdateClientInput,
): Promise<Client> {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {};

  if (input.name !== undefined) payload.name = input.name;
  if (input.phone !== undefined) payload.phone = input.phone;
  if (input.telegramUsername !== undefined) {
    payload.telegram_username = input.telegramUsername;
  }
  if (input.telegramChatId !== undefined) {
    payload.telegram_chat_id = input.telegramChatId;
  }
  if (input.preferredLanguage !== undefined) {
    payload.preferred_language = input.preferredLanguage;
  }
  if (input.address !== undefined) payload.address = input.address;
  if (input.notes !== undefined) payload.notes = input.notes;

  const { data, error } = await supabase
    .from('clients')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapClient(data);
}

export async function archiveClient(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('archive_client', {
    target_client_id: id,
  });

  if (error) throw error;
}

export async function restoreClient(id: string): Promise<Client> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clients')
    .update({
      archived_at: null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapClient(data);
}

export async function getArchivedClients(): Promise<Client[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .not('archived_at', 'is', null)
    .order('name');

  if (error) throw error;

  return data.map(mapClient);
}