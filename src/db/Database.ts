import { singleton } from "tsyringe";
import { Pool } from "pg";

@singleton()
export class Database {
  private pool: Pool;

  constructor() {
    const {
      PG_HOST,
      PG_PORT,
      PG_USER,
      PG_PASSWORD,
      PG_DATABASE,
    } = process.env;

    if (!PG_HOST || !PG_PORT || !PG_USER || !PG_PASSWORD || !PG_DATABASE) {
      throw new Error("PostgreSQL env vars missing");
    }

    this.pool = new Pool({
      host: PG_HOST,
      port: Number(PG_PORT),
      user: PG_USER,
      password: PG_PASSWORD,
      database: PG_DATABASE,
      max: 10, // connection limit
      idleTimeoutMillis: 30_000,
    });
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const res = await this.pool.query(sql, params);
    return res.rows;
  }

  async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const res = await this.pool.query(sql, params);
    return res.rows[0] ?? null;
  }

  async end(): Promise<void> {
    // Rare usage:
    //  server shutdown clean up, tests
    await this.pool.end();
  }
}

