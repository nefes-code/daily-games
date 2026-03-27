import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { eq, asc } from "drizzle-orm";
import type { CreateUserInput } from "@/services/types";

export async function GET() {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.active, true))
      .orderBy(asc(users.name));
    return Response.json(result);
  } catch (error) {
    console.error("GET /api/users", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return apiError(`Erro ao buscar usuários: ${msg}`);
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateUserInput = await request.json();

    if (!body.name?.trim() || !body.email?.trim()) {
      return apiError("name e email são obrigatórios", 400);
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email));
    if (existing) {
      return apiError("Já existe um usuário com esse email", 409);
    }

    const [user] = await db
      .insert(users)
      .values({ name: body.name.trim(), email: body.email.trim() })
      .returning();
    return Response.json(user, { status: 201 });
  } catch (error) {
    console.error("POST /api/users", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return apiError(`Erro ao criar usuário: ${msg}`);
  }
}
