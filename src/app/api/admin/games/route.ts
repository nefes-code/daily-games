import { db } from "@/lib/db";
import { games } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { auth } from "@/lib/auth";
import { asc } from "drizzle-orm";

/** GET /api/admin/games — retorna todos os jogos, incluindo inativos */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Não autenticado", 401);

  const ok = await isAdminAuthenticated();
  if (!ok) return apiError("Acesso admin necessário", 403);

  try {
    const result = await db
      .select()
      .from(games)
      .orderBy(asc(games.position), asc(games.name));
    return Response.json(result);
  } catch (error) {
    console.error("GET /api/admin/games", error);
    return apiError("Erro ao buscar jogos");
  }
}
