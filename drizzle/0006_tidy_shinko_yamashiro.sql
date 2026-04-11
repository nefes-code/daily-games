CREATE TABLE "StreakRescue" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"missedDate" date NOT NULL,
	"gameId" text NOT NULL,
	"rescuedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "StreakRescue_userId_missedDate_unique" UNIQUE("userId","missedDate")
);
--> statement-breakpoint
CREATE TABLE "UserBoost" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"resultId" text NOT NULL,
	"streakAtTime" integer NOT NULL,
	"multiplier" real NOT NULL,
	"usedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "GameResult" ADD COLUMN "boostedValue" real;--> statement-breakpoint
ALTER TABLE "GameResult" ADD COLUMN "boostMultiplier" real;--> statement-breakpoint
ALTER TABLE "StreakRescue" ADD CONSTRAINT "StreakRescue_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StreakRescue" ADD CONSTRAINT "StreakRescue_gameId_Game_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserBoost" ADD CONSTRAINT "UserBoost_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserBoost" ADD CONSTRAINT "UserBoost_resultId_GameResult_id_fk" FOREIGN KEY ("resultId") REFERENCES "public"."GameResult"("id") ON DELETE cascade ON UPDATE no action;