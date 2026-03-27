// ─── Enums ────────────────────────────────────────────────────────────────────

export type GameType = "COMPETITIVE" | "COOPERATIVE";
export type ResultType = "SCORE" | "TIME";

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
  active: boolean;
  createdAt: string;
};

export type GameResult = {
  id: string;
  value: number;
  playedAt: string;
  createdAt: string;
  gameId: string;
  userId: string | null;
  registeredById: string;
  user: User | null;
  registeredBy: User;
  game: Game;
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
};

export type UpdateGameInput = Partial<
  Pick<
    Game,
    "name" | "url" | "resultSuffix" | "resultMax" | "lowerIsBetter" | "active"
  >
>;

export type SubmitResultInput = {
  value: number;
  /** ISO date string YYYY-MM-DD */
  playedAt: string;
  gameId: string;
  /** null = resultado cooperativo (do time) */
  userId?: string;
};

// ─── Filtros ──────────────────────────────────────────────────────────────────

export type ResultsFilter = {
  gameId?: string;
  /** ISO date string YYYY-MM-DD */
  date?: string;
  userId?: string;
};
