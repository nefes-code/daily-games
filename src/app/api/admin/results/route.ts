import { db } from "@/lib/db";
import { gameResults } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { auth } from "@/lib/auth";
import { desc } from "drizzle-orm";

/** GET /api/admin/results — retorna os últimos 100 resultados com dados relacionados */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return apiError("Não autenticado", 401);

  const ok = await isAdminAuthenticated();
  if (!ok) return apiError("Acesso admin necessário", 403);

  try {
    const results = await db.query.gameResults.findMany({
      with: { user: true, registeredBy: true, game: true },
      orderBy: [desc(gameResults.createdAt)],
      limit: 100,
    });
    return Response.json(results);
  } catch (error) {
    console.error("GET /api/admin/results", error);
    return apiError("Erro ao buscar resultados");
  }
}
