import { createAdminClient } from '@/lib/supabase/admin';
import { createClientEntity, getClientByTelegramUserId } from '@/services/client.service';
import type { Client } from '@/types/entities';
import { sendGroomerMessage } from '../messages';
import type { AdminTelegramCallback, AdminTelegramMessage } from './types';

function appointmentReplyMarkup(clientId: string) {
  const baseUrl = process.env.APP_URL;
  if (!baseUrl) throw new Error('APP_URL is not configured');

  const url = new URL('/crm/appointments/new', baseUrl);
  url.searchParams.set('clientId', clientId);

  return {
    inline_keyboard: [[{ text: '📅 Создать запись в CRM', url: url.toString() }]],
  };
}

function sendExistingClient(client: Client) {
  return sendGroomerMessage([
    'Клиент уже существует:',
    '',
    `Имя: ${client.name}`,
    `Telegram: ${client.telegramUsername ? `@${client.telegramUsername.replace(/^@/, '')}` : 'Недоступно'}`,
  ].join('\n'), { replyMarkup: appointmentReplyMarkup(client.id) });
}

export async function handleForwardedMessage(message: AdminTelegramMessage) {
  const origin = message.forward_origin;

  if (origin?.type === 'user') {
    const { id, username, first_name, last_name } = origin.sender_user;
    const database = createAdminClient();
    const existing = await getClientByTelegramUserId(id, database);
    if (existing) {
      await sendExistingClient(existing);
      return;
    }

    const name = [first_name, last_name].filter(Boolean).join(' ');
    await sendGroomerMessage([
      'Найден контакт в Telegram:',
      '',
      `Имя: ${name}`,
      `Telegram: ${username ? `@${username}` : 'Недоступно'}`,
      `ID в Telegram: ${id}`,
    ].join('\n'), {
      replyParameters: { message_id: message.message_id },
      replyMarkup: {
        inline_keyboard: [[{ text: 'Создать клиента', callback_data: `client:create:${id}` }]],
      },
    });
    return;
  }

  if (origin?.type === 'hidden_user') {
    await sendGroomerMessage([
      'Telegram скрыл данные отправителя. Его имя пользователя и ID в Telegram недоступны.',
      ...(origin.sender_user_name ? ['', `Имя: ${origin.sender_user_name}`] : []),
    ].join('\n'));
  }
}

export async function handleCreateClientCallback(callback: AdminTelegramCallback) {
  const match = callback.data?.match(/^client:create:(\d+)$/);
  if (!match) return;

  const telegramUserId = Number(match[1]);
  const database = createAdminClient();
  const existing = await getClientByTelegramUserId(telegramUserId, database);
  if (existing) {
    await sendExistingClient(existing);
    return;
  }

  const origin = callback.message?.reply_to_message?.forward_origin;
  if (origin?.type !== 'user' || origin.sender_user.id !== telegramUserId) {
    await sendGroomerMessage('Контакт недоступен. Перешлите сообщение клиента ещё раз.');
    return;
  }
  const { first_name, last_name, username } = origin.sender_user;

  let client: Client;
  try {
    client = await createClientEntity({
      name: [first_name, last_name].filter(Boolean).join(' '),
      telegramUserId,
      telegramUsername: username ?? null,
    }, database);
  } catch (error) {
    // Another callback may have created this client after the lookup.
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      const existing = await getClientByTelegramUserId(telegramUserId, database);
      if (existing) {
        await sendExistingClient(existing);
        return;
      }
    }
    throw error;
  }

  await sendGroomerMessage(`✅ Клиент создан\n\nИмя: ${client.name}`, {
    replyMarkup: appointmentReplyMarkup(client.id),
  });
}
