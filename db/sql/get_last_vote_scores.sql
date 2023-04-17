WITH last_votes AS (
  SELECT DISTINCT ON (voter) voter, votedFor, votedAt
  FROM vote
  ORDER BY voter, votedAt DESC
)
SELECT votedFor, COUNT(*) as votes
FROM last_votes
GROUP BY votedFor;
