import { db } from "@/lib/db";
import { resultReactions } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) return apiError("Autenticação necessária", 401);

    const { id: resultId } = await params;
    const { emoji } = await request.json();

    if (!emoji || typeof emoji !== "string") {
      return apiError("emoji é obrigatório", 400);
    }

    // Upsert: se já existe, troca o emoji
    await db
      .insert(resultReactions)
      .values({ resultId, userId: session.user.id, emoji })
      .onConflictDoUpdate({
        target: [resultReactions.resultId, resultReactions.userId],
        set: { emoji },
      });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("POST /api/results/[id]/reactions", error);
    return apiError("Erro ao salvar reação");
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) return apiError("Autenticação necessária", 401);

    const { id: resultId } = await params;

    await db
      .delete(resultReactions)
      .where(
        and(
          eq(resultReactions.resultId, resultId),
          eq(resultReactions.userId, session.user.id),
        ),
      );

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/results/[id]/reactions", error);
    return apiError("Erro ao remover reação");
  }
}
