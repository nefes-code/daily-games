import { db } from "@/lib/db";
import { gameResults, games, users } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { auth } from "@/lib/auth";
import { eq, and, desc, inArray } from "drizzle-orm";
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
      with: {
        user: true,
        registeredBy: true,
        game: true,
        reactions: { with: { user: true } },
      },
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

    if (!body.playedAt || !body.gameId) {
      return apiError("playedAt e gameId são obrigatórios", 400);
    }

    const registeredById = session.user.id;

    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, body.gameId));
    if (!game) return apiError("Jogo não encontrado", 404);

    const playedAt = new Date(body.playedAt);

    // Normalizar: aceita rounds[] ou value (backward compat)
    const rounds: Array<{
      round: number;
      value: number;
      status?: "WIN" | "LOSS";
    }> =
      body.rounds ??
      (body.value !== undefined
        ? [{ round: 1, value: body.value, status: body.status }]
        : []);

    if (rounds.length === 0) {
      return apiError("Pelo menos um resultado é necessário", 400);
    }

    // Validar (ignora max para rodadas LOSS — valor intencional acima do max)
    for (const r of rounds) {
      if (
        r.status !== "LOSS" &&
        game.resultMax !== null &&
        r.value > game.resultMax
      ) {
        return apiError(
          `Valor ${r.value} excede o máximo permitido (${game.resultMax})`,
          422,
        );
      }
    }

    // Deduplicação por (gameId, playedAt, userId, round)
    for (const r of rounds) {
      const conditions = [
        eq(gameResults.gameId, body.gameId),
        eq(gameResults.playedAt, playedAt),
        eq(gameResults.round, r.round),
      ];
      if (body.userId) {
        conditions.push(eq(gameResults.userId, body.userId));
      }
      const [existing] = await db
        .select()
        .from(gameResults)
        .where(and(...conditions));
      if (existing) {
        return apiError(
          `Resultado já registrado para a rodada ${r.round} nesse dia`,
          409,
        );
      }
    }

    // Inserir todas as rodadas
    const insertedIds: string[] = [];
    for (const r of rounds) {
      const [result] = await db
        .insert(gameResults)
        .values({
          value: r.value,
          playedAt,
          gameId: body.gameId,
          userId: body.userId ?? null,
          registeredById,
          round: r.round,
          status: r.status ?? null,
        })
        .returning();
      insertedIds.push(result.id);
    }

    // Retorna com relations
    const full = await db.query.gameResults.findMany({
      where: inArray(gameResults.id, insertedIds),
      with: {
        user: true,
        registeredBy: true,
        game: true,
        reactions: { with: { user: true } },
      },
    });

    return Response.json(full.length === 1 ? full[0] : full, { status: 201 });
  } catch (error) {
    console.error("POST /api/results", error);
    return apiError("Erro ao registrar resultado");
  }
}
