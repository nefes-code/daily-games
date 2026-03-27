import { db } from "@/lib/db";
import { games } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";
import type { UpdateGameInput } from "@/services/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [game] = await db.select().from(games).where(eq(games.id, id));
    if (!game) return apiError("Jogo não encontrado", 404);
    return Response.json(game);
  } catch (error) {
    console.error("GET /api/games/[id]", error);
    return apiError("Erro ao buscar jogo");
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body: UpdateGameInput = await request.json();

    const [existing] = await db.select().from(games).where(eq(games.id, id));
    if (!existing) return apiError("Jogo não encontrado", 404);

    const [updated] = await db
      .update(games)
      .set(body)
      .where(eq(games.id, id))
      .returning();
    return Response.json(updated);
  } catch (error) {
    console.error("PATCH /api/games/[id]", error);
    return apiError("Erro ao atualizar jogo");
  }
}
