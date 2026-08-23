export type PreferredLanguage = 'ru' | 'sr';

export type PetSpecies = 'dog' | 'cat';

export type PetSex = 'male' | 'female';

export type LocationType = 'salon' | 'mobile';

export type BookingRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'expired';

export type AppointmentStatus =
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'pending';

  export interface Client {
    id: string;
    name: string;
    phone: string | null;
    telegramUsername: string | null;
    telegramChatId: number | null;
    preferredLanguage: PreferredLanguage;
    address: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    archivedAt: string | null;
  }

  export interface Pet {
    id: string;
    clientId: string;
    name: string;
    species: PetSpecies;
    breed: string | null;
    birthDate: string | null;
    sex: PetSex;
    groomingPlan: string | null;
    recommendedIntervalDays: number | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    archivedAt: string | null;
  }

  export interface Groomer {
    id: string;
    name: string;
    phone: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  }

  export interface Appointment {
    id: string;
  
    clientId: string;
    petId: string;
    groomerId: string | null;
    bookingRequestId: string | null;
  
    scheduledStart: string;
    scheduledEnd: string;
  
    locationType: LocationType;
    address: string | null;
  
    estimatedPrice: number | null;
  
    status: AppointmentStatus;
    notes: string | null;
  
    createdAt: string;
    updatedAt: string;
  }

  export interface GroomingSession {
    id: string;
  
    appointmentId: string | null;
    petId: string;
    groomerId: string | null;
  
    performedAt: string;
  
    locationType: LocationType;
  
    totalPrice: number;
    groomingDetails: string | null;
    notes: string | null;
  
    createdAt: string;
  }

export interface GroomingService {
  id: string;
  name: string;
  description: string | null;
  defaultPrice: number | null;
  defaultDurationMinutes: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentInput {
  clientId: string;
  petId: string;
  groomerId?: string | null;

  scheduledStart: string;
  scheduledEnd: string;

  locationType: LocationType;
  address?: string | null;

  estimatedPrice?: number | null;
  status?: AppointmentStatus;
  notes?: string | null;
}

export type UpdateAppointmentInput = Partial<
  Omit<CreateAppointmentInput, "status">
>;

export interface CompleteAppointmentInput {
  totalPrice: number;
  groomingDetails?: string | null;
  notes?: string | null;
}