/*
  Warnings:

  - A unique constraint covering the columns `[nominationID]` on the table `results` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `score` on the `results` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "results_pollID_key";

-- AlterTable
ALTER TABLE "results" ALTER COLUMN "pollID" DROP NOT NULL,
DROP COLUMN "score",
ADD COLUMN     "score" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "results_nominationID_key" ON "results"("nominationID");

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_pollID_fkey" FOREIGN KEY ("pollID") REFERENCES "poll"("id") ON DELETE SET NULL ON UPDATE CASCADE;
