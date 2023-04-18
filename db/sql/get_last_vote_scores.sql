WITH last_votes AS (
  SELECT DISTINCT ON (voter) voter, voted_for, voted_at
  FROM vote
  ORDER BY voter, voted_at DESC
)
SELECT voted_for, COUNT(*) as votes
FROM last_votes
GROUP BY voted_for;
