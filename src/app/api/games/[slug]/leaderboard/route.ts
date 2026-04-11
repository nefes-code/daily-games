import { db } from "@/lib/db";
import { gameResults, games, users } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { eq, or, sql, asc, desc, gte } from "drizzle-orm";
import { thirtyDaysAgo } from "@/utils/date";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { slug } = await params;

    // Busca o jogo por slug ou id
    const [game] = await db
      .select()
      .from(games)
      .where(or(eq(games.slug, slug), eq(games.id, slug)));

    if (!game) return apiError("Jogo não encontrado", 404);

    const since = thirtyDaysAgo();

    // Cooperativo: um único resultado agregado do time
    if (game.type === "COOPERATIVE") {
      // Para multi-round: soma rodadas por dia, depois agrega os totais diários
      const [team] = await db
        .select({
          daysPlayed: sql<number>`count(*)::int`,
          bestResult: game.lowerIsBetter
            ? sql<number>`min(daily_total)`
            : sql<number>`max(daily_total)`,
          average: sql<number>`round(avg(daily_total))::int`,
        })
        .from(
          sql`(
            SELECT ${gameResults.playedAt}, sum(COALESCE(${gameResults.boostedValue}, ${gameResults.value}))::numeric as daily_total
            FROM ${gameResults}
            WHERE ${eq(gameResults.gameId, game.id)} AND ${gte(gameResults.playedAt, since)}
            GROUP BY ${gameResults.playedAt}
          ) as daily`,
        );

      return Response.json(
        team
          ? [
              {
                rank: 1,
                userId: null,
                name: "NeFEs",
                image: null,
                daysPlayed: team.daysPlayed,
                bestResult: team.bestResult,
                average: team.average,
              },
            ]
          : [],
      );
    }

    // Competitivo: agrupa por userId (últimos 30 dias)
    // Para multi-round: soma rodadas por dia por jogador, depois agrega os totais diários
    const orderDir = game.lowerIsBetter ? asc : desc;

    // Constante bayesiana: representa quantos dias de "prior" um jogador recebe antes de
    // ter sua média totalmente confiada. Com C=7, após 7 dias jogados o score já é 50%
    // média real e 50% média global — evita que quem jogou pouco domine o ranking.
    const BAYESIAN_C = 7;

    // Passo 1: calcular a média global de todos os jogadores no período (o "prior")
    const [globalRow] = await db
      .select({
        mean: sql<number>`coalesce(avg(daily_total), 0)`,
      })
      .from(
        sql`(
          SELECT sum(COALESCE(${gameResults.boostedValue}, ${gameResults.value}))::numeric as daily_total
          FROM ${gameResults}
          WHERE ${eq(gameResults.gameId, game.id)} AND ${gte(gameResults.playedAt, since)}
          GROUP BY ${gameResults.userId}, ${gameResults.playedAt}
        ) all_daily`,
      );

    const globalMean = Number(globalRow?.mean ?? 0);

    // Passo 2: buscar stats por jogador e ordenar pela média bayesiana
    // Fórmula: (C × média_global + soma_scores) / (C + dias_jogados)
    const rows = await db
      .select({
        playerId: sql<string>`player_id`,
        daysPlayed: sql<number>`count(*)::int`,
        bestResult: game.lowerIsBetter
          ? sql<number>`min(daily_total)`
          : sql<number>`max(daily_total)`,
        average: sql<number>`round(avg(daily_total))::int`,
      })
      .from(
        sql`(
          SELECT ${gameResults.userId} as player_id, ${gameResults.playedAt}, sum(COALESCE(${gameResults.boostedValue}, ${gameResults.value}))::numeric as daily_total
          FROM ${gameResults}
          WHERE ${eq(gameResults.gameId, game.id)} AND ${gte(gameResults.playedAt, since)}
          GROUP BY ${gameResults.userId}, ${gameResults.playedAt}
        ) as daily`,
      )
      .groupBy(sql`player_id`)
      .orderBy(
        orderDir(
          sql`(${BAYESIAN_C} * ${globalMean}::numeric + sum(daily_total)) / (${BAYESIAN_C} + count(*))`,
        ),
        desc(sql`count(*)`),
        orderDir(
          game.lowerIsBetter ? sql`min(daily_total)` : sql`max(daily_total)`,
        ),
      )
      .limit(3);

    // Busca dados dos usuários dos top 3
    const playerIds = rows.map((r) => r.playerId).filter(Boolean) as string[];

    const userRows =
      playerIds.length > 0
        ? await db
            .select({ id: users.id, name: users.name, image: users.image })
            .from(users)
            .where(sql`${users.id} in ${playerIds}`)
        : [];

    const userMap = new Map(userRows.map((u) => [u.id, u]));

    const leaderboard = rows.map((r, i) => {
      const user = userMap.get(r.playerId!);
      return {
        rank: i + 1,
        userId: r.playerId,
        name: user?.name ?? "—",
        image: user?.image ?? null,
        daysPlayed: r.daysPlayed,
        bestResult: r.bestResult,
        average: r.average,
      };
    });

    return Response.json(leaderboard);
  } catch (error) {
    console.error("GET /api/games/[slug]/leaderboard", error);
    return apiError("Erro ao buscar leaderboard");
  }
}
