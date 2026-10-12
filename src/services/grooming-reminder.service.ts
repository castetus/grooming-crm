import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendCustomerMessage } from '@/lib/telegram/customer/messages';
import type { PreferredLanguage } from '@/types/entities';

type ReminderClient = {
  telegram_chat_id: number | null;
  telegram_user_id: number | null;
  preferred_language: PreferredLanguage;
  archived_at: string | null;
};

type ReminderPet = {
  id: string;
  name: string;
  recommended_interval_days: number | null;
  archived_at: string | null;
  clients: ReminderClient | null;
};

type ReminderSession = {
  performed_at: string;
  pets: ReminderPet | null;
};

type ReminderResult = {
  sent: number;
  failed: number;
};

const REMINDER_DAYS_BEFORE = 7;

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getReminderDate(
  performedAt: string,
  intervalDays: number,
): string {
  const date = new Date(performedAt);

  date.setUTCDate(
    date.getUTCDate() + intervalDays - REMINDER_DAYS_BEFORE,
  );

  return toDateString(date);
}

export async function sendGroomingReminders(): Promise<ReminderResult> {
  const supabase = createAdminClient();

  const today = toDateString(new Date());

  const { data: sessions, error } = await supabase
    .from('grooming_sessions')
    .select(`
      performed_at,
      pets (
        id,
        name,
        recommended_interval_days,
        archived_at,
        clients (
          telegram_chat_id,
          telegram_user_id,
          preferred_language,
          archived_at
        )
      )
    `)
    .order('performed_at', { ascending: false })
    .returns<ReminderSession[]>();

  if (error) {
    throw error;
  }

  let sent = 0;
  let failed = 0;

  const processedPets = new Set<string>();

  for (const session of sessions ?? []) {
    const pet = session.pets;
    if (!pet) {
      continue;
    }

    // Учитываем только последнюю процедуру каждого питомца
    if (processedPets.has(pet.id)) {
      continue;
    }
    processedPets.add(pet.id);

    const client = pet.clients;
    const chatId = client?.telegram_chat_id ?? client?.telegram_user_id;

    if (
      pet.archived_at ||
      !pet.recommended_interval_days ||
      !client ||
      client.archived_at ||
      !chatId
    ) {
      continue;
    }

    const reminderDate = getReminderDate(
      session.performed_at,
      pet.recommended_interval_days,
    );

    if (reminderDate !== today) {continue;}

    // Не напоминаем, если питомец уже записан
    const { data: appointments, error: appointmentError } = await supabase
      .from('appointments')
      .select('id')
      .eq('pet_id', pet.id)
      .in('status', ['pending', 'confirmed'])
      .gte('scheduled_start', `${today}T00:00:00.000Z`)
      .limit(1);

    if (appointmentError) {
      throw appointmentError;
    }

    if (appointments?.length) {continue;}

    try {
      await sendCustomerMessage(
        chatId,
        client.preferred_language === 'sr'
          ? `🐾 Uskoro je vreme za negu ljubimca ${pet.name}! Pišite nam da zakažete termin.`
          : `🐾 ${pet.name} скоро пора на груминг! Напишите нам, чтобы записаться.`,
      );

      sent++;
    } catch (error) {
      failed++;
      console.error(`Reminder failed for pet ${pet.id}:`, error);
    }
  }

  return { sent, failed };
}
