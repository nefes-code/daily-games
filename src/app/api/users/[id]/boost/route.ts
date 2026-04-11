import { db } from "@/lib/db";
import { gameResults, users, userBoosts, streakRescues } from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { eq, asc, desc } from "drizzle-orm";
import moment from "moment-timezone";

const TZ = "America/Sao_Paulo";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;

    // Streak atual (mesma lógica do /streak)
    const [user] = await db
      .select({ streakResetAt: users.streakResetAt })
      .from(users)
      .where(eq(users.id, id));

    if (!user) return apiError("Usuário não encontrado", 404);

    const streakResetAt = user.streakResetAt ?? null;

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

    const rescueDates = rescueRows.map((r) => {
      const d = r.missedDate as Date;
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    });

    const dateSet = new Set([...allDates, ...rescueDates]);

    const today = moment.tz(TZ).format("YYYY-MM-DD");
    const yesterday = moment.tz(TZ).subtract(1, "day").format("YYYY-MM-DD");
    const playedToday = allDates.includes(today);
    const startDate = playedToday ? today : yesterday;

    const resetDateStr = streakResetAt
      ? moment(streakResetAt).tz(TZ).format("YYYY-MM-DD")
      : null;

    let currentStreak = 0;
    if (dateSet.has(startDate)) {
      let checkDate = moment.tz(startDate, TZ);
      while (dateSet.has(checkDate.format("YYYY-MM-DD"))) {
        const checkStr = checkDate.format("YYYY-MM-DD");
        if (resetDateStr && checkStr < resetDateStr) break;
        currentStreak++;
        checkDate = checkDate.clone().subtract(1, "day");
      }
    }

    // Último uso de boost
    const [lastBoost] = await db
      .select({ usedAt: userBoosts.usedAt })
      .from(userBoosts)
      .where(eq(userBoosts.userId, id))
      .orderBy(desc(userBoosts.usedAt))
      .limit(1);

    const canBoost = currentStreak > 0;
    const potentialMultiplier = 1 - Math.min(currentStreak, 30) * 0.005;

    return Response.json({
      canBoost,
      currentStreak,
      potentialMultiplier,
      lastBoostUsedAt: lastBoost?.usedAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("GET /api/users/[id]/boost", error);
    return apiError("Erro ao buscar informações do impulso");
  }
}
