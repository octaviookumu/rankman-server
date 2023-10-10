/*
  Warnings:

  - You are about to drop the `Nomination` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Participant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ranking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Result` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `public.ranking` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Ranking" DROP CONSTRAINT "Ranking_participantID_fkey";

-- DropTable
DROP TABLE "Nomination";

-- DropTable
DROP TABLE "Participant";

-- DropTable
DROP TABLE "Ranking";

-- DropTable
DROP TABLE "Result";

-- DropTable
DROP TABLE "public.ranking";

-- CreateTable
CREATE TABLE "poll" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "votesPerVoter" INTEGER NOT NULL,
    "adminID" TEXT NOT NULL,
    "hasStarted" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "participant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pollID" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "nomination" (
    "id" TEXT NOT NULL,
    "nomination" JSONB NOT NULL,
    "pollID" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ranking" (
    "participantID" TEXT NOT NULL,
    "participantRankings" JSONB NOT NULL,
    "pollID" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "result" (
    "pollID" TEXT NOT NULL,
    "results" JSONB NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "poll_id_key" ON "poll"("id");

-- CreateIndex
CREATE UNIQUE INDEX "participant_id_key" ON "participant"("id");

-- CreateIndex
CREATE UNIQUE INDEX "nomination_id_key" ON "nomination"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ranking_participantID_key" ON "ranking"("participantID");

-- CreateIndex
CREATE UNIQUE INDEX "result_pollID_key" ON "result"("pollID");

-- AddForeignKey
ALTER TABLE "ranking" ADD CONSTRAINT "ranking_participantID_fkey" FOREIGN KEY ("participantID") REFERENCES "participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
