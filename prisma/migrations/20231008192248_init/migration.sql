-- CreateTable
CREATE TABLE "Poll" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "votesPerVoter" INTEGER NOT NULL,
    "adminID" TEXT NOT NULL,
    "hasStarted" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pollID" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Nomination" (
    "id" TEXT NOT NULL,
    "nomination" JSONB NOT NULL,
    "pollID" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Ranking" (
    "participantID" TEXT NOT NULL,
    "participantRankings" JSONB NOT NULL,
    "pollID" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Result" (
    "pollID" TEXT NOT NULL,
    "results" JSONB NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Poll_id_key" ON "Poll"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_id_key" ON "Participant"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Nomination_id_key" ON "Nomination"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Ranking_participantID_key" ON "Ranking"("participantID");

-- CreateIndex
CREATE UNIQUE INDEX "Result_pollID_key" ON "Result"("pollID");

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_participantID_fkey" FOREIGN KEY ("participantID") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
