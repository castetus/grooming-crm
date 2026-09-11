import { handleAdminTelegramUpdate } from '@/lib/telegram/admin/handle-update';
import type { AdminTelegramUpdate } from '@/lib/telegram/admin/types';

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  let updateId: number | undefined;
  console.info('[telegram/admin] Webhook received', { requestId });

  try {
    const update: AdminTelegramUpdate = await request.json();
    updateId = update.update_id;
    console.info('[telegram/admin] Update parsed', {
      requestId,
      updateId,
      updateTypes: Object.keys(update),
    });
    await handleAdminTelegramUpdate(update);
    console.info('[telegram/admin] Webhook completed', {
      requestId,
      updateId,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    console.error('[telegram/admin] Webhook failed', {
      requestId,
      updateId,
      durationMs: Date.now() - startedAt,
      error,
    });
    throw error;
  }

  return Response.json({ ok: true });
}
