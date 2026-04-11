import { db } from "@/lib/db";
import { gameResults, games, users, streakRescues } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { auth } from "@/lib/auth";
import { eq, and, asc, sql } from "drizzle-orm";
import moment from "moment-timezone";

const TZ = "America/Sao_Paulo";

type Params = { params: Promise<{ id: string }> };

/**
 * Calcula a "streak anterior" — o que o usuário teria se o gap (missedDate) não existisse.
 * Retorna { canRescue, missedDate, previousStreak }.
 */
function computeRescueInfo(
  allDates: string[],
  rescueDates: Set<string>,
  today: string,
  playedToday: boolean,
) {
  const yesterday = moment
    .tz(today, TZ)
    .subtract(1, "day")
    .format("YYYY-MM-DD");
  const twoDaysAgo = moment
    .tz(today, TZ)
    .subtract(2, "days")
    .format("YYYY-MM-DD");

  const dateSet = new Set([...allDates, ...rescueDates]);

  // Para resgatar: o user deve ter jogado hoje, ontem deve ser um gap, e anteontem deve existir
  // Ou seja: hoje jogou, ontem NÃO jogou, anteontem jogou → ontem é o missedDate
  if (!playedToday) {
    return { canRescue: false, missedDate: null, previousStreak: 0 };
  }

  // Ontem já tem registro? Não precisa de resgate
  if (dateSet.has(yesterday)) {
    return { canRescue: false, missedDate: null, previousStreak: 0 };
  }

  // Anteontem tem registro? Se não, não há streak pra resgatar
  if (!dateSet.has(twoDaysAgo)) {
    return { canRescue: false, missedDate: null, previousStreak: 0 };
  }

  // Já resgatou esse dia?
  if (rescueDates.has(yesterday)) {
    return { canRescue: false, missedDate: null, previousStreak: 0 };
  }

  // Calcula qual seria o streak se ontem existisse (conta de anteontem pra trás)
  let previousStreak = 0;
  let checkDate = moment.tz(twoDaysAgo, TZ);
  while (dateSet.has(checkDate.format("YYYY-MM-DD"))) {
    previousStreak++;
    checkDate = checkDate.clone().subtract(1, "day");
  }

  return {
    canRescue: previousStreak > 0,
    missedDate: yesterday,
    previousStreak,
  };
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;

    const rows = await db
      .selectDistinct({ playedAt: gameResults.playedAt })
      .from(gameResults)
      .where(eq(gameResults.userId, id))
      .orderBy(asc(gameResults.playedAt));

    const allDates = rows.map((r) => {
      const d = r.playedAt as Date;
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    });

    const rescueRows = await db
      .select({ missedDate: streakRescues.missedDate })
      .from(streakRescues)
      .where(eq(streakRescues.userId, id));

    const rescueDates = new Set(
      rescueRows.map((r) => {
        const d = r.missedDate as Date;
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      }),
    );

    const today = moment.tz(TZ).format("YYYY-MM-DD");
    const playedToday = allDates.includes(today);

    const info = computeRescueInfo(allDates, rescueDates, today, playedToday);

    return Response.json(info);
  } catch (error) {
    console.error("GET /api/users/[id]/streak/rescue", error);
    return apiError("Erro ao verificar resgate de streak");
  }
}

export async function POST(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Autenticação necessária", 401);
    }

    const { id } = await params;

    if (id !== session.user.id) {
      return apiError("Você só pode resgatar sua própria streak", 403);
    }

    // Recalcula rescue info
    const rows = await db
      .selectDistinct({ playedAt: gameResults.playedAt })
      .from(gameResults)
      .where(eq(gameResults.userId, id))
      .orderBy(asc(gameResults.playedAt));

    const allDates = rows.map((r) => {
      const d = r.playedAt as Date;
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    });

    const rescueRows = await db
      .select({ missedDate: streakRescues.missedDate })
      .from(streakRescues)
      .where(eq(streakRescues.userId, id));

    const rescueDates = new Set(
      rescueRows.map((r) => {
        const d = r.missedDate as Date;
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      }),
    );

    const today = moment.tz(TZ).format("YYYY-MM-DD");
    const playedToday = allDates.includes(today);

    const info = computeRescueInfo(allDates, rescueDates, today, playedToday);

    if (!info.canRescue || !info.missedDate) {
      return apiError("Não é possível resgatar a streak no momento", 400);
    }

    // Verifica se ficou em 1º lugar em algum jogo competitivo hoje
    const activeGames = await db
      .select()
      .from(games)
      .where(and(eq(games.active, true), eq(games.type, "COMPETITIVE")));

    const todayDate = new Date(today);
    let rescueGameId: string | null = null;

    for (const game of activeGames) {
      // Busca todos os resultados de hoje para este jogo, agrupados por userId
      const dailyResults = await db
        .select({
          userId: gameResults.userId,
          dailyTotal: sql<number>`sum(COALESCE(${gameResults.boostedValue}, ${gameResults.value}))::numeric`,
        })
        .from(gameResults)
        .where(
          and(
            eq(gameResults.gameId, game.id),
            eq(gameResults.playedAt, todayDate),
          ),
        )
        .groupBy(gameResults.userId);

      if (dailyResults.length === 0) continue;

      // Ordena: melhor resultado primeiro
      const sorted = [...dailyResults].sort((a, b) =>
        game.lowerIsBetter
          ? Number(a.dailyTotal) - Number(b.dailyTotal)
          : Number(b.dailyTotal) - Number(a.dailyTotal),
      );

      // Verifica se o user está em 1º
      if (sorted[0]?.userId === id) {
        rescueGameId = game.id;
        break;
      }
    }

    if (!rescueGameId) {
      return apiError(
        "Você precisa estar em 1º lugar em algum jogo competitivo hoje para resgatar a streak",
        400,
      );
    }

    // Insere o resgate
    await db.insert(streakRescues).values({
      userId: id,
      missedDate: new Date(info.missedDate),
      gameId: rescueGameId,
    });

    return Response.json({
      success: true,
      missedDate: info.missedDate,
      previousStreak: info.previousStreak,
      rescuedByGame: rescueGameId,
    });
  } catch (error) {
    console.error("POST /api/users/[id]/streak/rescue", error);
    return apiError("Erro ao resgatar streak");
  }
}
