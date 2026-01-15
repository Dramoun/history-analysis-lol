CREATE TABLE IF NOT EXISTS user_rank_history (
  id BIGSERIAL PRIMARY KEY,

  puuid TEXT NOT NULL REFERENCES users(puuid) ON DELETE CASCADE,

  queue_type TEXT NOT NULL,

  tier   TEXT NOT NULL,
  rank   TEXT NOT NULL,
  lp     INT  NOT NULL,
  wins   INT  NOT NULL,
  losses INT  NOT NULL,

  season TEXT,
  patch  TEXT,

  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_rank_history_latest
  ON user_rank_history (puuid, queue_type, synced_at DESC);

