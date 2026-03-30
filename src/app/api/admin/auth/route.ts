import { apiError } from "@/lib/api-helpers";
import {
  ADMIN_PIN,
  COOKIE_NAME,
  createAdminToken,
  isAdminAuthenticated,
} from "@/lib/admin-auth";
import { auth } from "@/lib/auth";

/** GET /api/admin/auth — verifica se já está autenticado como admin */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Não autenticado", 401);

  const ok = await isAdminAuthenticated();
  if (!ok) return apiError("PIN admin inválido ou ausente", 401);

  return Response.json({ ok: true });
}

/** POST /api/admin/auth — valida o PIN e seta o cookie admin_token */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Não autenticado", 401);

  const body: { pin?: string } = await request.json();
  if (!body.pin || body.pin !== ADMIN_PIN) {
    return apiError("PIN inválido", 403);
  }

  const token = createAdminToken();
  const response = Response.json({ ok: true });

  response.headers.set(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400`,
  );

  return response;
}
