import { singleton } from "tsyringe";
import { Database } from "../../db/Database";
import type { MatchTimeline } from "../types/DBTypes";

@singleton()
export class MatchTimelinesDbService {
  constructor(
    private db: Database
  ) {}

  /**
   * Inserts a timeline row for a match.
   * If a row already exists, updates fetchedAt.
   */
  async insertOrUpdate(input: MatchTimeline): Promise<void> {
    await this.db.query(
      `
      INSERT INTO match_timelines (match_id, fetched_at)
      VALUES ($1, $2)
      ON CONFLICT (match_id) DO UPDATE
        SET fetched_at = EXCLUDED.fetched_at
      `,
      [
        input.matchId,
        input.fetchedAt ?? new Date(),
      ]
    );
  }
  
  /**
   * Returns true if timeline for match already exists
   */
  async exists(matchId: string): Promise<boolean> {
    const rows = await this.db.query<{ match_id: string }>(
      `SELECT match_id FROM match_timelines WHERE match_id = $1`,
      [matchId]
    );

    return rows.length > 0;
  }

  /**
   * Fetch timeline metadata
   */
  async get(matchId: string): Promise<MatchTimeline | null> {
    const rows = await this.db.query<MatchTimeline>(
      `SELECT match_id, fetched_at FROM match_timelines WHERE match_id = $1`,
      [matchId]
    );

    return rows[0] ?? null;
  }
}
