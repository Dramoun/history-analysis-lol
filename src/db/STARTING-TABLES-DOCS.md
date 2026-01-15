# 📘 Database Schema — Users, Ranked State & Matches

This document defines the **core PostgreSQL schema** used for storing Riot user data, ranked state, ranked history, and ranked matches.

The schema is designed to:

* mirror Riot API concepts closely
* separate *current state* from *historical snapshots*
* support ranked-only data initially
* keep large match payloads out of the database
* remain extensible without breaking changes

---

## 1. `users` — User Identity + Current Ranked State

### Purpose

Represents a Riot account identified by **PUUID**.
Stores the **latest known ranked state** for fast access.

This table is **stateful**: rows are updated on each sync.

---

### Key Design Decisions

* `puuid` is the only stable identifier
* usernames (`game_name`, `tag_line`) are overwritten when changed
* ranked fields are **denormalized on purpose**
* `NULL` ranked fields mean *unranked* or *not available*

---

### Fields

* `puuid`
  Stable Riot account identifier. Primary key.

* `game_name`
  Last known Riot username.

* `tag_line`
  Last known Riot tag.

* `soloq_tier`, `soloq_rank`, `soloq_lp`
  Current Solo Queue ranked state.

* `flex_tier`, `flex_rank`, `flex_lp`
  Current Flex Queue ranked state.

* `first_seen_at`
  Timestamp when this user was first inserted.

* `last_synced_at`
  Timestamp of the most recent API sync.

---

### SQL Definition

```sql
CREATE TABLE users (
  puuid TEXT PRIMARY KEY,

  game_name TEXT NOT NULL,
  tag_line TEXT NOT NULL,

  soloq_tier TEXT,
  soloq_rank TEXT,
  soloq_lp INTEGER,

  flex_tier TEXT,
  flex_rank TEXT,
  flex_lp INTEGER,

  first_seen_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_synced_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 2. `user_rank_history` — Ranked Snapshot History

### Purpose

Stores **historical ranked snapshots** per user and queue.

This table is **append-only**.
Each row represents one meaningful ranked state observed during an API sync.

---

### What belongs here

* Rank values
* Win/loss totals
* Patch and season context
* Sync timestamp

This table answers:

> “What was this user’s rank *at that time*, and under what conditions?”

---

### Fields

* `id`
  Auto-increment primary key.

* `puuid`
  Riot user identifier. Foreign key → `users`.

* `queue_type`
  Ranked queue identifier (mirrors Riot API naming).

* `tier`
  Tier at time of sync.

* `rank`
  Division at time of sync.

* `lp`
  League points.

* `wins`
  Total wins at time of sync.

* `losses`
  Total losses at time of sync.

* `season` *(nullable)*
  Riot season or split identifier (raw value from Riot).

* `patch` *(nullable)*
  Patch / game version (e.g. `14.3`, `14.3.456.123`).

* `synced_at`
  Timestamp when the snapshot was recorded.

---

### Notes

* Rows should only be inserted if rank data changed
* No updates — history is immutable
* Patch/season may be filled later or inferred

---

### SQL Definition

```sql
CREATE TABLE user_rank_history (
  id BIGSERIAL PRIMARY KEY,

  puuid TEXT NOT NULL REFERENCES users(puuid) ON DELETE CASCADE,
  queue_type TEXT NOT NULL,

  tier TEXT NOT NULL,
  rank TEXT NOT NULL,
  lp INTEGER NOT NULL,

  wins INTEGER NOT NULL,
  losses INTEGER NOT NULL,

  season TEXT,
  patch TEXT,

  synced_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 3. `matches` — Ranked Match Metadata

### Purpose

Stores **minimal metadata** for ranked matches.

Full match payloads are stored as compressed JSON files on disk.

---

### Design Notes

* Ranked matches only
* One row per match
* JSON path points to filesystem storage

---

### Fields

* `match_id`
  Riot match identifier. Primary key.

* `queue_type`
  Ranked queue type (mirrors Riot API).

* `played_at`
  Match start timestamp.

* `json_path`
  Filesystem path to compressed match JSON.

---

### SQL Definition

```sql
CREATE TABLE matches (
  match_id TEXT PRIMARY KEY,

  queue_type TEXT NOT NULL,
  played_at TIMESTAMP NOT NULL,

  json_path TEXT NOT NULL
);
```

---

## 4. `user_matches` — User ↔ Match Relationship

### Purpose

Links users to ranked matches they participated in.

Supports:

* per-user match queries
* clean separation of global match metadata

---

### Fields

* `match_id`
  Foreign key → `matches`.

* `puuid`
  Foreign key → `users`.

---

### SQL Definition

```sql
CREATE TABLE user_matches (
  match_id TEXT NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,
  puuid TEXT NOT NULL REFERENCES users(puuid) ON DELETE CASCADE,

  PRIMARY KEY (match_id, puuid)
);
```

---

## 5. Queue Type Representation

Queue types are stored as **raw strings** matching Riot API values.

Examples:

* `RANKED_SOLO_5x5`
* `RANKED_FLEX_SR`

This avoids conversion logic and keeps symmetry with Riot APIs.

---

## 6. Design Guarantees

✔ Stable user identity (PUUID-based)
✔ Fast access to current rank
✔ Append-only rank history
✔ Patch & season context preserved
✔ No large JSON blobs in SQL
✔ Easy future extension

