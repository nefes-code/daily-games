import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { eq } from "drizzle-orm";
import type { UpdateUserInput } from "@/services/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [user] = await db.select().from(users).where(eq(users.id, id));
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

    const [existing] = await db.select().from(users).where(eq(users.id, id));
    if (!existing) return apiError("Usuário não encontrado", 404);

    const [updated] = await db
      .update(users)
      .set(body)
      .where(eq(users.id, id))
      .returning();
    return Response.json(updated);
  } catch (error) {
    console.error("PATCH /api/users/[id]", error);
    return apiError("Erro ao atualizar usuário");
  }
}
