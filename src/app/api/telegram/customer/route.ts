import { handleCustomerTelegramUpdate } from '@/lib/telegram/customer/handle-update';
import type { TelegramUpdate } from '@/lib/telegram/customer/types';
import { handleBotDatabaseError } from '@/lib/telegram/database-error';

export async function POST(request: Request) {
  const update: TelegramUpdate = await request.json();

  try {
    await handleCustomerTelegramUpdate(update);
  } catch (error) {
    await handleBotDatabaseError(error, update, 'customer');
  }

  return Response.json({ ok: true });
}
