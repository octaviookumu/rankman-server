-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "pollId" TEXT;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "poll"("id") ON DELETE SET NULL ON UPDATE CASCADE;
