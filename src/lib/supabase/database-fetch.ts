export const DATABASE_UNAVAILABLE_CODE = 'DATABASE_UNAVAILABLE';

function unavailableResponse(details: string) {
  return Response.json({
    code: DATABASE_UNAVAILABLE_CODE,
    message: 'Database is temporarily unavailable',
    details,
    hint: '',
  }, { status: 503 });
}

export const databaseFetch: typeof fetch = async (input, init) => {
  const timeout = AbortSignal.timeout(10_000);
  const signal = init?.signal ?? (input instanceof Request ? input.signal : undefined);

  try {
    const response = await fetch(input, {
      ...init,
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    // Read the body within the timeout too, before Supabase parses it.
    const body = await response.text();
    if (response.status >= 500) {
      return unavailableResponse(`Supabase returned HTTP ${response.status}`);
    }
    return new Response(body || null, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Supabase request failed', error);
    const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : '';
    const message = timeout.aborted ? 'Database request timed out after 10 seconds' :
      error instanceof Error ? error.message : 'Database request failed';
    return unavailableResponse([message, cause].filter(Boolean).join(': '));
  }
};
