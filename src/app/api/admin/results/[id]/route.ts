import { db } from "@/lib/db";
import { gameResults } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

/** DELETE /api/admin/results/[id] — exclui um resultado */
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiError("Não autenticado", 401);

  const ok = await isAdminAuthenticated();
  if (!ok) return apiError("Acesso admin necessário", 403);

  try {
    const { id } = await params;

    const [result] = await db
      .select()
      .from(gameResults)
      .where(eq(gameResults.id, id));
    if (!result) return apiError("Resultado não encontrado", 404);

    await db.delete(gameResults).where(eq(gameResults.id, id));
    return Response.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/results/[id]", error);
    return apiError("Erro ao excluir resultado");
  }
}
