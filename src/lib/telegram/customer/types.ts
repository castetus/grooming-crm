export type BookingStep =
  | 'CLIENT_NAME_CONFIRM'
  | 'CLIENT_NAME'
  | 'PHONE'
  | 'PET_NAME'
  | 'SPECIES'
  | 'BREED'
  | 'SEX'
  | 'LOCATION_TYPE'
  | 'DATE'
  | 'TIME'
  | 'NOTES'
  | 'CONFIRM';

export type StartBookingParams = {
  telegramUserId: number;
  telegramUsername: string | null;
  chatId: number;
  firstName: string;
};

export type BookingSessionData = {
  telegramUsername?: string | null;
  clientName?: string;
  phone?: string;
  petName?: string;
  species?: string;
  breed?: string;
  sex?: string;
  locationType?: string;
  requestedDateTime?: string;
  time?: string;
  notes?: string;

  clientId?: string;
  petId?: string;
};

export type BookingSession = {
  telegram_user_id: number;
  chat_id: number;
  step: BookingStep;
  data: BookingSessionData;
  updated_at: string;
};

export type TelegramMessage = {
  message_id: number;
  from?: {
    id: number;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  text?: string;
  contact?: {
    phone_number: string;
  };
};

export type TelegramCallbackQuery = {
  id: string;

  from: {
    id: number;
    first_name: string;
    username?: string;
  };

  data?: string;
  message?: TelegramMessage;
};

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
};
