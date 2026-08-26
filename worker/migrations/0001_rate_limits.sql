CREATE TABLE IF NOT EXISTS rate_limits (
  scope TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  subject_hash TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (scope, window_start, subject_hash)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start
ON rate_limits(window_start);
