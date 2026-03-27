import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-helpers";
import type { UpdateUserInput } from "@/services/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return apiError("Usuário não encontrado", 404);
    return Response.json(user);
  } catch (error) {
    console.error("GET /api/users/[id]", error);
    return apiError("Erro ao buscar usuário");
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body: UpdateUserInput = await request.json();

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return apiError("Usuário não encontrado", 404);

    const updated = await prisma.user.update({
      where: { id },
      data: body,
    });
    return Response.json(updated);
  } catch (error) {
    console.error("PATCH /api/users/[id]", error);
    return apiError("Erro ao atualizar usuário");
  }
}
