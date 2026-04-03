import { db } from "@/lib/db";
import { gameResults } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { eq, asc } from "drizzle-orm";
import moment from "moment-timezone";

const TZ = "America/Sao_Paulo";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;

    const rows = await db
      .selectDistinct({ playedAt: gameResults.playedAt })
      .from(gameResults)
      .where(eq(gameResults.userId, id))
      .orderBy(asc(gameResults.playedAt));

    // playedAt é armazenado como date (meia-noite UTC), extraímos YYYY-MM-DD
    const dates = rows.map((r) => {
      const d = r.playedAt as Date;
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    });

    const totalDays = dates.length;

    if (totalDays === 0) {
      return Response.json({
        currentStreak: 0,
        longestStreak: 0,
        totalDays: 0,
        playedToday: false,
      });
    }

    const today = moment.tz(TZ).format("YYYY-MM-DD");
    const yesterday = moment.tz(TZ).subtract(1, "day").format("YYYY-MM-DD");
    const playedToday = dates.includes(today);

    const dateSet = new Set(dates);

    // Streak atual: começa de hoje (se já jogou) ou ontem (ainda tem o dia pra jogar)
    let currentStreak = 0;
    const startDate = playedToday ? today : yesterday;

    if (dateSet.has(startDate)) {
      let checkDate = moment.tz(startDate, TZ);
      while (dateSet.has(checkDate.format("YYYY-MM-DD"))) {
        currentStreak++;
        checkDate = checkDate.clone().subtract(1, "day");
      }
    }

    // Maior streak histórico
    let longestStreak = 1;
    let runStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prev = moment(dates[i - 1], "YYYY-MM-DD");
      const curr = moment(dates[i], "YYYY-MM-DD");
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
