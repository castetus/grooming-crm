import { createClient } from "@/lib/supabase/server";
import type { GroomingSessionPhoto } from "@/types/entities";
import { mapGroomingSessionPhoto } from "./mappers";
import { deleteMedia } from "./media.service";

export interface CreateGroomingSessionPhotoInput {
  groomingSessionId: string;
  storagePath: string;
  published?: boolean;
  sortOrder?: number;
}

export interface UpdateGroomingSessionPhotoInput {
  published?: boolean;
  sortOrder?: number;
}

export async function getGroomingSessionPhotos(
  groomingSessionId: string,
): Promise<GroomingSessionPhoto[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("grooming_session_photos")
    .select("*")
    .eq("grooming_session_id", groomingSessionId)
    .order("sort_order");

  if (error) throw error;

  return data.map(mapGroomingSessionPhoto);
}

export async function createGroomingSessionPhoto(
  input: CreateGroomingSessionPhotoInput,
): Promise<GroomingSessionPhoto> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("grooming_session_photos")
    .insert({
      grooming_session_id: input.groomingSessionId,
      storage_path: input.storagePath,
      published: input.published ?? true,
      sort_order: input.sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) throw error;

  return mapGroomingSessionPhoto(data);
}

export async function updateGroomingSessionPhoto(
  id: string,
  input: UpdateGroomingSessionPhotoInput,
): Promise<GroomingSessionPhoto> {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {};

  if (input.published !== undefined) {
    payload.published = input.published;
  }

  if (input.sortOrder !== undefined) {
    payload.sort_order = input.sortOrder;
  }

  const { data, error } = await supabase
    .from("grooming_session_photos")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return mapGroomingSessionPhoto(data);
}

export async function deleteGroomingSessionPhoto(
  id: string,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("grooming_session_photos")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function removeGroomingSessionPhoto(
  id: string,
): Promise<void> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("grooming_session_photos")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (error) throw error;

  await deleteMedia(data.storage_path);

  const { error: deleteError } = await supabase
    .from("grooming_session_photos")
    .delete()
    .eq("id", id);

  if (deleteError) throw deleteError;
}