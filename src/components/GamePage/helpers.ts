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
  return new Date().toISOString().split("T")[0];
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
