import { db } from "@/lib/db";
import { gameResults, games, users } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { eq, or, sql, gte, and } from "drizzle-orm";
import moment from "moment-timezone";

const TZ = "America/Sao_Paulo";

const VALID_DAYS = new Set(["7", "10", "20", "30", "60", "all"]);
const VALID_METRICS = new Set(["avg", "best", "worst", "total_days"]);

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const url = new URL(req.url);

    // ── Parse & validate filters ──
    const daysParam = url.searchParams.get("days") ?? "30";
    const metric = url.searchParams.get("metric") ?? "avg";
    const filterPlayerId = url.searchParams.get("playerId") ?? null;
    const dateParam = url.searchParams.get("date") ?? null;

    if (!VALID_DAYS.has(daysParam)) return apiError("Período inválido", 400);
    if (!VALID_METRICS.has(metric)) return apiError("Métrica inválida", 400);
    if (dateParam && !/^\d{4}-\d{2}-\d{2}$/.test(dateParam))
      return apiError("Data inválida (YYYY-MM-DD)", 400);

    const [game] = await db
      .select()
      .from(games)
      .where(or(eq(games.slug, slug), eq(games.id, slug)));

    if (!game) return apiError("Jogo não encontrado", 404);

    // ── Mode: single date ──
    if (dateParam) {
      const dateVal = new Date(dateParam + "T00:00:00Z");
      const dayRows = await db
        .select({
          playerId: gameResults.userId,
          value: sql<number>`sum(${gameResults.value})::int`,
        })
        .from(gameResults)
        .where(
          and(
            eq(gameResults.gameId, game.id),
            eq(gameResults.playedAt, dateVal),
            sql`${gameResults.userId} IS NOT NULL`,
          ),
        )
        .groupBy(gameResults.userId)
        .orderBy(
          game.lowerIsBetter
            ? sql`sum(${gameResults.value}) ASC`
            : sql`sum(${gameResults.value}) DESC`,
        );

      const playerIds = dayRows
        .map((r) => r.playerId)
        .filter(Boolean) as string[];
      const userRows =
        playerIds.length > 0
          ? await db
              .select({ id: users.id, name: users.name, image: users.image })
              .from(users)
              .where(sql`${users.id} in ${playerIds}`)
          : [];
      const userMap = new Map(userRows.map((u) => [u.id, u]));

      return Response.json({
        filters: {
          days: daysParam === "all" ? "all" : Number(daysParam),
          metric,
          date: dateParam,
        },
        totalDays: 1,
        players: [],
        rows: dayRows.map((r, i) => {
          const user = userMap.get(r.playerId!);
          return {
            rank: i + 1,
            userId: r.playerId,
            name: user?.name ?? "—",
            image: user?.image ?? null,
            value: r.value,
            daysPlayed: 1,
          };
        }),
      });
    }

    // ── Date filter ──
    const sinceDate =
      daysParam === "all"
        ? null
        : moment
            .tz(TZ)
            .subtract(Number(daysParam), "days")
            .startOf("day")
            .toDate();

    const dateCondition = sinceDate
      ? and(
          eq(gameResults.gameId, game.id),
          gte(gameResults.playedAt, sinceDate),
        )
      : eq(gameResults.gameId, game.id);

    // ── Aggregate daily totals per player ──
    const dailyTotals = sql`(
      SELECT
        ${gameResults.userId} as player_id,
        ${gameResults.playedAt} as played_at,
        sum(${gameResults.value})::int as daily_total
      FROM ${gameResults}
      WHERE ${dateCondition}
        AND ${gameResults.userId} IS NOT NULL
      GROUP BY ${gameResults.userId}, ${gameResults.playedAt}
    )`;

    // ── Player filter: only days where specific player played ──
    let sourceQuery;
    if (filterPlayerId) {
      sourceQuery = sql`(
        SELECT dt.player_id, dt.played_at, dt.daily_total
        FROM ${dailyTotals} as dt
        INNER JOIN (
          SELECT DISTINCT played_at
          FROM ${dailyTotals} as dt2
          WHERE dt2.player_id = ${filterPlayerId}
        ) as player_days ON player_days.played_at = dt.played_at
      )`;
    } else {
      sourceQuery = dailyTotals;
    }

    // ── Metric column ──
    const isLower = game.lowerIsBetter;
    let valueExpr;
    let orderExpr: ReturnType<typeof sql>;

    switch (metric) {
      case "avg":
        valueExpr = sql<number>`round(avg(daily_total))::int`;
        orderExpr = isLower
          ? sql`avg(daily_total) ASC NULLS LAST`
          : sql`avg(daily_total) DESC NULLS LAST`;
        break;
      case "best":
        valueExpr = isLower
          ? sql<number>`min(daily_total)::int`
          : sql<number>`max(daily_total)::int`;
        orderExpr = isLower
          ? sql`min(daily_total) ASC NULLS LAST`
          : sql`max(daily_total) DESC NULLS LAST`;
        break;
      case "worst":
        valueExpr = isLower
          ? sql<number>`max(daily_total)::int`
          : sql<number>`min(daily_total)::int`;
        orderExpr = isLower
          ? sql`max(daily_total) ASC NULLS LAST`
          : sql`min(daily_total) DESC NULLS LAST`;
        break;
      case "total_days":
        valueExpr = sql<number>`count(*)::int`;
        orderExpr = sql`count(*) DESC`;
        break;
      default:
        valueExpr = sql<number>`round(avg(daily_total))::int`;
        orderExpr = sql`avg(daily_total) ASC NULLS LAST`;
    }

    const rows = await db
      .select({
        playerId: sql<string>`player_id`,
        value: valueExpr,
        daysPlayed: sql<number>`count(*)::int`,
      })
      .from(sql`${sourceQuery} as src`)
      .groupBy(sql`player_id`)
      .orderBy(orderExpr);

    // ── Total days in period ──
    const [totalDaysRow] = await db
      .select({
        count: sql<number>`count(distinct ${gameResults.playedAt})::int`,
      })
      .from(gameResults)
      .where(dateCondition);
    const totalDays = totalDaysRow?.count ?? 0;

    // ── Players who participated (for filter dropdown) ──
    const allPlayerIds = rows
      .map((r) => r.playerId)
      .filter(Boolean) as string[];
    const userRows =
      allPlayerIds.length > 0
        ? await db
            .select({ id: users.id, name: users.name, image: users.image })
            .from(users)
            .where(sql`${users.id} in ${allPlayerIds}`)
        : [];
    const userMap = new Map(userRows.map((u) => [u.id, u]));

    const result = {
      filters: {
        days: daysParam === "all" ? "all" : Number(daysParam),
        metric,
        ...(filterPlayerId && { playerId: filterPlayerId }),
      },
      totalDays,
      players: userRows.map((u) => ({
        id: u.id,
        name: u.name ?? "—",
        image: u.image ?? null,
      })),
      rows: rows.map((r, i) => {
        const user = userMap.get(r.playerId);
        return {
          rank: i + 1,
          userId: r.playerId,
          name: user?.name ?? "—",
          image: user?.image ?? null,
          value: r.value,
          daysPlayed: r.daysPlayed,
        };
      }),
    };

    return Response.json(result);
  } catch (error) {
    console.error("GET /api/games/[slug]/stats", error);
    return apiError("Erro ao buscar estatísticas");
  }
}
