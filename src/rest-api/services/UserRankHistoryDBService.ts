import { singleton } from "tsyringe";
import { Database } from "../../db/Database";
import type { RankHistoryInput, RankedSnapshot } from "../types/DBTypes";


@singleton()
export class UserRankHistoryDbService {
  constructor(
    private db: Database
  ) {}
  
  /**
   * Insert ranked snapshots if they differ from the latest stored state.
   */
  async insertIfChanged(input: RankHistoryInput): Promise<void> {
    const { puuid, snapshots } = input;

    for (const snap of snapshots) {
      const last = await this.db.queryOne<RankedSnapshot>(
        `
        SELECT
          queue_type,
          tier,
          rank,
          lp,
          wins,
          losses,
          season,
          patch
        FROM user_rank_history
        WHERE puuid = $1 AND queue_type = $2
        ORDER BY synced_at DESC
        LIMIT 1
        `,
        [puuid, snap.queueType]
      );

      if (!this.hasChanged(last, snap)) {
        continue;
      }

      await this.db.query(
        `
        INSERT INTO user_rank_history (
          puuid,
          queue_type,
          tier,
          rank,
          lp,
          wins,
          losses,
          season,
          patch
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          puuid,
          snap.queueType,
          snap.tier,
          snap.rank,
          snap.lp,
          snap.wins,
          snap.losses,
          snap.season ?? null,
          snap.patch ?? null,
        ]
      );
    }
  }

  private hasChanged(
    prev: RankedSnapshot | null,
    next: RankedSnapshot
  ): boolean {
    if (!prev) return true;

    return (
      prev.tier !== next.tier ||
      prev.rank !== next.rank ||
      prev.lp !== next.lp ||
      prev.wins !== next.wins ||
      prev.losses !== next.losses ||
      prev.season !== next.season ||
      prev.patch !== next.patch
    );
  }
}

