import { sendTelegramMessage } from './client';

export async function sendGroomerMessage(text: string) {
  const chatId = process.env.TELEGRAM_LANA_CHAT_ID;

  if (!chatId) {
    throw new Error('TELEGRAM_LANA_CHAT_ID is not configured');
  }

  return sendTelegramMessage({
    chatId,
    text,
  });
}