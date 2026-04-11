import { db } from "@/lib/db";
import {
  gameResults,
  games,
  users,
  userBoosts,
  streakRescues,
} from "@/lib/schema";
import { apiError } from "@/lib/api-helpers";
import { auth } from "@/lib/auth";
import { eq, asc } from "drizzle-orm";
import moment from "moment-timezone";

const TZ = "America/Sao_Paulo";

type Params = { params: Promise<{ id: string }> };

/** Calcula current streak do usuário (mesma lógica do endpoint /streak) */
async function computeCurrentStreak(userId: string): Promise<number> {
  const [user] = await db
    .select({ streakResetAt: users.streakResetAt })
    .from(users)
    .where(eq(users.id, userId));

  const streakResetAt = user?.streakResetAt ?? null;

  const rows = await db
    .selectDistinct({ playedAt: gameResults.playedAt })
    .from(gameResults)
    .where(eq(gameResults.userId, userId))
    .orderBy(asc(gameResults.playedAt));

  const allDates = rows.map((r) => {
    const d = r.playedAt as Date;
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  });

  if (allDates.length === 0) return 0;

  const rescueRows = await db
    .select({ missedDate: streakRescues.missedDate })
    .from(streakRescues)
    .where(eq(streakRescues.userId, userId));

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

  let streak = 0;
  if (dateSet.has(startDate)) {
    let checkDate = moment.tz(startDate, TZ);
    while (dateSet.has(checkDate.format("YYYY-MM-DD"))) {
      const checkStr = checkDate.format("YYYY-MM-DD");
      if (resetDateStr && checkStr < resetDateStr) break;
      streak++;
      checkDate = checkDate.clone().subtract(1, "day");
    }
  }

  return streak;
}

export async function POST(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("Autenticação necessária", 401);
    }

    const { id: resultId } = await params;

    // Busca o resultado com game
    const result = await db.query.gameResults.findFirst({
      where: eq(gameResults.id, resultId),
      with: { game: true },
    });

    if (!result) return apiError("Resultado não encontrado", 404);

    // Só o dono pode dar boost
    if (result.userId !== session.user.id) {
      return apiError(
        "Você só pode usar impulso nos seus próprios resultados",
        403,
      );
    }

    // Só jogos competitivos
    if (result.game.type !== "COMPETITIVE") {
      return apiError("Impulso disponível apenas para jogos competitivos", 400);
    }

    // Só resultado de hoje
    const today = moment.tz(TZ).format("YYYY-MM-DD");
    const playedAtStr = (() => {
      const d = result.playedAt as Date;
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    })();

    if (playedAtStr !== today) {
      return apiError("Impulso só pode ser usado em resultados de hoje", 400);
    }

    // Resultado já tem boost
    if (result.boostedValue !== null) {
      return apiError("Este resultado já tem impulso aplicado", 409);
    }

    // Calcula streak atual
    const streak = await computeCurrentStreak(session.user.id);

    if (streak === 0) {
      return apiError(
        "Você precisa de pelo menos 1 dia de streak para usar o impulso",
        400,
      );
    }

    // Fórmula: 0.5% por dia de streak, cap 15% (30 dias)
    const multiplier = 1 - Math.min(streak, 30) * 0.005;

    // Calcula boostedValue
    const boostedValue = result.game.lowerIsBetter
      ? Math.round(result.value * multiplier * 10) / 10
      : Math.round(result.value * (2 - multiplier) * 10) / 10;

    // Atualiza resultado com boost
    await db
      .update(gameResults)
      .set({ boostedValue, boostMultiplier: multiplier })
      .where(eq(gameResults.id, resultId));

    // Registra o uso do boost
    await db.insert(userBoosts).values({
      userId: session.user.id,
      resultId,
      streakAtTime: streak,
      multiplier,
    });

    // Zera a streak do usuário
    await db
      .update(users)
      .set({ streakResetAt: new Date() })
      .where(eq(users.id, session.user.id));

    // Retorna resultado atualizado com relations
    const updated = await db.query.gameResults.findFirst({
      where: eq(gameResults.id, resultId),
      with: {
        user: true,
        registeredBy: true,
        game: true,
        reactions: { with: { user: true } },
      },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("POST /api/results/[id]/boost", error);
    return apiError("Erro ao aplicar impulso");
  }
}
