export interface RankState {
  tier: string | null;
  rank: string | null;
  lp: number | null;
}

export interface UserRanks {
  soloq: RankState | null;
  flexq: RankState | null;
}

export interface User {
  puuid: string;
  gameName: string;
  tagLine: string;
  ranks: UserRanks;
}

export interface RankedSnapshot {
  queueType: string;
  tier: string;
  rank: string;
  lp: string;
  wins: number;
  losses: number;
  season?: string;
  patch?: string;
}

export interface RankHistoryInput {
  puuid: string;
  snapshots: RankedSnapshot[];
}

export interface MatchInsert {
  matchId: string;
  queueType: string;
  season?: string;
  patch?: string;

  gameStartTs: Date;
  gameDurationS: number;

  blueTeamChamps: number[];
  redTeamChamps: number[];

  blueTeamBans?: number[];
  redTeamBans?: number[];
}

export interface UserMatchLink {
  puuid: string;
  matchId: string;
  queueType: string;
  playedAt: Date;
}

export interface MatchTimeline {
  matchId: string;
  fetchedAt?: Date;
}

