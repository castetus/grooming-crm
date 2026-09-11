import { createAdminClient } from '@/lib/supabase/admin';
import { createClientEntity, getClientByTelegramUserId } from '@/services/client.service';
import type { Client } from '@/types/entities';
import { sendGroomerMessage } from '../messages';
import type { AdminTelegramCallback, AdminTelegramMessage } from './types';

function appointmentReplyMarkup(clientId: string) {
  console.info('[telegram/admin] Building appointment link', { clientId, hasAppUrl: Boolean(process.env.APP_URL) });
  const baseUrl = process.env.APP_URL;
  if (!baseUrl) throw new Error('APP_URL is not configured');

  const url = new URL('/crm/appointments/new', baseUrl);
  url.searchParams.set('clientId', clientId);

  return {
    inline_keyboard: [[{ text: '📅 Create appointment in CRM', url: url.toString() }]],
  };
}

function sendExistingClient(client: Client) {
  console.info('[telegram/admin] Sending existing client reply', { clientId: client.id });
  return sendGroomerMessage([
    'Client already exists:',
    '',
    `Name: ${client.name}`,
    `Telegram: ${client.telegramUsername ? `@${client.telegramUsername.replace(/^@/, '')}` : 'Not available'}`,
  ].join('\n'), { replyMarkup: appointmentReplyMarkup(client.id) });
}

export async function handleForwardedMessage(message: AdminTelegramMessage) {
  const origin = message.forward_origin;
  console.info('[telegram/admin] Processing forwarded message', {
    messageId: message.message_id,
    originType: origin?.type,
  });

  if (origin?.type === 'user') {
    const { id, username, first_name, last_name } = origin.sender_user;
    console.info('[telegram/admin] Looking up forwarded sender', { telegramUserId: id });
    const database = createAdminClient();
    const existing = await getClientByTelegramUserId(id, database);
    console.info('[telegram/admin] Sender lookup completed', { telegramUserId: id, clientId: existing?.id });
    if (existing) {
      await sendExistingClient(existing);
      return;
    }

    console.info('[telegram/admin] Sending create client prompt', { messageId: message.message_id, telegramUserId: id });
    const name = [first_name, last_name].filter(Boolean).join(' ');
    await sendGroomerMessage([
      'Telegram contact found:',
      '',
      `Name: ${name}`,
      `Telegram: ${username ? `@${username}` : 'Not available'}`,
      `Telegram ID: ${id}`,
    ].join('\n'), {
      replyParameters: { message_id: message.message_id },
      replyMarkup: {
        inline_keyboard: [[{ text: 'Create client', callback_data: `client:create:${id}` }]],
      },
    });
    return;
  }

  if (origin?.type === 'hidden_user') {
    console.info('[telegram/admin] Sender hidden by Telegram; sending explanation');
    await sendGroomerMessage([
      'Telegram hid the sender information. Their Telegram username and ID are not available.',
      ...(origin.sender_user_name ? ['', `Name: ${origin.sender_user_name}`] : []),
    ].join('\n'));
    return;
  }
  console.info('[telegram/admin] Message skipped: missing or unsupported forward origin', {
    messageId: message.message_id,
    originType: origin?.type,
  });
}

export async function handleCreateClientCallback(callback: AdminTelegramCallback) {
  const match = callback.data?.match(/^client:create:(\d+)$/);
  if (!match) {
    console.info('[telegram/admin] Callback skipped: unsupported data', { callbackId: callback.id });
    return;
  }

  const telegramUserId = Number(match[1]);
  console.info('[telegram/admin] Looking up client for callback', { callbackId: callback.id, telegramUserId });
  const database = createAdminClient();
  const existing = await getClientByTelegramUserId(telegramUserId, database);
  console.info('[telegram/admin] Callback lookup completed', { callbackId: callback.id, clientId: existing?.id });
  if (existing) {
    await sendExistingClient(existing);
    return;
  }

  const origin = callback.message?.reply_to_message?.forward_origin;
  if (origin?.type !== 'user' || origin.sender_user.id !== telegramUserId) {
    console.warn('[telegram/admin] Callback contact unavailable or mismatched', { callbackId: callback.id, telegramUserId, originType: origin?.type });
    await sendGroomerMessage('Contact unavailable. Please forward the client’s message again.');
    return;
  }
  const { first_name, last_name, username } = origin.sender_user;

  let client: Client;
  try {
    console.info('[telegram/admin] Creating client', { callbackId: callback.id, telegramUserId });
    client = await createClientEntity({
      name: [first_name, last_name].filter(Boolean).join(' '),
      telegramUserId,
      telegramUsername: username ?? null,
    }, database);
    console.info('[telegram/admin] Client created', { callbackId: callback.id, clientId: client.id });
  } catch (error) {
    console.error('[telegram/admin] Client creation failed', { callbackId: callback.id, telegramUserId, error });
    // Another callback may have created this client after the lookup.
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      console.info('[telegram/admin] Retrying lookup after duplicate client', { telegramUserId });
      const existing = await getClientByTelegramUserId(telegramUserId, database);
      if (existing) {
        await sendExistingClient(existing);
        return;
      }
    }
    throw error;
  }

  console.info('[telegram/admin] Sending client created reply', { clientId: client.id });
  await sendGroomerMessage(`✅ Client created\n\nName: ${client.name}`, {
    replyMarkup: appointmentReplyMarkup(client.id),
  });
}
