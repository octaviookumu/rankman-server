/*
  Warnings:

  - The `participantRankings` column on the `rankings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `results` on the `results` table. All the data in the column will be lost.
  - Added the required column `nominationText` to the `nominations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nominationUserID` to the `nominations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nominationID` to the `results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nominationText` to the `results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `results` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "nominations" ADD COLUMN     "nominationText" TEXT NOT NULL,
ADD COLUMN     "nominationUserID" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "rankings" DROP COLUMN "participantRankings",
ADD COLUMN     "participantRankings" TEXT[];

-- AlterTable
ALTER TABLE "results" DROP COLUMN "results",
ADD COLUMN     "nominationID" TEXT NOT NULL,
ADD COLUMN     "nominationText" TEXT NOT NULL,
ADD COLUMN     "score" TEXT NOT NULL;
