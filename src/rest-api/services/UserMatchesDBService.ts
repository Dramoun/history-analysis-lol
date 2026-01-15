import { singleton } from "tsyringe";
import { Database } from "../../db/Database";
import type { UserMatchLink } from "../types/DBTypes";

@singleton()
export class UserMatchesDbService {
  constructor(
    private db: Database
  ) {}

  async link(input: UserMatchLink): Promise<void> {
    await this.db.query(
      `
      INSERT INTO user_matches (
        puuid,
        match_id,
        queue_type,
        played_at
      )
      VALUES ($1,$2,$3,$4)
      ON CONFLICT DO NOTHING
      `,
      [
        input.puuid,
        input.matchId,
        input.queueType,
        input.playedAt,
      ]
    );
  }
}

