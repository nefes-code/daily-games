CREATE TYPE "public"."ResultStatus" AS ENUM('WIN', 'LOSS');--> statement-breakpoint
ALTER TABLE "GameResult" DROP CONSTRAINT "GameResult_userId_gameId_playedAt_unique";--> statement-breakpoint
ALTER TABLE "GameResult" ADD COLUMN "round" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "GameResult" ADD COLUMN "status" "ResultStatus";--> statement-breakpoint
ALTER TABLE "Game" ADD COLUMN "resultRounds" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "GameResult" ADD CONSTRAINT "GameResult_userId_gameId_playedAt_round_unique" UNIQUE("userId","gameId","playedAt","round");