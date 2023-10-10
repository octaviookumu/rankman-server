/*
  Warnings:

  - You are about to drop the `nomination` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `participant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ranking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `result` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ranking" DROP CONSTRAINT "ranking_participantID_fkey";

-- DropTable
DROP TABLE "nomination";

-- DropTable
DROP TABLE "participant";

-- DropTable
DROP TABLE "ranking";

-- DropTable
DROP TABLE "result";

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pollID" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "nominations" (
    "id" TEXT NOT NULL,
    "nomination" JSONB NOT NULL,
    "pollID" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "rankings" (
    "participantID" TEXT NOT NULL,
    "participantRankings" JSONB NOT NULL,
    "pollID" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "results" (
    "pollID" TEXT NOT NULL,
    "results" JSONB NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "participants_id_key" ON "participants"("id");

-- CreateIndex
CREATE UNIQUE INDEX "nominations_id_key" ON "nominations"("id");

-- CreateIndex
CREATE UNIQUE INDEX "rankings_participantID_key" ON "rankings"("participantID");

-- CreateIndex
CREATE UNIQUE INDEX "results_pollID_key" ON "results"("pollID");

-- AddForeignKey
ALTER TABLE "rankings" ADD CONSTRAINT "rankings_participantID_fkey" FOREIGN KEY ("participantID") REFERENCES "participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
