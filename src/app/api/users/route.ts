import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-helpers";
import type { CreateUserInput } from "@/services/types";

export async function GET() {
  const users = await prisma.user.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return Response.json(users);
}

export async function POST(request: Request) {
  const body: CreateUserInput = await request.json();

  if (!body.name?.trim() || !body.email?.trim()) {
    return apiError("name e email são obrigatórios", 400);
  }

  const existing = await prisma.user.findUnique({
    where: { email: body.email },
  });
  if (existing) {
    return apiError("Já existe um usuário com esse email", 409);
  }

  const user = await prisma.user.create({
    data: { name: body.name.trim(), email: body.email.trim() },
  });
  return Response.json(user, { status: 201 });
}
