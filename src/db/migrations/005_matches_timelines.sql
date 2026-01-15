CREATE TABLE matches_timelines (
  match_id TEXT PRIMARY KEY
    REFERENCES matches(match_id)
    ON DELETE CASCADE,

  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

