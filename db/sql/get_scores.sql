SELECT votedFor, COUNT(1) AS votes
FROM vote
GROUP BY 1;
