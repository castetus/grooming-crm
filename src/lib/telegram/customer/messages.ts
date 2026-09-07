import { sendTelegramMessage } from '../client';

function getToken() {
  const token = process.env.TELEGRAM_CUSTOMER_BOT_TOKEN;

  if (!token) {
    throw new Error('TELEGRAM_CUSTOMER_BOT_TOKEN is not configured');
  }

  return token;
}

export async function sendCustomerMessage(
  chatId: number,
  text: string,
) {
  return sendTelegramMessage({
    token: getToken(),
    chatId,
    text,
  });
}