import type { TelegramUpdate } from './types';
import {
  handleBookingMessage,
  startBooking,
  handleBookingCallback,
} from './flow';
import { BOT_MESSAGES, sendCustomerMessage } from './messages';

export async function handleCustomerTelegramUpdate(
  update: TelegramUpdate,
) {
  if (update.callback_query) {
    await handleBookingCallback(update.callback_query);
    return;
  }

  const message = update.message;

  if (!message) {
    return;
  }

  if (message.text === '/start') {
    await sendCustomerMessage(
      message.chat.id,
      BOT_MESSAGES.welcome,
      {
        inline_keyboard: [
          [
            {
              text: '✂️ Записаться',
              callback_data: 'booking:start',
            },
          ],
        ],
      },
    );

    return;
  }

  await handleBookingMessage(message);
}