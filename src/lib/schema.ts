import {
  pgTable,
  pgEnum,
  text,
  boolean,
  timestamp,
  integer,
  date,
  real,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "./cuid";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const gameTypeEnum = pgEnum("GameType", ["COMPETITIVE", "COOPERATIVE"]);
export const resultTypeEnum = pgEnum("ResultType", ["SCORE", "TIME"]);
export const gameIconEnum = pgEnum("GameIcon", [
  "GAMEPAD",
  "CROWN",
  "STAR",
  "FIRE",
  "CUP",
  "MEDAL",
  "BOLT",
  "CONFETTI",
]);
export const resultStatusEnum = pgEnum("ResultStatus", ["WIN", "LOSS"]);

// ─── Auth tables (NextAuth / Auth.js) ────────────────────────────────────────

export const users = pgTable("User", {
  id: text("id").primaryKey().$defaultFn(createId),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  streakResetAt: timestamp("streakResetAt", { mode: "date" }),
});

export const accounts = pgTable(
  "Account",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [unique().on(t.provider, t.providerAccountId)],
);

export const sessions = pgTable("Session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "VerificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [unique().on(t.identifier, t.token)],
);

// ─── App tables ──────────────────────────────────────────────────────────────

export const games = pgTable("Game", {
  id: text("id").primaryKey().$defaultFn(createId),
  slug: text("slug").unique(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  type: gameTypeEnum("type").notNull(),
  resultType: resultTypeEnum("resultType").notNull(),
  resultSuffix: text("resultSuffix"),
  resultMax: integer("resultMax"),
  lowerIsBetter: boolean("lowerIsBetter").notNull().default(false),
  icon: gameIconEnum("icon"),
  resultRounds: integer("resultRounds").notNull().default(1),
  position: integer("position").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const gameResults = pgTable(
  "GameResult",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    value: integer("value").notNull(),
    playedAt: date("playedAt", { mode: "date" }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    gameId: text("gameId")
      .notNull()
      .references(() => games.id),
    userId: text("userId").references(() => users.id),
    registeredById: text("registeredById")
      .notNull()
      .references(() => users.id),
    round: integer("round").notNull().default(1),
    status: resultStatusEnum("status"),
    boostedValue: real("boostedValue"),
    boostMultiplier: real("boostMultiplier"),
  },
  (t) => [
    unique().on(t.userId, t.gameId, t.playedAt, t.round),
    index("GameResult_gameId_playedAt_idx").on(t.gameId, t.playedAt),
  ],
);

export const resultReactions = pgTable(
  "ResultReaction",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    emoji: text("emoji").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    resultId: text("resultId")
      .notNull()
      .references(() => gameResults.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [unique().on(t.resultId, t.userId)],
);

// ─── Boost & Rescue tables ───────────────────────────────────────────────────

export const userBoosts = pgTable("UserBoost", {
  id: text("id").primaryKey().$defaultFn(createId),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  resultId: text("resultId")
    .notNull()
    .references(() => gameResults.id, { onDelete: "cascade" }),
  streakAtTime: integer("streakAtTime").notNull(),
  multiplier: real("multiplier").notNull(),
  usedAt: timestamp("usedAt", { mode: "date" }).notNull().defaultNow(),
});

export const streakRescues = pgTable(
  "StreakRescue",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    missedDate: date("missedDate", { mode: "date" }).notNull(),
    gameId: text("gameId")
      .notNull()
      .references(() => games.id),
    rescuedAt: timestamp("rescuedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.missedDate)],
);

// ─── Relations ───────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  results: many(gameResults, { relationName: "userResults" }),
  registeredResults: many(gameResults, { relationName: "registeredBy" }),
  reactions: many(resultReactions),
  boosts: many(userBoosts),
  rescues: many(streakRescues),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const gamesRelations = relations(games, ({ many }) => ({
  results: many(gameResults),
}));

export const gameResultsRelations = relations(gameResults, ({ one, many }) => ({
  game: one(games, { fields: [gameResults.gameId], references: [games.id] }),
  user: one(users, {
    fields: [gameResults.userId],
    references: [users.id],
    relationName: "userResults",
  }),
  registeredBy: one(users, {
    fields: [gameResults.registeredById],
    references: [users.id],
    relationName: "registeredBy",
  }),
  reactions: many(resultReactions),
}));

export const userBoostsRelations = relations(userBoosts, ({ one }) => ({
  user: one(users, { fields: [userBoosts.userId], references: [users.id] }),
  result: one(gameResults, {
    fields: [userBoosts.resultId],
    references: [gameResults.id],
  }),
}));

export const streakRescuesRelations = relations(streakRescues, ({ one }) => ({
  user: one(users, {
    fields: [streakRescues.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [streakRescues.gameId],
    references: [games.id],
  }),
}));

export const resultReactionsRelations = relations(
  resultReactions,
  ({ one }) => ({
    result: one(gameResults, {
      fields: [resultReactions.resultId],
      references: [gameResults.id],
    }),
    user: one(users, {
      fields: [resultReactions.userId],
      references: [users.id],
    }),
  }),
);
