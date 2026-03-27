import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-helpers";
import { auth } from "@/lib/auth";
import type { SubmitResultInput } from "@/services/types";

const resultInclude = {
  user: true,
  registeredBy: true,
  game: true,
} as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId") ?? undefined;
    const date = searchParams.get("date") ?? undefined;
    const userId = searchParams.get("userId") ?? undefined;

    const results = await prisma.gameResult.findMany({
      where: {
        ...(gameId && { gameId }),
        ...(date && { playedAt: new Date(date) }),
        ...(userId && { userId }),
      },
      include: resultInclude,
      orderBy: { playedAt: "desc" },
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

    // Usa o ID do usuário logado como registeredBy
    const registeredById = session.user.id;

    const game = await prisma.game.findUnique({ where: { id: body.gameId } });
    if (!game) return apiError("Jogo não encontrado", 404);

    // Validação do resultMax quando definido
    if (game.resultMax !== null && body.value > game.resultMax) {
      return apiError(
        `Valor ${body.value} excede o máximo permitido (${game.resultMax})`,
        422,
      );
    }

    const playedAt = new Date(body.playedAt);

    // Deduplicação (a constraint do banco também garante, mas retornamos mensagem clara)
    const existing = await prisma.gameResult.findFirst({
      where: {
        gameId: body.gameId,
        playedAt,
        userId: body.userId ?? null,
      },
    });
    if (existing) {
      return apiError("Resultado já registrado para esse jogo nesse dia", 409);
    }

    const result = await prisma.gameResult.create({
      data: {
        value: body.value,
        playedAt,
        gameId: body.gameId,
        userId: body.userId ?? null,
        registeredById,
      },
      include: resultInclude,
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/results", error);
    return apiError("Erro ao registrar resultado");
  }
}
