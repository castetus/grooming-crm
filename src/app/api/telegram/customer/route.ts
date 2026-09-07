import { handleCustomerTelegramUpdate } from '@/lib/telegram/customer/handle-update';
import type { TelegramUpdate } from '@/lib/telegram/customer/types';

export async function POST(request: Request) {
  const update = (await request.json()) as TelegramUpdate;

  await handleCustomerTelegramUpdate(update);

  return Response.json({ ok: true });
}