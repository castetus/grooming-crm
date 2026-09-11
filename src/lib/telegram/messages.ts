import { Appointment } from '@/types/entities';
import { sendTelegramMessage } from './client';

type SendGroomerMessageOptions = {
  parseMode?: 'HTML';
  replyMarkup?: object;
  replyParameters?: { message_id: number };
};

export async function sendGroomerMessage(
  text: string,
  options: SendGroomerMessageOptions = {},
) {

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TOKEN is not configured');
  }

  const chatId = process.env.TELEGRAM_LANA_CHAT_ID;
  if (!chatId) {
    throw new Error('TELEGRAM_LANA_CHAT_ID is not configured');
  }

  return sendTelegramMessage({
    token,
    chatId,
    text,
    parseMode: options.parseMode,
    replyMarkup: options.replyMarkup,
    replyParameters: options.replyParameters,
  });
}

export function formatNewAppointmentMessage(
  appointment: Appointment,
) {
  const text = (value: string | number | null | undefined) =>
    String(value ?? '—')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  const dateTime = (value: string) => new Date(value).toLocaleString('ru-RU', {
    timeZone: 'Europe/Belgrade',
    dateStyle: 'short',
    timeStyle: 'short',
  });
  const username = appointment.telegramUsername?.replace(/^@/, '');

  return [
    '🐾 <b>Новая заявка</b>',
    '',
    `<b>Клиент:</b> ${text(appointment.clientName)}`,
    `<b>Телефон:</b> ${text(appointment.phone)}`,
    username
      ? `<b>Telegram:</b> <a href="https://t.me/${encodeURIComponent(username)}">${text(appointment.telegramUsername)}</a>`
      : '<b>Telegram:</b> —',
    '',
    `<b>Питомец:</b> ${text(appointment.petName)}`,
    `<b>Вид:</b> ${text(appointment.species)}`,
    `<b>Порода:</b> ${text(appointment.breed)}`,
    `<b>Пол:</b> ${text(appointment.sex)}`,
    '',
    `<b>Начало:</b> ${text(dateTime(appointment.scheduledStart))}`,
    `<b>Конец:</b> ${text(dateTime(appointment.scheduledEnd))}`,
    `<b>Место:</b> ${text(appointment.locationType)}`,
    `<b>Адрес:</b> ${text(appointment.address)}`,
    `<b>Цена (RSD):</b> ${text(appointment.estimatedPrice)}`,
    '',
    `<b>Комментарий:</b> ${text(appointment.notes)}`,
    '',
    `<b>Создана:</b> ${text(dateTime(appointment.createdAt))}`,
    `<b>Обновлена:</b> ${text(dateTime(appointment.updatedAt))}`,
  ].join('\n');
}

export async function notifyGroomerAboutNewAppointment(
  appointment: Appointment,
) {
  const text = formatNewAppointmentMessage(appointment);

  await sendGroomerMessage(text, {
    parseMode: 'HTML',
  });
}