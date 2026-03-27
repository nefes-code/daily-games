import { db } from "@/lib/db";
import { gameResults, games, users } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { auth } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";
import type { SubmitResultInput } from "@/services/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId") ?? undefined;
    const date = searchParams.get("date") ?? undefined;
    const userId = searchParams.get("userId") ?? undefined;

    const conditions = [];
    if (gameId) conditions.push(eq(gameResults.gameId, gameId));
    if (date) conditions.push(eq(gameResults.playedAt, new Date(date)));
    if (userId) conditions.push(eq(gameResults.userId, userId));

    const results = await db.query.gameResults.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      with: { user: true, registeredBy: true, game: true },
      orderBy: [desc(gameResults.playedAt)],
    });

    return Response.json(results);
  } catch (error) {
    console.error("GET /api/results", error);
    return apiError("Erro ao buscar resultados");
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Autenticação necessária", 401);
    }

    const body: SubmitResultInput = await request.json();

    if (body.value === undefined || !body.playedAt || !body.gameId) {
      return apiError("value, playedAt e gameId são obrigatórios", 400);
    }

    const registeredById = session.user.id;

    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, body.gameId));
    if (!game) return apiError("Jogo não encontrado", 404);

    if (game.resultMax !== null && body.value > game.resultMax) {
      return apiError(
        `Valor ${body.value} excede o máximo permitido (${game.resultMax})`,
        422,
      );
    }

    const playedAt = new Date(body.playedAt);

    // Deduplicação
    const conditions = [
      eq(gameResults.gameId, body.gameId),
      eq(gameResults.playedAt, playedAt),
    ];
    if (body.userId) {
      conditions.push(eq(gameResults.userId, body.userId));
    }
    const [existing] = await db
      .select()
      .from(gameResults)
      .where(and(...conditions));
    if (existing) {
      return apiError("Resultado já registrado para esse jogo nesse dia", 409);
    }

    const [result] = await db
      .insert(gameResults)
      .values({
        value: body.value,
        playedAt,
        gameId: body.gameId,
        userId: body.userId ?? null,
        registeredById,
      })
      .returning();

    // Retorna com relations
    const [full] = await db.query.gameResults.findMany({
      where: eq(gameResults.id, result.id),
      with: { user: true, registeredBy: true, game: true },
    });

    return Response.json(full, { status: 201 });
  } catch (error) {
    console.error("POST /api/results", error);
    return apiError("Erro ao registrar resultado");
  }
}
