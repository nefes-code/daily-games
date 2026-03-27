import { db } from "@/lib/db";
import { games } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { eq, or } from "drizzle-orm";
import type { UpdateGameInput } from "@/services/types";

type Params = { params: Promise<{ slug: string }> };

async function findGame(slugOrId: string) {
  const [game] = await db
    .select()
    .from(games)
    .where(or(eq(games.slug, slugOrId), eq(games.id, slugOrId)));
  return game;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const game = await findGame(slug);
    if (!game) return apiError("Jogo não encontrado", 404);
    return Response.json(game);
  } catch (error) {
    console.error("GET /api/games/[slug]", error);
    return apiError("Erro ao buscar jogo");
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const body: UpdateGameInput = await request.json();

    const existing = await findGame(slug);
    if (!existing) return apiError("Jogo não encontrado", 404);

    const [updated] = await db
      .update(games)
      .set(body)
      .where(eq(games.id, existing.id))
      .returning();
    return Response.json(updated);
  } catch (error) {
    console.error("PATCH /api/games/[slug]", error);
    return apiError("Erro ao atualizar jogo");
  }
}
