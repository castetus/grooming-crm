import { sendTelegramMessage } from '../client';

function getToken() {
  const token = process.env.CUSTOMER_BOT_TOKEN;

  if (!token) {
    throw new Error('CUSTOMER_BOT_TOKEN is not configured');
  }

  return token;
}

export const BOT_MESSAGES = {
  welcome:
    'Добро пожаловать в «Франц и Феня» 🐾\n\n' +
    'Здесь вы можете записать питомца на груминг.',
  confirmClientName: (name: string) =>
    `Записать вас как «${name}»?`,
  askClientName: 'Как вас зовут?',
  askPhone: 'Отправьте номер телефона.',
  askPetName: 'Как зовут питомца?',
  askSpecies: 'Кто ваш питомец?',
  askBreed: 'Какая порода?',
  askSex: 'Укажите пол питомца.',
  askLocationType: 'Где будет проходить груминг?',
  askDate: 'Выберите дату.',
  askTime: 'Выберите время.',
  askNotes: 'Добавьте комментарий или отправьте "-" если комментариев нет.',
  confirm: 'Проверьте данные записи.',
  invalidText: 'Не понял ответ. Попробуйте ещё раз.',
  startFirst: 'Чтобы начать запись, отправьте /start',
} as const;

export function sendCustomerMessage(
  chatId: number,
  text: string,
  replyMarkup?: object,
) {
  return sendTelegramMessage({
    token: getToken(),
    chatId,
    text,
    replyMarkup,
  });
}