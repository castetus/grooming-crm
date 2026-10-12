import { NextRequest, NextResponse } from 'next/server';
import { sendGroomingReminders } from '@/services/grooming-reminder.service';

export async function GET(request: NextRequest) {
  const authorization = request.headers.get('authorization');

  if (
    !process.env.CRON_SECRET ||
    authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await sendGroomingReminders();

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('Grooming reminders failed:', error);

    return NextResponse.json(
      { error: 'Grooming reminders failed' },
      { status: 500 },
    );
  }
}