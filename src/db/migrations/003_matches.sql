CREATE TABLE IF NOT EXISTS matches (
  match_id TEXT PRIMARY KEY,

  queue_type TEXT NOT NULL,
  season     TEXT,
  patch      TEXT,

  game_start_ts     TIMESTAMPTZ NOT NULL,
  game_duration_s   INT NOT NULL,

  blue_team_champs INT[] NOT NULL,
  red_team_champs  INT[] NOT NULL,

  blue_team_bans INT[],
  red_team_bans  INT[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

