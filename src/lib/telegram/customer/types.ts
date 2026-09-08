export type BookingStep =
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
  chatId: number;
  firstName: string;
};

export type BookingSessionData = {
  clientName?: string;
  phone?: string;
  petName?: string;
  species?: string;
  breed?: string;
  sex?: string;
  locationType?: string;
  date?: string;
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