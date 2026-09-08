const TELEGRAM_API_URL = 'https://api.telegram.org';

type SendTelegramMessageParams = {
  token: string;
  chatId: string | number;
  text: string;
  parseMode?: 'HTML';
  replyMarkup?: object;
};

export async function sendTelegramMessage({
  token,
  chatId,
  text,
  parseMode,
  replyMarkup,
}: SendTelegramMessageParams) {
  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        reply_markup: replyMarkup,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API error: ${error}`);
  }

  return response.json();
}