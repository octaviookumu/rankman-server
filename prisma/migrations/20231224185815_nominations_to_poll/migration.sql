-- AddForeignKey
ALTER TABLE "nominations" ADD CONSTRAINT "nominations_pollID_fkey" FOREIGN KEY ("pollID") REFERENCES "poll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
