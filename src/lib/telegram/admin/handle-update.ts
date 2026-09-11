import { answerTelegramCallbackQuery } from '../client';
import { handleCreateClientCallback, handleForwardedMessage } from './forwarded-message';
import type { AdminTelegramUpdate } from './types';

export async function handleAdminTelegramUpdate(update: AdminTelegramUpdate) {
  const callback = update.callback_query;
  const message = callback?.message ?? update.message;
  console.info('[telegram/admin] Handling update', {
    updateId: update.update_id,
    messageId: message?.message_id,
    chatId: message?.chat.id,
    senderId: (callback?.from ?? message?.from)?.id,
    hasCallback: Boolean(callback),
    forwardOrigin: message?.forward_origin?.type,
  });
  if (!message) {
    console.info('[telegram/admin] Update skipped: no message', { updateId: update.update_id });
    return;
  }

  const lanaChatId = process.env.TELEGRAM_LANA_CHAT_ID;
  if (!lanaChatId) {
    throw new Error('TELEGRAM_LANA_CHAT_ID is not configured');
  }

  const sender = callback?.from ?? message.from;
  if (String(message.chat.id) !== lanaChatId || String(sender?.id) !== lanaChatId) {
    console.warn('[telegram/admin] Update skipped: unauthorized chat or sender', {
      updateId: update.update_id,
      chatId: message.chat.id,
      senderId: sender?.id,
      expectedChatId: lanaChatId,
    });
    return;
  }
  console.info('[telegram/admin] Sender authorized', { updateId: update.update_id });

  if (callback) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('TOKEN is not configured');
    console.info('[telegram/admin] Answering callback', { callbackId: callback.id });
    await answerTelegramCallbackQuery(token, callback.id);
    console.info('[telegram/admin] Callback answered', { callbackId: callback.id });
    await handleCreateClientCallback(callback);
    return;
  }

  await handleForwardedMessage(message);
}
