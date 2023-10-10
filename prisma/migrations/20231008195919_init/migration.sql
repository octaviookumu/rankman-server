/*
  Warnings:

  - You are about to drop the `Poll` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Poll";

-- CreateTable
CREATE TABLE "public.ranking" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "votesPerVoter" INTEGER NOT NULL,
    "adminID" TEXT NOT NULL,
    "hasStarted" BOOLEAN DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "public.ranking_id_key" ON "public.ranking"("id");
