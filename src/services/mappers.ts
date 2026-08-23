import type {
  Client,
  Pet,
  Groomer,
  BookingRequest,
  Appointment,
  GroomingSession,
  GroomingService,
} from '@/types/entities';

export function mapClient(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    telegramUsername: row.telegram_username,
    telegramChatId: row.telegram_chat_id,
    preferredLanguage: row.preferred_language,
    address: row.address,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
  };
}

export function mapPet(row: any): Pet {
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
  };
}

export function mapGroomer(row: any): Groomer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapBookingRequest(row: any): BookingRequest {
  return {
    id: row.id,
    clientName: row.client_name,
    phone: row.phone,
    telegramUsername: row.telegram_username,
    preferredLanguage: row.preferred_language,
    petName: row.pet_name,
    species: row.species,
    breed: row.breed,
    sex: row.sex,
    requestedStart: row.requested_start,
    requestedEnd: row.requested_end,
    locationType: row.location_type,
    address: row.address,
    comment: row.comment,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAppointment(row: any): Appointment {
  return {
    id: row.id,
    clientId: row.client_id,
    petId: row.pet_id,
    groomerId: row.groomer_id,
    bookingRequestId: row.booking_request_id,
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

export function mapGroomingSession(row: any): GroomingSession {
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

export function mapGroomingService(row: any): GroomingService {
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