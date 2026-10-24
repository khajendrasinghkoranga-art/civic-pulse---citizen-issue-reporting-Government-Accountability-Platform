-- Prevent the same voter from casting more than one ballot in an election,
-- including concurrent requests. Existing duplicate rows must be reviewed
-- before applying this migration; do not delete ballots automatically.
CREATE UNIQUE INDEX "Vote_electionId_voterReferenceHash_key"
ON "Vote"("electionId", "voterReferenceHash");
