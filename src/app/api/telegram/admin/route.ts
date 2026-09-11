import { handleAdminTelegramUpdate } from '@/lib/telegram/admin/handle-update';
import type { AdminTelegramUpdate } from '@/lib/telegram/admin/types';

export async function POST(request: Request) {
  const update: AdminTelegramUpdate = await request.json();
  await handleAdminTelegramUpdate(update);

  return Response.json({ ok: true });
}
