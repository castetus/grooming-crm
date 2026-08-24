'use server';

import { createClient } from '@/lib/supabase/server';
import { sendGroomerMessage } from '@/lib/telegram/messages';

export async function sendTestGroomerMessageAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  await sendGroomerMessage('🐾 Тестовое сообщение из CRM');
}
