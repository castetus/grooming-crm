// src/services/media.service.ts

import { createClient } from "@/lib/supabase/server";

const BUCKET = "grooming-media";

export async function uploadPetPhoto(
  petId: string,
  file: File,
): Promise<string> {
  const supabase = await createClient();

  const extension = getFileExtension(file);
  const path = `pets/${petId}/avatar.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) throw error;

  return path;
}

export async function uploadGroomingPhoto(
  sessionId: string,
  file: File,
): Promise<string> {
  const supabase = await createClient();

  const extension = getFileExtension(file);
  const filename = `${crypto.randomUUID()}.${extension}`;
  const path = `sessions/${sessionId}/${filename}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
    });

  if (error) throw error;

  return path;
}

export async function deleteMedia(path: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([path]);

  if (error) throw error;
}

export async function deleteMediaFiles(paths: string[]): Promise<void> {
  if (!paths.length) return;

  const supabase = await createClient();

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove(paths);

  if (error) throw error;
}

export async function getMediaUrl(path: string): Promise<string> {
  const supabase = await createClient();

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

function getFileExtension(file: File): string {
  return file.name.split(".").pop()?.toLowerCase() || "jpg";
}

export async function setPetPhoto(
  petId: string,
  file: File,
): Promise<string> {
  const path = await uploadPetPhoto(petId, file);

  const supabase = await createClient();

  const { error } = await supabase
    .from("pets")
    .update({
      photo_path: path,
    })
    .eq("id", petId);

  if (error) throw error;

  return path;
}