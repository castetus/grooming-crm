import type { TelegramMessage } from './types';
import {
  createBookingSession,
  getBookingSession,
  updateBookingSession,
} from './session';
import { sendCustomerMessage } from './messages';

export async function startBooking(message: TelegramMessage) {
  if (!message.from) {
    return;
  }

  console.log('START BOOKING', {
    userId: message.from?.id,
    chatId: message.chat.id,
  });

  const telegramUserId = message.from.id;
  const chatId = message.chat.id;

  // Позже здесь сначала проверим Client по telegramUserId.
  // Пока запускаем полный flow нового клиента.

  await createBookingSession({
    telegramUserId,
    chatId,
    step: 'CLIENT_NAME',
  });

  console.log('SEND CUSTOMER MESSAGE', chatId);

  await sendCustomerMessage(
    chatId,
    'Как вас зовут?',
  );
}

export async function handleBookingMessage(
  message: TelegramMessage,
) {
  if (!message.from || !message.text) {
    return;
  }

  const telegramUserId = message.from.id;

  const session = await getBookingSession(telegramUserId);

  if (!session) {
    await sendCustomerMessage(
      message.chat.id,
      'Чтобы начать запись, отправьте /start',
    );

    return;
  }

  switch (session.step) {
    case 'CLIENT_NAME': {
      const clientName = message.text.trim();

      if (!clientName) {
        await sendCustomerMessage(
          message.chat.id,
          'Введите имя.',
        );

        return;
      }

      await updateBookingSession(telegramUserId, {
        step: 'PHONE',
        data: {
          ...session.data,
          clientName,
        },
      });

      await sendCustomerMessage(
        message.chat.id,
        'Теперь отправьте номер телефона.',
      );

      return;
    }

    case 'PHONE': {
      const phone = message.text.trim();

      await updateBookingSession(telegramUserId, {
        step: 'PET_NAME',
        data: {
          ...session.data,
          phone,
        },
      });

      await sendCustomerMessage(
        message.chat.id,
        'Как зовут питомца?',
      );

      return;
    }

    case 'PET_NAME': {
      const petName = message.text.trim();

      await updateBookingSession(telegramUserId, {
        step: 'SPECIES',
        data: {
          ...session.data,
          petName,
        },
      });

      await sendCustomerMessage(
        message.chat.id,
        'Питомец — собака или кошка?',
      );

      return;
    }

    default:
      await sendCustomerMessage(
        message.chat.id,
        `Текущий шаг: ${session.step}`,
      );
  }
}