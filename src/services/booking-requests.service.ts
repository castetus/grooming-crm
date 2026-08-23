import { createClient } from "@/lib/supabase/server";
import type {
  BookingRequest,
  BookingRequestStatus,
  LocationType,
  PetSex,
  PetSpecies,
  PreferredLanguage,
} from "@/types/entities";
import { mapBookingRequest } from "./mappers";

export interface CreateBookingRequestInput {
  clientName: string;
  phone?: string | null;
  telegramUsername?: string | null;
  preferredLanguage?: PreferredLanguage;

  petName: string;
  species: PetSpecies;
  breed?: string | null;
  sex: PetSex;

  requestedStart: string;
  requestedEnd?: string | null;

  locationType: LocationType;
  address?: string | null;
  comment?: string | null;
}

export type UpdateBookingRequestInput = Partial<
  CreateBookingRequestInput & {
    status: BookingRequestStatus;
  }
>;

export async function getBookingRequests(): Promise<BookingRequest[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map(mapBookingRequest);
}

export async function getBookingRequestById(
  id: string,
): Promise<BookingRequest | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data ? mapBookingRequest(data) : null;
}

export async function createBookingRequest(
  input: CreateBookingRequestInput,
): Promise<BookingRequest> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("booking_requests")
    .insert({
      client_name: input.clientName,
      phone: input.phone ?? null,
      telegram_username: input.telegramUsername ?? null,
      preferred_language: input.preferredLanguage ?? "ru",

      pet_name: input.petName,
      species: input.species,
      breed: input.breed ?? null,
      sex: input.sex,

      requested_start: input.requestedStart,
      requested_end: input.requestedEnd ?? null,

      location_type: input.locationType,
      address: input.address ?? null,
      comment: input.comment ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return mapBookingRequest(data);
}

export async function updateBookingRequest(
  id: string,
  input: UpdateBookingRequestInput,
): Promise<BookingRequest> {
  const supabase = await createClient();

  const payload: Record<string, unknown> = {};

  if (input.clientName !== undefined) payload.client_name = input.clientName;
  if (input.phone !== undefined) payload.phone = input.phone;
  if (input.telegramUsername !== undefined) {
    payload.telegram_username = input.telegramUsername;
  }
  if (input.preferredLanguage !== undefined) {
    payload.preferred_language = input.preferredLanguage;
  }
  if (input.petName !== undefined) payload.pet_name = input.petName;
  if (input.species !== undefined) payload.species = input.species;
  if (input.breed !== undefined) payload.breed = input.breed;
  if (input.sex !== undefined) payload.sex = input.sex;
  if (input.requestedStart !== undefined) {
    payload.requested_start = input.requestedStart;
  }
  if (input.requestedEnd !== undefined) {
    payload.requested_end = input.requestedEnd;
  }
  if (input.locationType !== undefined) {
    payload.location_type = input.locationType;
  }
  if (input.address !== undefined) payload.address = input.address;
  if (input.comment !== undefined) payload.comment = input.comment;
  if (input.status !== undefined) payload.status = input.status;

  const { data, error } = await supabase
    .from("booking_requests")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return mapBookingRequest(data);
}

export async function deleteBookingRequest(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("booking_requests")
    .delete()
    .eq("id", id);

  if (error) throw error;
}