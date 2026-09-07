import type { TelegramUpdate } from './types';
import {
  handleBookingMessage,
  startBooking,
} from './flow';

export async function handleCustomerTelegramUpdate(
  update: TelegramUpdate,
) {
  const message = update.message;

  if (!message) {
    return;
  }

  if (message.text === '/start') {
    await startBooking(message);
    return;
  }

  await handleBookingMessage(message);
}