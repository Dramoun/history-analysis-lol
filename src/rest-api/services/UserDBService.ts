import { singleton } from "tsyringe";
import { Database } from "../../db/Database";
import type { User } from "../types/DBTypes";

@singleton()
export class UserDbService {
  constructor(
    private db: Database
  ) {}

  /**
   * Create a user if it doesn't exist,
   * otherwise update name, tag and current rank state.
   */
  async upsertUser(input: User): Promise<void> {
    const {
      puuid,
      gameName,
      tagLine,
      ranks,
    } = input;

    await this.db.query(
      `
      INSERT INTO users (
        puuid,
        game_name,
        tag_line,

        soloq_tier,
        soloq_rank,
        soloq_lp,

        flex_tier,
        flex_rank,
        flex_lp,

        updated_at
      )
      VALUES (
        $1, $2, $3,
        $4, $5, $6,
        $7, $8, $9,
        NOW()
      )
      ON CONFLICT (puuid) DO UPDATE SET
        game_name = EXCLUDED.game_name,
        tag_line  = EXCLUDED.tag_line,

        soloq_tier = EXCLUDED.soloq_tier,
        soloq_rank = EXCLUDED.soloq_rank,
        soloq_lp   = EXCLUDED.soloq_lp,

        flex_tier = EXCLUDED.flex_tier,
        flex_rank = EXCLUDED.flex_rank,
        flex_lp   = EXCLUDED.flex_lp,

        updated_at = NOW();
      `,
      [
        puuid,
        gameName,
        tagLine,

        ranks.soloq?.tier ?? null,
        ranks.soloq?.rank ?? null,
        ranks.soloq?.lp ?? null,

        ranks.flexq?.tier ?? null,
        ranks.flexq?.rank ?? null,
        ranks.flexq?.lp ?? null,
      ]
    );
  }

  /**
   * Fetch user by PUUID.
   * Used to check existence and current state.
   */
  async getUserByPuuid(puuid: string) {
    return this.db.queryOne(
      `SELECT * FROM users WHERE puuid = $1`,
      [puuid]
    );
  }
}

