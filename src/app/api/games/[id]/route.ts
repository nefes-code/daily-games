import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-helpers";
import type { UpdateGameInput } from "@/services/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const game = await prisma.game.findUnique({ where: { id } });
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

    const game = await prisma.game.findUnique({ where: { id } });
    if (!game) return apiError("Jogo não encontrado", 404);

    const updated = await prisma.game.update({
      where: { id },
      data: body,
    });
    return Response.json(updated);
  } catch (error) {
    console.error("PATCH /api/games/[id]", error);
    return apiError("Erro ao atualizar jogo");
  }
}
