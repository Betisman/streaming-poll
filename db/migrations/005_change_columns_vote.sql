CREATE TYPE TEAM AS ENUM ('SMILING_DOG', 'DEBUGGING_DEMONS');

CREATE TABLE vote_bak AS SELECT * FROM vote;

DROP TABLE vote;

CREATE TABLE vote (
  id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  voter VARCHAR(255) NOT NULL,
  voted_for TEAM NOT NULL,
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO vote (voter, voted_for, voted_at) SELECT voter, votedFor::TEAM, votedAt FROM vote_bak;

DROP TABLE vote_bak;

CREATE INDEX IF NOT EXISTS vote_voter ON vote (voter);
CREATE INDEX IF NOT EXISTS vote_voted_for ON vote (voted_for);
