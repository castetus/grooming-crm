import type {
  Client,
  Pet,
  Groomer,
  Appointment,
  GroomingSession,
  GroomingService,
} from '@/types/entities';
import { GroomingSessionPhoto } from './grooming-sessions.service';

type SnakeCase<Key extends string> = Key extends `${infer First}${infer Rest}`
  ? `${First extends Lowercase<First> ? First : `_${Lowercase<First>}`}${SnakeCase<Rest>}`
  : Key;

type DatabaseRow<Entity> = {
  [Key in keyof Entity as Key extends string ? SnakeCase<Key> : Key]: Entity[Key];
};

export function mapClient(row: DatabaseRow<Client>): Client {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    telegramUsername: row.telegram_username,
    telegramChatId: row.telegram_chat_id,
    telegramUserId: row.telegram_user_id ?? null,
    preferredLanguage: row.preferred_language,
    address: row.address,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
    photoPublicationConsent: row.photo_publication_consent,
  };
}

export function mapPet(row: DatabaseRow<Pet>): Pet {
  return {
    id: row.id,
    clientId: row.client_id,
    name: row.name,
    species: row.species,
    breed: row.breed,
    birthDate: row.birth_date,
    sex: row.sex,
    groomingPlan: row.grooming_plan,
    recommendedIntervalDays: row.recommended_interval_days,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
    photoPath: row.photo_path,
  };
}

export function mapGroomer(row: DatabaseRow<Groomer>): Groomer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAppointment(row: DatabaseRow<Appointment>): Appointment {
  return {
    id: row.id,

    clientId: row.client_id,
    petId: row.pet_id,

    clientName: row.client_name,
    telegramUserId: row.telegram_user_id,
    phone: row.phone,
    telegramUsername: row.telegram_username,

    petName: row.pet_name,
    species: row.species,
    breed: row.breed,
    sex: row.sex,

    groomerId: row.groomer_id,

    scheduledStart: row.scheduled_start,
    scheduledEnd: row.scheduled_end,

    locationType: row.location_type,
    address: row.address,

    estimatedPrice: row.estimated_price,
    status: row.status,

    notes: row.notes,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapGroomingSession(row: DatabaseRow<GroomingSession>): GroomingSession {
  return {
    id: row.id,
    appointmentId: row.appointment_id,
    petId: row.pet_id,
    groomerId: row.groomer_id,
    performedAt: row.performed_at,
    locationType: row.location_type,
    totalPrice: row.total_price,
    groomingDetails: row.grooming_details,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export function mapGroomingService(row: DatabaseRow<GroomingService>): GroomingService {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    defaultPrice: row.default_price,
    defaultDurationMinutes: row.default_duration_minutes,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapGroomingSessionPhoto(
  row: DatabaseRow<GroomingSessionPhoto>,
): GroomingSessionPhoto {
  return {
    id: row.id,
    groomingSessionId: row.grooming_session_id,
    storagePath: row.storage_path,
    published: row.published,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}
