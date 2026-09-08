import type {
  TelegramCallbackQuery,
  TelegramMessage,
  StartBookingParams,
} from './types';

import {
  BOT_MESSAGES,
  sendCustomerMessage,
} from './messages';

import {
  createBookingSession,
  getBookingSession,
  updateBookingSession,
} from './session';

export async function startBooking({
  telegramUserId,
  chatId,
  firstName,
}: StartBookingParams) {
  await createBookingSession({
    telegramUserId,
    chatId,
    step: 'PHONE',
    data: {
      clientName: firstName,
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

  await sendCustomerMessage(
    chatId,
    BOT_MESSAGES.askPhone,
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

  if (!session) {
    await sendCustomerMessage(
      chatId,
      BOT_MESSAGES.startFirst,
    );

    return;
  }

  switch (session.step) {

    case 'PHONE': {
      await updateBookingSession(telegramUserId, {
        step: 'PET_NAME',
        data: {
          ...session.data,
          phone: value,
        },
      });

      await sendCustomerMessage(
        chatId,
        BOT_MESSAGES.askPetName,
      );

      return;
    }

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
                text: '♂ Самец',
                callback_data: 'sex:male',
              },
              {
                text: '♀ Самка',
                callback_data: 'sex:female',
              },
            ],
          ],
        },
      );

      return;
    }

    case 'NOTES': {
      const notes = value === '-' ? undefined : value;

      await updateBookingSession(telegramUserId, {
        step: 'CONFIRM',
        data: {
          ...session.data,
          notes,
        },
      });

      await sendCustomerMessage(
        chatId,
        BOT_MESSAGES.confirm,
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
      step: 'LOCATION_TYPE',
      data: {
        ...session.data,
        sex,
      },
    });

    await sendCustomerMessage(
      chatId,
      BOT_MESSAGES.askLocationType,
      {
        inline_keyboard: [
          [
            {
              text: 'Салон',
              callback_data: 'location:salon',
            },
            {
              text: 'На дому',
              callback_data: 'location:home',
            },
          ],
        ],
      },
    );

    return;
  }

  if (
    session.step === 'LOCATION_TYPE' &&
    data.startsWith('location:')
  ) {
    const locationType = data.split(':')[1];

    await updateBookingSession(telegramUserId, {
      step: 'DATE',
      data: {
        ...session.data,
        locationType,
      },
    });

    await sendCustomerMessage(
      chatId,
      BOT_MESSAGES.askDate,
    );
  }
}