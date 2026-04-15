import { db } from "@/lib/db";
import { gameResults, games, users } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { eq, or, sql, asc, desc, gte, and } from "drizzle-orm";
import { thirtyDaysAgo } from "@/utils/date";
import moment from "moment-timezone";

const TZ = "America/Sao_Paulo";

type Params = { params: Promise<{ slug: string }> };

/** Calcula o streak atual (dias consecutivos) dado um array de datas YYYY-MM-DD em ordem crescente */
function computeCurrentStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0;
  const today = moment.tz(TZ).format("YYYY-MM-DD");
  const yesterday = moment.tz(TZ).subtract(1, "day").format("YYYY-MM-DD");
  const dateSet = new Set(sortedDates);
  const startDate = dateSet.has(today) ? today : yesterday;
  if (!dateSet.has(startDate)) return 0;
  let streak = 0;
  let checkDate = moment.tz(startDate, TZ);
  while (dateSet.has(checkDate.format("YYYY-MM-DD"))) {
    streak++;
    checkDate = checkDate.clone().subtract(1, "day");
  }
  return streak;
}

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

    // Total de dias com ao menos um resultado no período
    const [totalDaysRow] = await db
      .select({
        count: sql<number>`count(distinct ${gameResults.playedAt})::int`,
      })
      .from(gameResults)
      .where(
        and(eq(gameResults.gameId, game.id), gte(gameResults.playedAt, since)),
      );
    const totalDays = totalDaysRow?.count ?? 0;

    // Cooperativo: um único resultado agregado do time
    if (game.type === "COOPERATIVE") {
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
            SELECT ${gameResults.playedAt}, sum(${gameResults.value})::int as daily_total
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
                totalDays,
                bestResult: team.bestResult,
                average: team.average,
                streak: 0,
              },
            ]
          : [],
      );
    }

    // ── Competitivo com penalidade por ausência ──────────────────────────────
    // Para cada dia disponível no período, dias sem registro recebem a pior
    // pontuação possível: isso incentiva o jogador a registrar mesmo resultados ruins.
    const orderDir = game.lowerIsBetter ? asc : desc;

    // Valor de penalidade: pior resultado possível para o tipo de jogo
    let penaltyValue: number;
    if (game.lowerIsBetter) {
      if (game.resultMax !== null) {
        penaltyValue = game.resultMax;
      } else {
        // Sem resultMax definido: usa o pior resultado registrado no período
        const [maxRow] = await db
          .select({ maxVal: sql<number>`max(${gameResults.value})::int` })
          .from(gameResults)
          .where(
            and(
              eq(gameResults.gameId, game.id),
              gte(gameResults.playedAt, since),
            ),
          );
        penaltyValue = maxRow?.maxVal ?? 0;
      }
    } else {
      penaltyValue = 0;
    }

    // CROSS JOIN: todos os jogadores × todos os dias disponíveis
    // LEFT JOIN: traz os resultados reais; ausências ficam NULL → COALESCE com penalidade
    const rows = await db
      .select({
        playerId: sql<string>`all_players.player_id`,
        daysPlayed: sql<number>`count(actual.daily_total)::int`,
        bestResult: game.lowerIsBetter
          ? sql<number>`min(actual.daily_total)::int`
          : sql<number>`max(actual.daily_total)::int`,
        average: sql<number>`round(avg(coalesce(actual.daily_total, ${penaltyValue})))::int`,
      })
      .from(
        sql`(
          SELECT DISTINCT ${gameResults.userId} as player_id
          FROM ${gameResults}
          WHERE ${eq(gameResults.gameId, game.id)} AND ${gte(gameResults.playedAt, since)}
            AND ${gameResults.userId} IS NOT NULL
        ) as all_players
        CROSS JOIN (
          SELECT DISTINCT ${gameResults.playedAt} as played_at
          FROM ${gameResults}
          WHERE ${eq(gameResults.gameId, game.id)} AND ${gte(gameResults.playedAt, since)}
        ) as all_days
        LEFT JOIN (
          SELECT ${gameResults.userId} as player_id, ${gameResults.playedAt} as played_at, sum(${gameResults.value})::int as daily_total
          FROM ${gameResults}
          WHERE ${eq(gameResults.gameId, game.id)} AND ${gte(gameResults.playedAt, since)}
          GROUP BY ${gameResults.userId}, ${gameResults.playedAt}
        ) as actual ON actual.player_id = all_players.player_id AND actual.played_at = all_days.played_at`,
      )
      .groupBy(sql`all_players.player_id`)
      .orderBy(
        orderDir(sql`avg(coalesce(actual.daily_total, ${penaltyValue}))`),
        desc(sql`count(actual.daily_total)`),
        orderDir(
          game.lowerIsBetter
            ? sql`min(coalesce(actual.daily_total, ${penaltyValue}))`
            : sql`max(coalesce(actual.daily_total, ${penaltyValue}))`,
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

    // Streak por jogo para cada um dos top 3
    const streakDateRows =
      playerIds.length > 0
        ? await db
            .selectDistinct({
              userId: gameResults.userId,
              playedAt: gameResults.playedAt,
            })
            .from(gameResults)
            .where(
              and(
                eq(gameResults.gameId, game.id),
                sql`${gameResults.userId} in ${playerIds}`,
              ),
            )
            .orderBy(asc(gameResults.playedAt))
        : [];

    const datesByUser = new Map<string, string[]>();
    for (const row of streakDateRows) {
      if (!row.userId) continue;
      const d = row.playedAt as Date;
      const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      const arr = datesByUser.get(row.userId) ?? [];
      arr.push(dateStr);
      datesByUser.set(row.userId, arr);
    }

    const userMap = new Map(userRows.map((u) => [u.id, u]));

    const leaderboard = rows.map((r, i) => {
      const user = userMap.get(r.playerId!);
      const dates = datesByUser.get(r.playerId!) ?? [];
      return {
        rank: i + 1,
        userId: r.playerId,
        name: user?.name ?? "—",
        image: user?.image ?? null,
        daysPlayed: r.daysPlayed,
        totalDays,
        bestResult: r.bestResult,
        average: r.average,
        streak: computeCurrentStreak(dates),
      };
    });

    return Response.json(leaderboard);
  } catch (error) {
    console.error("GET /api/games/[slug]/leaderboard", error);
    return apiError("Erro ao buscar leaderboard");
  }
}
