/*
  Warnings:

  - You are about to drop the column `pollId` on the `participants` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "participants" DROP CONSTRAINT "participants_pollId_fkey";

-- AlterTable
ALTER TABLE "participants" DROP COLUMN "pollId",
ALTER COLUMN "pollID" DROP NOT NULL,
ADD CONSTRAINT "participants_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_pollID_fkey" FOREIGN KEY ("pollID") REFERENCES "poll"("id") ON DELETE SET NULL ON UPDATE CASCADE;
