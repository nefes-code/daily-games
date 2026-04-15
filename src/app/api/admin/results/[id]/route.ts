import { db } from "@/lib/db";
import { gameResults } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/admin/results/[id] — atualiza value e/ou status de um resultado */
export async function PATCH(req: Request, { params }: Params) {
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

    const body = await req.json();
    const patch: Partial<typeof gameResults.$inferInsert> = {};

    if (typeof body.value === "number") patch.value = body.value;
    if (body.status === "WIN" || body.status === "LOSS") patch.status = body.status;

    if (Object.keys(patch).length === 0) return apiError("Nenhum campo válido para atualizar", 400);

    const [updated] = await db
      .update(gameResults)
      .set(patch)
      .where(eq(gameResults.id, id))
      .returning();

    return Response.json(updated);
  } catch (error) {
    console.error("PATCH /api/admin/results/[id]", error);
    return apiError("Erro ao atualizar resultado");
  }
}

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
