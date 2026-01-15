CREATE TABLE IF NOT EXISTS users (
  puuid TEXT PRIMARY KEY,

  game_name TEXT NOT NULL,
  tag_line  TEXT NOT NULL,

  solo_tier TEXT,
  solo_rank TEXT,
  solo_lp   INT,

  flex_tier TEXT,
  flex_rank TEXT,
  flex_lp   INT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

