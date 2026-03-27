import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-helpers";
import type { CreateGameInput } from "@/services/types";

export async function GET() {
  const games = await prisma.game.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return Response.json(games);
}

export async function POST(request: Request) {
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
}
