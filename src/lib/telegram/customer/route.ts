export async function POST(request: Request) {
  const update = await request.json();

  console.log('Telegram customer update:', update);

  return Response.json({ ok: true });
}