import { db } from "@/lib/db";
import { gameResults, users, streakRescues } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { eq, asc } from "drizzle-orm";
import moment from "moment-timezone";

const TZ = "America/Sao_Paulo";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;

    // Busca streakResetAt do usuário
    const [user] = await db
      .select({ streakResetAt: users.streakResetAt })
      .from(users)
      .where(eq(users.id, id));

    const streakResetAt = user?.streakResetAt ?? null;

    const rows = await db
      .selectDistinct({ playedAt: gameResults.playedAt })
      .from(gameResults)
      .where(eq(gameResults.userId, id))
      .orderBy(asc(gameResults.playedAt));

    // playedAt é armazenado como date (meia-noite UTC), extraímos YYYY-MM-DD
    const allDates = rows.map((r) => {
      const d = r.playedAt as Date;
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    });

    const totalDays = allDates.length;

    if (totalDays === 0) {
      return Response.json({
        currentStreak: 0,
        longestStreak: 0,
        totalDays: 0,
        playedToday: false,
      });
    }

    // Busca datas resgatadas (missedDate) — contam como "dias jogados virtuais" para streak
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
    const yesterday = moment.tz(TZ).subtract(1, "day").format("YYYY-MM-DD");
    const playedToday = allDates.includes(today);

    // Set com todas as datas (reais + resgatadas) para cálculo do streak
    const dateSet = new Set([...allDates, ...rescueDates]);

    // Streak atual: filtra datas após streakResetAt (se existir)
    const resetDateStr = streakResetAt
      ? moment(streakResetAt).tz(TZ).format("YYYY-MM-DD")
      : null;

    let currentStreak = 0;
    const startDate = playedToday ? today : yesterday;

    if (dateSet.has(startDate)) {
      let checkDate = moment.tz(startDate, TZ);
      while (dateSet.has(checkDate.format("YYYY-MM-DD"))) {
        const checkStr = checkDate.format("YYYY-MM-DD");
        // Se streakResetAt existe e a data é anterior ao reset, para de contar
        if (resetDateStr && checkStr < resetDateStr) break;
        currentStreak++;
        checkDate = checkDate.clone().subtract(1, "day");
      }
    }

    // Maior streak histórico (usa todas as datas, com rescues, sem filtro de reset)
    const allDatesWithRescues = [
      ...new Set([...allDates, ...rescueDates]),
    ].sort();
    let longestStreak = 1;
    let runStreak = 1;

    for (let i = 1; i < allDatesWithRescues.length; i++) {
      const prev = moment(allDatesWithRescues[i - 1], "YYYY-MM-DD");
      const curr = moment(allDatesWithRescues[i], "YYYY-MM-DD");
      const diff = curr.diff(prev, "days");

      if (diff === 1) {
        runStreak++;
      } else {
        if (runStreak > longestStreak) longestStreak = runStreak;
        runStreak = 1;
      }
    }
    if (runStreak > longestStreak) longestStreak = runStreak;

    return Response.json({
      currentStreak,
      longestStreak,
      totalDays,
      playedToday,
    });
  } catch (error) {
    console.error("GET /api/users/[id]/streak", error);
    return apiError("Erro ao calcular streak");
  }
}
