
import 'server-only';

import { createClient } from '@supabase/supabase-js';

export async function updateKeepalive(): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const { error } = await supabase
    .from('keepalive')
    .update({
      last_ping_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) {
    throw error;
  }
}
