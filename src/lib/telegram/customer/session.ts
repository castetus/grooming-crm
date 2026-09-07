import { createClient } from '@/lib/supabase/server';
import { BookingSession, BookingSessionData, BookingStep } from './types';

export async function getBookingSession(telegramUserId: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('telegram_booking_sessions')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as BookingSession | null;
}

export async function createBookingSession({
  telegramUserId,
  chatId,
  step,
  data = {},
}: {
  telegramUserId: number;
  chatId: number;
  step: BookingStep;
  data?: BookingSessionData;
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('telegram_booking_sessions')
    .upsert({
      telegram_user_id: telegramUserId,
      chat_id: chatId,
      step,
      data,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw error;
  }
}

export async function updateBookingSession(
  telegramUserId: number,
  {
    step,
    data,
  }: {
    step?: BookingStep;
    data?: BookingSessionData;
  },
) {
  const supabase = await createClient();

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (step) {
    update.step = step;
  }

  if (data) {
    update.data = data;
  }

  const { error } = await supabase
    .from('telegram_booking_sessions')
    .update(update)
    .eq('telegram_user_id', telegramUserId);

  if (error) {
    throw error;
  }
}

export async function deleteBookingSession(telegramUserId: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('telegram_booking_sessions')
    .delete()
    .eq('telegram_user_id', telegramUserId);

  if (error) {
    throw error;
  }
}