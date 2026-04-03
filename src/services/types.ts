// ─── Enums ────────────────────────────────────────────────────────────────────

export type GameType = "COMPETITIVE" | "COOPERATIVE";
export type ResultType = "SCORE" | "TIME";
export type GameIcon =
  | "GAMEPAD"
  | "CROWN"
  | "STAR"
  | "FIRE"
  | "CUP"
  | "MEDAL"
  | "BOLT"
  | "CONFETTI";

export type ResultStatus = "WIN" | "LOSS";

// ─── Entidades (shape das respostas da API) ───────────────────────────────────

export type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  active: boolean;
  createdAt: string;
};

export type Game = {
  id: string;
  slug: string | null;
  name: string;
  url: string;
  type: GameType;
  resultType: ResultType;
  resultSuffix: string | null;
  resultMax: number | null;
  lowerIsBetter: boolean;
  icon: GameIcon | null;
  resultRounds: number;
  position: number;
  active: boolean;
  createdAt: string;
};

export type ResultReaction = {
  id: string;
  emoji: string;
  createdAt: string;
  resultId: string;
  userId: string;
  user: User;
};

export type GameResult = {
  id: string;
  value: number;
  playedAt: string;
  createdAt: string;
  gameId: string;
  userId: string | null;
  registeredById: string;
  round: number;
  status: ResultStatus | null;
  user: User | null;
  registeredBy: User;
  game: Game;
  reactions: ResultReaction[];
};

export type LeaderboardEntry = {
  rank: number;
  userId: string | null;
  name: string;
  image: string | null;
  daysPlayed: number;
  bestResult: number;
  average: number;
};

export type UserStreak = {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  playedToday: boolean;
};

// ─── Inputs (payload das mutations) ──────────────────────────────────────────

export type CreateUserInput = {
  name: string;
  email: string;
};

export type UpdateUserInput = Partial<Pick<User, "name" | "email" | "active">>;

export type CreateGameInput = {
  slug?: string;
  name: string;
  url: string;
  type: GameType;
  resultType: ResultType;
  resultSuffix?: string;
  resultMax?: number;
  lowerIsBetter?: boolean;
  icon?: GameIcon;
  resultRounds?: number;
};

export type UpdateGameInput = Partial<
  Pick<
    Game,
    | "name"
    | "url"
    | "resultSuffix"
    | "resultMax"
    | "lowerIsBetter"
    | "active"
    | "position"
  >
>;

export type SubmitResultInput = {
  /** ISO date string YYYY-MM-DD */
  playedAt: string;
  gameId: string;
  /** null = resultado cooperativo (do time) */
  userId?: string;
  /** Para jogos com 1 rodada */
  value?: number;
  status?: ResultStatus;
  /** Para jogos com múltiplas rodadas */
  rounds?: Array<{ round: number; value: number; status?: ResultStatus }>;
};

// ─── Filtros ──────────────────────────────────────────────────────────────────

export type ResultsFilter = {
  gameId?: string;
  /** ISO date string YYYY-MM-DD */
  date?: string;
  userId?: string;
};
