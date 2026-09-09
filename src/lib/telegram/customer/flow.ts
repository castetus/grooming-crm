import type {
  TelegramCallbackQuery,
  TelegramMessage,
  StartBookingParams,
} from './types';

import {
  BOT_MESSAGES,
  getBookingConfirmationMessage,
  sendCustomerMessage,
} from './messages';

import {
  createBookingSession,
  deleteBookingSession,
  getBookingSession,
  updateBookingSession,
} from './session';
import { confirmBooking } from './confirm-booking';

export async function startBooking({
  telegramUserId,
  telegramUsername,
  chatId,
  firstName,
}: StartBookingParams) {
  await createBookingSession({
    telegramUserId,
    chatId,
    step: 'CLIENT_NAME_CONFIRM',
    data: {
      clientName: firstName,
      telegramUsername,
    },
  });

  await sendCustomerMessage(
    chatId,
    BOT_MESSAGES.confirmClientName(firstName),
    {
      inline_keyboard: [
        [
          {
            text: 'Да, всё верно',
            callback_data: 'client_name:confirm',
          },
        ],
        [
          {
            text: 'Ввести другое имя',
            callback_data: 'client_name:change',
          },
        ],
      ],
    },
  );

}

export async function handleBookingMessage(
  message: TelegramMessage,
) {
  if (!message.from || !message.text) {
    return;
  }

  const telegramUserId = message.from.id;
  const chatId = message.chat.id;
  const value = message.text.trim();

  const session = await getBookingSession(telegramUserId);

  if (session) {
    const updatedAt = new Date(session.updated_at).getTime();
    const now = Date.now();

    const isExpired =
      now - updatedAt > 24 * 60 * 60 * 1000;

    if (isExpired) {
      await deleteBookingSession(telegramUserId);
    }
  }

  if (!session) {
    await sendCustomerMessage(
      chatId,
      BOT_MESSAGES.startFirst,
    );

    return;
  }

  switch (session.step) {
    case 'CLIENT_NAME': {
      await updateBookingSession(telegramUserId, {
        // step: 'PHONE',
        step: 'PET_NAME',
        data: {
          ...session.data,
          clientName: value,
        },
      });

      await sendCustomerMessage(
        chatId,
        // BOT_MESSAGES.askPhone,
        BOT_MESSAGES.askPetName,
      );

      return;
    }

    // case 'PHONE': {
    //   await updateBookingSession(telegramUserId, {
    //     step: 'PET_NAME',
    //     data: {
    //       ...session.data,
    //       phone: value,
    //     },
    //   });
    //
    //   await sendCustomerMessage(
    //     chatId,
    //     BOT_MESSAGES.askPetName,
    //   );
    //
    //   return;
    // }

    case 'PET_NAME': {
      await updateBookingSession(telegramUserId, {
        step: 'SPECIES',
        data: {
          ...session.data,
          petName: value,
        },
      });

      await sendCustomerMessage(
        chatId,
        BOT_MESSAGES.askSpecies,
        {
          inline_keyboard: [
            [
              {
                text: '🐶 Собака',
                callback_data: 'species:dog',
              },
              {
                text: '🐱 Кошка',
                callback_data: 'species:cat',
              },
            ],
          ],
        },
      );

      return;
    }

    case 'BREED': {
      await updateBookingSession(telegramUserId, {
        step: 'SEX',
        data: {
          ...session.data,
          breed: value,
        },
      });

      await sendCustomerMessage(
        chatId,
        BOT_MESSAGES.askSex,
        {
          inline_keyboard: [
            [
              {
                text: '♂ Мальчик',
                callback_data: 'sex:male',
              },
              {
                text: '♀ Девочка',
                callback_data: 'sex:female',
              },
            ],
          ],
        },
      );

      return;
    }

    case 'DATE': {
      await updateBookingSession(telegramUserId, {
        step: 'NOTES',
        data: {
          ...session.data,
          requestedDateTime: value,
        },
      });

      await sendCustomerMessage(
        chatId,
        BOT_MESSAGES.askNotes,
      );

      return;
    }

    case 'NOTES': {
      const notes = value === '-' ? undefined : value;
      const data = {
        ...session.data,
        notes,
      };

      await updateBookingSession(telegramUserId, {
        step: 'CONFIRM',
        data,
      });

      await sendCustomerMessage(
        chatId,
        getBookingConfirmationMessage(data),
        {
          inline_keyboard: [
            [
              {
                text: '✅ Подтвердить',
                callback_data: 'booking:confirm',
              },
            ],
            [
              {
                text: '❌ Отменить',
                callback_data: 'booking:cancel',
              },
            ],
          ],
        },
      );

      return;
    }

    default:
      return;
  }
}

export async function handleBookingCallback(
  callback: TelegramCallbackQuery,
) {
  const telegramUserId = callback.from.id;
  const chatId = callback.message?.chat.id;
  const data = callback.data;

  if (!chatId || !data) {
    return;
  }

  if (data === 'booking:start' && callback.message) {
    await startBooking({
      telegramUserId: callback.from.id,
      telegramUsername: callback.from.username ?? null,
      chatId,
      firstName: callback.from.first_name,
    });

    return;
  }

  const session = await getBookingSession(telegramUserId);

  if (!session) {
    await sendCustomerMessage(
      chatId,
      BOT_MESSAGES.startFirst,
    );

    return;
  }

  if (session.step === 'CLIENT_NAME_CONFIRM') {
    if (data === 'client_name:confirm') {
      await updateBookingSession(telegramUserId, {
        // step: 'PHONE',
        step: 'PET_NAME',
      });

      await sendCustomerMessage(
        chatId,
        // BOT_MESSAGES.askPhone,
        BOT_MESSAGES.askPetName,
      );
    } else if (data === 'client_name:change') {
      await updateBookingSession(telegramUserId, {
        step: 'CLIENT_NAME',
      });

      await sendCustomerMessage(
        chatId,
        BOT_MESSAGES.askClientName,
      );
    }

    return;
  }

  if (
    session.step === 'SPECIES' &&
    data.startsWith('species:')
  ) {
    const species = data.split(':')[1];

    await updateBookingSession(telegramUserId, {
      step: 'BREED',
      data: {
        ...session.data,
        species,
      },
    });

    await sendCustomerMessage(
      chatId,
      BOT_MESSAGES.askBreed,
    );

    return;
  }

  if (
    session.step === 'SEX' &&
    data.startsWith('sex:')
  ) {
    const sex = data.split(':')[1];

    await updateBookingSession(telegramUserId, {
      step: 'DATE',
      data: {
        ...session.data,
        sex,
      },
    });

    await sendCustomerMessage(
      chatId,
      BOT_MESSAGES.askDate,
    );

    return;
  }

  if (
    session.step === 'CONFIRM' &&
    data === 'booking:cancel'
  ) {
    await deleteBookingSession(telegramUserId);

    await sendCustomerMessage(
      chatId,
      BOT_MESSAGES.bookingCancelled,
    );

    return;
  }

  if (
  session.step === 'CONFIRM' &&
  data === 'booking:confirm'
    ) {
      await confirmBooking(session);

      await deleteBookingSession(telegramUserId);

      await sendCustomerMessage(
        chatId,
        BOT_MESSAGES.bookingCreated,
      );

      return;
    }
}
