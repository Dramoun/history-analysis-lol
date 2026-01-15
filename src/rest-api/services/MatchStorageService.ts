import { singleton } from 'tsyringe';
import { decompress, compress } from '@skhaz/zstd';
import { mkdir, writeFile, rename, stat, readFile } from 'fs/promises';
import * as path from 'path';

@singleton()
export default class StorageService {
  private baseDir: string;

  constructor() {
    this.baseDir = process.env.MATCH_STORAGE_PATH || "matches";
  }

  private _getFilePath(matchId: string, timestamp: number, baseDir?: string): string {
    const date = new Date(timestamp);

    const year = String(date.getUTCFullYear());
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2,'0');

    return path.join(baseDir || this.baseDir, year, month, day, `${matchId}.json.zstd`);
  }

  public async exists(matchId: string, timestamp: number, baseDir?: string): Promise<boolean> {
    const filePath = this._getFilePath(matchId, timestamp, baseDir);
    
    try{
      await stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

  public async save(matchId: string, data: object, timestamp: number, baseDir?: string): Promise<void> {
    const filePath = this._getFilePath(matchId, timestamp, baseDir);
    const dir = path.dirname(filePath);

    const json = JSON.stringify(data);
    const compressed = await compress(Buffer.from(json));

    await mkdir(dir, { recursive: true });

    const tmpPath = `${filePath}.tmp`;

    await writeFile(tmpPath, compressed);
    await rename(tmpPath, filePath);
  }

  public async load(matchId: string, timestamp: number, baseDir?: string): Promise<any | null> {
    const filePath = this._getFilePath(matchId, timestamp, baseDir);

    try{
      const file = await readFile(filePath);
      const decompressed = await decompress(file);
      const json = Buffer.from(decompressed).toString('utf8');
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}

