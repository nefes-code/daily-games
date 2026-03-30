import { db } from "@/lib/db";
import { games } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import type { UpdateGameInput } from "@/services/types";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/games/[id]
 * Aceita um body parcial com os campos a atualizar.
 * Se o body estiver vazio, alterna apenas o campo `active`.
 */
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Não autenticado", 401);

  const ok = await isAdminAuthenticated();
  if (!ok) return apiError("Acesso admin necessário", 403);

  try {
    const { id } = await params;

    const [game] = await db.select().from(games).where(eq(games.id, id));
    if (!game) return apiError("Jogo não encontrado", 404);

    let body: Partial<UpdateGameInput & { active: boolean }> = {};
    try {
      body = await req.json();
    } catch {
      // body vazio → toggle active
    }

    const patch =
      Object.keys(body).length > 0 ? body : { active: !game.active };

    const [updated] = await db
      .update(games)
      .set(patch)
      .where(eq(games.id, id))
      .returning();

    return Response.json(updated);
  } catch (error) {
    console.error("PATCH /api/admin/games/[id]", error);
    return apiError("Erro ao atualizar jogo");
  }
}
