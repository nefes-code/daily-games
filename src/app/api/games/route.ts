import { db } from "@/lib/db";
import { games } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { eq, asc } from "drizzle-orm";
import type { CreateGameInput } from "@/services/types";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const result = await db
      .select()
      .from(games)
      .where(eq(games.active, true))
      .orderBy(asc(games.name));
    return Response.json(result);
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

    const [game] = await db
      .insert(games)
      .values({
        slug: body.slug?.trim() ? body.slug.trim() : toSlug(body.name.trim()),
        name: body.name.trim(),
        url: body.url.trim(),
        type: body.type,
        resultType: body.resultType,
        resultSuffix: body.resultSuffix ?? null,
        resultMax: body.resultMax ?? null,
        lowerIsBetter: body.lowerIsBetter ?? false,
      })
      .returning();
    return Response.json(game, { status: 201 });
  } catch (error) {
    console.error("POST /api/games", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return apiError(`Erro ao criar jogo: ${msg}`);
  }
}
