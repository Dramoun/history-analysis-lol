CREATE TABLE IF NOT EXISTS user_matches (
  puuid    TEXT NOT NULL REFERENCES users(puuid) ON DELETE CASCADE,
  match_id TEXT NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,

  queue_type TEXT NOT NULL,
  played_at  TIMESTAMPTZ NOT NULL,

  PRIMARY KEY (puuid, match_id)
);

CREATE INDEX IF NOT EXISTS idx_user_matches_recent
  ON user_matches (puuid, played_at DESC);

