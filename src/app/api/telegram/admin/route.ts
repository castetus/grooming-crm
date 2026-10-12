import { handleAdminTelegramUpdate } from '@/lib/telegram/admin/handle-update';
import type { AdminTelegramUpdate } from '@/lib/telegram/admin/types';
import { handleBotDatabaseError } from '@/lib/telegram/database-error';

export async function POST(request: Request) {
  const update: AdminTelegramUpdate = await request.json();
  try {
    await handleAdminTelegramUpdate(update);
  } catch (error) {
    await handleBotDatabaseError(error, update, 'admin');
  }

  return Response.json({ ok: true });
}
