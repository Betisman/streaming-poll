CREATE TABLE user_bak AS SELECT * FROM "user";

DROP TABLE "user";
DROP INDEX IF EXISTS user_slackId;

CREATE TABLE IF NOT EXISTS slack_user (
  id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  slack_id VARCHAR(255) NOT NULL UNIQUE,
  user_type USER_TYPE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS slack_user_slack_id ON slack_user (slack_id);

INSERT INTO slack_user (slack_id, user_type, created_at, updated_at)
SELECT slackId, user_type, createdAt, updatedAt FROM user_bak;

DROP TABLE user_bak;

CREATE TABLE settings_bak AS SELECT * FROM settings;

DROP TABLE settings;
DROP INDEX IF EXISTS settings_poll_status;
DROP INDEX IF EXISTS settings_readable_id;

CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
  readable_id VARCHAR(255) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  poll_status POLL_STATUS NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS settings_poll_status ON settings (poll_status);
CREATE INDEX IF NOT EXISTS settings_readable_id ON settings (readable_id);

INSERT INTO settings (readable_id, event_name, poll_status, created_at, updated_at)
SELECT readable_id, event_name, poll_status, createdAt, updatedAt FROM settings_bak;

DROP TABLE settings_bak;


