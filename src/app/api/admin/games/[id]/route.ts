import { db } from "@/lib/db";
import { games } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/admin/games/[id] — alterna o campo active do jogo */
export async function PATCH(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Não autenticado", 401);

  const ok = await isAdminAuthenticated();
  if (!ok) return apiError("Acesso admin necessário", 403);

  try {
    const { id } = await params;

    const [game] = await db.select().from(games).where(eq(games.id, id));
    if (!game) return apiError("Jogo não encontrado", 404);

    const [updated] = await db
      .update(games)
      .set({ active: !game.active })
      .where(eq(games.id, id))
      .returning();

    return Response.json(updated);
  } catch (error) {
    console.error("PATCH /api/admin/games/[id]", error);
    return apiError("Erro ao atualizar jogo");
  }
}
