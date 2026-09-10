import { answerTelegramCallbackQuery } from '../client';
import { handleCreateClientCallback, handleForwardedMessage } from './forwarded-message';
import type { AdminTelegramUpdate } from './types';

export async function handleAdminTelegramUpdate(update: AdminTelegramUpdate) {
  const callback = update.callback_query;
  const message = callback?.message ?? update.message;
  if (!message) return;

  const lanaChatId = process.env.TELEGRAM_LANA_CHAT_ID;
  if (!lanaChatId) {
    throw new Error('TELEGRAM_LANA_CHAT_ID is not configured');
  }

  const sender = callback?.from ?? message.from;
  if (String(message.chat.id) !== lanaChatId || String(sender?.id) !== lanaChatId) return;

  if (callback) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('TOKEN is not configured');
    await answerTelegramCallbackQuery(token, callback.id);
    await handleCreateClientCallback(callback);
    return;
  }

  await handleForwardedMessage(message);
}
