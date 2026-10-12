import { DATABASE_UNAVAILABLE_CODE } from '@/lib/supabase/database-fetch';
import type { AdminTelegramUpdate } from './admin/types';
import { BOT_MESSAGES, sendCustomerMessage } from './customer/messages';
import type { TelegramUpdate } from './customer/types';
import { sendGroomerMessage } from './messages';

type BotKind = 'customer' | 'admin';
type BotUpdate = TelegramUpdate | AdminTelegramUpdate;

export async function handleBotDatabaseError(error: unknown, update: BotUpdate, bot: BotKind) {
  if (typeof error !== 'object' || error === null || !('code' in error) ||
    error.code !== DATABASE_UNAVAILABLE_CODE) {
    throw error;
  }

  console.error(`${bot} bot database unavailable`, error);
  const message = update.callback_query?.message ?? update.message;
  const sender = update.callback_query?.from ?? update.message?.from;
  const details = 'details' in error && typeof error.details === 'string' ? error.details : '';
  const alert = [
    '⚠️ База данных недоступна. Бот не смог обработать запрос.',
    `Бот: ${bot}`,
    `Операция: ${update.callback_query?.data ?? 'message'}`,
    `Telegram ID: ${sender?.id ?? '—'}`,
    `Update ID: ${update.update_id}`,
    `Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Belgrade' })}`,
    `Ошибка: ${details}`,
    'Проверьте состояние проекта Supabase.',
  ].join('\n');

  const notifications = [
    { recipient: 'admin', send: () => sendGroomerMessage(alert) },
    ...(bot === 'customer' && message ? [
      { recipient: 'customer', send: () => sendCustomerMessage(message.chat.id, BOT_MESSAGES.serviceUnavailable) },
    ] : []),
  ];
  const results = await Promise.allSettled(notifications.map(async ({ send }) => send()));
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Database outage notification failed (${notifications[index].recipient})`, result.reason);
    }
  });
}
