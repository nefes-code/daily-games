/*
  Warnings:

  - You are about to drop the column `description` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `GameResult` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `GameResult` table. All the data in the column will be lost.
  - Added the required column `resultType` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registeredById` to the `GameResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `GameResult` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('COMPETITIVE', 'COOPERATIVE');

-- CreateEnum
CREATE TYPE "ResultType" AS ENUM ('SCORE', 'TIME');

-- DropForeignKey
ALTER TABLE "GameResult" DROP CONSTRAINT "GameResult_userId_fkey";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "description",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lowerIsBetter" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resultMax" INTEGER,
ADD COLUMN     "resultSuffix" TEXT,
ADD COLUMN     "resultType" "ResultType" NOT NULL,
ADD COLUMN     "type" "GameType" NOT NULL;

-- AlterTable
ALTER TABLE "GameResult" DROP COLUMN "data",
DROP COLUMN "score",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "registeredById" TEXT NOT NULL,
ADD COLUMN     "value" INTEGER NOT NULL,
ALTER COLUMN "playedAt" DROP DEFAULT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "GameResult_gameId_playedAt_idx" ON "GameResult"("gameId", "playedAt");

-- AddForeignKey
ALTER TABLE "GameResult" ADD CONSTRAINT "GameResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameResult" ADD CONSTRAINT "GameResult_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Cooperativo: garante apenas 1 resultado por jogo/dia quando userId é NULL (resultado do time)
CREATE UNIQUE INDEX "GameResult_cooperative_unique" ON "GameResult"("gameId", "playedAt") WHERE "userId" IS NULL;
