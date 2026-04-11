import { getToday as getTodayBRT } from "@/utils/date";

export function formatValue(
  value: number,
  game: {
    resultType: string;
    resultSuffix: string | null;
    resultMax: number | null;
    resultRounds?: number;
  },
) {
  if (game.resultType === "TIME") {
    const mins = Math.floor(value / 60);
    const secs = value % 60;
    return mins > 0 ? `${mins}:${String(secs).padStart(2, "0")}` : `${secs}s`;
  }
  const suffix = game.resultSuffix ? ` ${game.resultSuffix}` : "";
  // Para multi-round, o valor é a soma das rodadas — não faz sentido mostrar /max
  const isMultiRound = (game.resultRounds ?? 1) > 1;
  if (game.resultMax && !isMultiRound)
    return `${value || "0"}/${game.resultMax}${suffix}`;
  return `${value}${suffix}`;
}

/** Formata valor que pode ter decimais (boostedValue) */
export function formatBoostedValue(
  value: number,
  game: {
    resultType: string;
    resultSuffix: string | null;
    resultMax: number | null;
    resultRounds?: number;
  },
) {
  if (game.resultType === "TIME") {
    // Tempo com boost: mostra com 1 decimal se não for inteiro
    const mins = Math.floor(value / 60);
    const secs = value % 60;
    const secsStr = Number.isInteger(secs)
      ? String(secs).padStart(2, "0")
      : secs.toFixed(1).padStart(4, "0");
    return mins > 0
      ? `${mins}:${secsStr}`
      : `${secs % 1 === 0 ? secs : secs.toFixed(1)}s`;
  }
  const suffix = game.resultSuffix ? ` ${game.resultSuffix}` : "";
  const isMultiRound = (game.resultRounds ?? 1) > 1;
  const display = Number.isInteger(value) ? String(value) : value.toFixed(1);
  if (game.resultMax && !isMultiRound)
    return `${display}/${game.resultMax}${suffix}`;
  return `${display}${suffix}`;
}

/** Retorna o valor efetivo de um resultado (boostedValue se existir, senão value) */
export function effectiveValue(result: {
  value: number;
  boostedValue: number | null;
}): number {
  return result.boostedValue ?? result.value;
}

export function formatRoundValue(
  value: number,
  status: "WIN" | "LOSS" | null,
  game: {
    resultType: string;
    resultSuffix: string | null;
    resultMax: number | null;
  },
) {
  if (status === "LOSS") return "✕";
  // Individual round: sempre mostra /max se existir
  const suffix = game.resultSuffix ? ` ${game.resultSuffix}` : "";
  if (game.resultType === "TIME") return formatValue(value, game);
  if (game.resultMax) return `${value}/${game.resultMax}${suffix}`;
  return `${value}${suffix}`;
}

export function getToday() {
  return getTodayBRT();
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const AVATAR_PALETTE = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
];

export function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}
