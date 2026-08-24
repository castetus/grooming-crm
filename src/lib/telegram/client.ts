const TELEGRAM_API_URL = 'https://api.telegram.org';

type SendMessageParams = {
  chatId: string | number;
  text: string;
};

export async function sendTelegramMessage({
  chatId,
  text,
}: SendMessageParams) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  }

  const response = await fetch(
    `${TELEGRAM_API_URL}/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(`Telegram API error: ${error}`);
  }

  return response.json();
}