-- AddForeignKey
ALTER TABLE "rankings" ADD CONSTRAINT "rankings_pollID_fkey" FOREIGN KEY ("pollID") REFERENCES "poll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
