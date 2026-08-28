import { Appointment } from '@/types/entities';
import { sendTelegramMessage } from './client';

type SendGroomerMessageOptions = {
  parseMode?: 'HTML';
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
  });
}

export function formatNewAppointmentMessage(
  appointment: Appointment,
) {
  const {
    clientName,
    phone,
    telegramUsername,
    petName,
    species,
    breed,
    sex,
    scheduledStart,
    scheduledEnd,
    locationType,
    address,
    estimatedPrice,
    notes,
  } = appointment;

  const lines = [
    '🐾 <b>Новая заявка</b>',
    '',
    clientName && `<b>Клиент:</b> ${clientName}`,
    phone && `<b>Телефон:</b> <a href="tel:${phone}">${phone}</a>`,
    telegramUsername &&
      `<b>Telegram:</b> <a href="https://t.me/${telegramUsername.replace('@', '')}">${telegramUsername}</a>`,
    '',
    petName && `<b>Питомец:</b> ${petName}`,
    species && `<b>Вид:</b> ${species}`,
    breed && `<b>Порода:</b> ${breed}`,
    sex && `<b>Пол:</b> ${sex}`,
    '',
    `<b>Начало:</b> ${scheduledStart}`,
    `<b>Конец:</b> ${scheduledEnd}`,
    `<b>Формат:</b> ${locationType}`,
    address && `<b>Адрес:</b> ${address}`,
    estimatedPrice != null &&
      `<b>Цена:</b> ${estimatedPrice} RSD`,
    '',
    notes && `<b>Комментарий:</b> ${notes}`,
  ];

  return lines.filter(Boolean).join('\n');
}

export async function notifyGroomerAboutNewAppointment(
  appointment: Appointment,
) {
  const text = formatNewAppointmentMessage(appointment);

  await sendGroomerMessage(text, {
    parseMode: 'HTML',
  });
}