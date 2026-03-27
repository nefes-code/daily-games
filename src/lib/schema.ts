import {
  pgTable,
  pgEnum,
  text,
  boolean,
  timestamp,
  integer,
  date,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "./cuid";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const gameTypeEnum = pgEnum("GameType", ["COMPETITIVE", "COOPERATIVE"]);
export const resultTypeEnum = pgEnum("ResultType", ["SCORE", "TIME"]);

// ─── Auth tables (NextAuth / Auth.js) ────────────────────────────────────────

export const users = pgTable("User", {
  id: text("id").primaryKey().$defaultFn(createId),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
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
  name: text("name").notNull(),
  url: text("url").notNull(),
  type: gameTypeEnum("type").notNull(),
  resultType: resultTypeEnum("resultType").notNull(),
  resultSuffix: text("resultSuffix"),
  resultMax: integer("resultMax"),
  lowerIsBetter: boolean("lowerIsBetter").notNull().default(false),
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
  },
  (t) => [
    unique().on(t.userId, t.gameId, t.playedAt),
    index("GameResult_gameId_playedAt_idx").on(t.gameId, t.playedAt),
  ],
);

// ─── Relations ───────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  results: many(gameResults, { relationName: "userResults" }),
  registeredResults: many(gameResults, { relationName: "registeredBy" }),
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

export const gameResultsRelations = relations(gameResults, ({ one }) => ({
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
}));
