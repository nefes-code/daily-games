/**
 * Retorna uma Response de erro JSON padronizada para os Route Handlers.
 */
export function apiError(message: string, status = 500): Response {
  return Response.json({ error: message }, { status });
}
