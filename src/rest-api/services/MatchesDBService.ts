import { singleton } from "tsyringe";
import { Database } from "../../db/Database";
import type { MatchInsert } from "../types/DBTypes";

@singleton()
export class MatchesDbService {
  constructor(
    private db: Database
  ) {}

  /**
   * Inserts match metadata if it does not already exist.
   * Returns true if inserted, false if already present.
   */
  async insertIfMissing(match: MatchInsert): Promise<boolean> {
    const res = await this.db.query(
      `
      INSERT INTO matches (
        match_id,
        queue_type,
        season,
        patch,
        game_start_ts,
        game_duration_s,
        blue_team_champs,
        red_team_champs,
        blue_team_bans,
        red_team_bans
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (match_id) DO NOTHING
      RETURNING match_id
      `,
      [
        match.matchId,
        match.queueType,
        match.season ?? null,
        match.patch ?? null,
        match.gameStartTs,
        match.gameDurationS,
        match.blueTeamChamps,
        match.redTeamChamps,
        match.blueTeamBans ?? null,
        match.redTeamBans ?? null,
      ]
    );

    return res.length === 1;
  }
}

