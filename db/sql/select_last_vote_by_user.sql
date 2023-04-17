SELECT * FROM vote WHERE voter = %L:voter ORDER BY voted_at DESC LIMIT 1;
