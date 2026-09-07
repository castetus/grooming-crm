import { handleCustomerTelegramUpdate } from '@/lib/telegram/customer/handle-update';
import type { TelegramUpdate } from '@/lib/telegram/customer/types';

export async function POST(request: Request) {
  const update = await request.json();

  console.log('CUSTOMER UPDATE:', update);

  await handleCustomerTelegramUpdate(update);

  console.log('CUSTOMER UPDATE HANDLED');

  return Response.json({ ok: true });
}