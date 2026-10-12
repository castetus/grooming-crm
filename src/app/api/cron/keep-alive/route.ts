
import { NextRequest, NextResponse } from 'next/server';
import { updateKeepalive } from '@/services/keep-alive.service';

export async function GET(request: NextRequest) {
  const authorization = request.headers.get('authorization');

  if (
    !process.env.CRON_SECRET ||
    authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await updateKeepalive();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Keepalive failed:', error);

    return NextResponse.json(
      { error: 'Keepalive failed' },
      { status: 500 },
    );
  }
}
