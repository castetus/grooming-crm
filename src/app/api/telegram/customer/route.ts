import { sendTelegramMessage } from '@/lib/telegram/client';

export async function POST(request: Request) {
  const update = await request.json();

  const message = update.message;

  if (message?.text === '/start') {
    const token = process.env.CUSTOMER_BOT_TOKEN;

    if (!token) {
      throw new Error('TELEGRAM_CUSTOMER_BOT_TOKEN is not configured');
    }

    await sendTelegramMessage({
      token,
      chatId: message.chat.id,
      text: 'Привет! Здесь можно записаться на груминг 🐾',
    });
  }

  return Response.json({ ok: true });
}