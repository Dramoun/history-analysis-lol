import { singleton } from 'tsyringe';
import { getDevLogger } from '../../helpers';

import type { Logger } from 'pino';

@singleton()
class RiotApiManager{
  private _baseUrl: string | undefined;
  private _region: string | undefined;
  private _apiKey: string;
  private _logger: Logger;
  
  constructor(){
    this._baseUrl = process.env.BASE_RIOT_URL;   
    this._region = process.env.BASE_RIOT_REGION;
    this._apiKey = process.env.RIOT_API_KEY || 'missing';
    this._envVariablesCheck();
    
    this._logger = getDevLogger();
  }

  private _envVariablesCheck(): void{
    if (!this._region){
      throw new Error('Missing base riot region from environment file!')
    }

    if (!this._baseUrl){
      throw new Error('Missing base riot url from environment file!')
    }

    if (this._apiKey == 'missing'){
      throw new Error('Missing riot api key from environment file!')
    }
  }

  private async _get(path: string, params?: unknown){
    let url = `${this._baseUrl}${path}`; 
    
    if (params && typeof params === "object") {
      const paramObj = new URLSearchParams();

      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          paramObj.append(key, String(value));
        }
      }
      url = `${url}?${paramObj.toString()}`;
    }
    
    while(true){
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Riot-Token': this._apiKey,
        },
      });

      if (!res.ok){
        if (res.status == 429){
          const retryTime = Number(res.headers.get('Retry-After'));
          
          // WARNING: might be a problem later, calls should have minute wait time, they should be called, told they should wait and call again in X 
          this._logger.info(`Status code 429 received: sleeping for ${retryTime}s`);
          await new Promise(r => setTimeout(r, retryTime * 1000));
          continue;
        }
        else{
          throw new Error(`Status code received: ${res.status} for path ${url}, response: ${res}`);
        }
      }

      return res.json();
    }
  }

  private async _getPuiid(username: string, userTag: string){
    const path = `/riot/account/v1/accounts/by-riot-id/${username}/${userTag}`;
    return await this._get(path);
  }

  private async _getMatchIds(puuid: string, total: number, start=0){
    const path = `/lol/match/v5/matches/by-puuid/${puuid}/ids`;

    const matchIds: string[] = [];
    let startIndex = start;

    while (matchIds.length < total) {
      const remaining = total - matchIds.length;
      const batchSize = Math.min(100, remaining);

      const params = {
        start: startIndex,
        count: batchSize,
        type: "ranked",
      };

      const res = await this._get(path, params);

      if (!Array.isArray(res) || res.length === 0) {
        break;
      };

      matchIds.push(...res);
      startIndex += res.length;

      if (res.length < batchSize) {
        break;
      };
    }

    return matchIds.slice(0, total);
  }

  async getMatchData(matchId: string){
    const path = `/lol/match/v5/matches/${matchId}`;
    return this._get(path);
  }
  
  async getMatchTimeline(matchId: string){
    const path = `/lol/match/v5/matches/${matchId}/timeline`;
    return this._get(path);
  }

}

export default RiotApiManager;


