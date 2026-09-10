const TELEGRAM_API_URL = 'https://api.telegram.org';

type SendTelegramMessageParams = {
  token: string;
  chatId: string | number;
  text: string;
  parseMode?: 'HTML';
  replyMarkup?: object;
  replyParameters?: { message_id: number };
};

export async function sendTelegramMessage({
  token,
  chatId,
  text,
  parseMode,
  replyMarkup,
  replyParameters,
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
        reply_parameters: replyParameters,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API error: ${error}`);
  }

  return response.json();
}
export async function answerTelegramCallbackQuery(token: string, callbackQueryId: string) {
  const response = await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  });
  if (!response.ok) {
    throw new Error(`Telegram API error: ${await response.text()}`);
  }
}
