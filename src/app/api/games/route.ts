import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-helpers";
import type { CreateGameInput } from "@/services/types";

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
    return Response.json(games);
  } catch (error) {
    console.error("GET /api/games", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return apiError(`Erro ao buscar jogos: ${msg}`);
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateGameInput = await request.json();

    if (
      !body.name?.trim() ||
      !body.url?.trim() ||
      !body.type ||
      !body.resultType
    ) {
      return apiError("name, url, type e resultType são obrigatórios", 400);
    }

    const game = await prisma.game.create({
      data: {
        name: body.name.trim(),
        url: body.url.trim(),
        type: body.type,
        resultType: body.resultType,
        resultSuffix: body.resultSuffix ?? null,
        resultMax: body.resultMax ?? null,
        lowerIsBetter: body.lowerIsBetter ?? false,
      },
    });
    return Response.json(game, { status: 201 });
  } catch (error) {
    console.error("POST /api/games", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return apiError(`Erro ao criar jogo: ${msg}`);
  }
}
