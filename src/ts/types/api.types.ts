/**
 * API Type Definitions
 * Centralized type definitions for all API responses and data structures
 */

// ============================================================================
// Summoner Types
// ============================================================================

export interface SummonerInfo {
  puuid: string;
  Puuid?: string;
  gameName: string;
  GameName?: string;
  tagLine: string;
  TagLine?: string;
  summonerLevel: number;
  SummonerLevel?: number;
  profileIconUrl?: string;
  ProfileIconUrl?: string;
  revisionDate?: string | number;
  RevisionDate?: string | number;
}

// ============================================================================
// Match Types
// ============================================================================

export interface PlayerStats {
  championName: string;
  ChampionName?: string;
  championImageUrl?: string;
  ChampionImageUrl?: string;
  kills: number;
  Kills?: number;
  deaths: number;
  Deaths?: number;
  assists: number;
  Assists?: number;
  championLevel?: number;
  ChampionLevel?: number;
  totalMinionsKilled?: number;
  TotalMinionsKilled?: number;
  neutralMinionsKilled?: number;
  NeutralMinionsKilled?: number;
  goldEarned?: number;
  GoldEarned?: number;
  totalDamageDealtToChampions?: number;
  TotalDamageDealtToChampions?: number;
  summonerName?: string;
  SummonerName?: string;
  riotIdGameName?: string;
  RiotIdGameName?: string;
  riotIdTagline?: string;
  RiotIdTagline?: string;
  teamId?: number;
  TeamId?: number;
  teamPosition?: string;
  TeamPosition?: string;
  individualPosition?: string;
  IndividualPosition?: string;
  // Items
  item0?: number;
  Item0?: number;
  item1?: number;
  Item1?: number;
  item2?: number;
  Item2?: number;
  item3?: number;
  Item3?: number;
  item4?: number;
  Item4?: number;
  item5?: number;
  Item5?: number;
  item6?: number;
  Item6?: number;
  // Item Image URLs
  item0ImageUrl?: string;
  Item0ImageUrl?: string;
  item1ImageUrl?: string;
  Item1ImageUrl?: string;
  item2ImageUrl?: string;
  Item2ImageUrl?: string;
  item3ImageUrl?: string;
  Item3ImageUrl?: string;
  item4ImageUrl?: string;
  Item4ImageUrl?: string;
  item5ImageUrl?: string;
  Item5ImageUrl?: string;
  item6ImageUrl?: string;
  Item6ImageUrl?: string;
  // Summoner Spells
  summoner1Id?: number;
  Summoner1Id?: number;
  summoner2Id?: number;
  Summoner2Id?: number;
  summoner1ImageUrl?: string;
  Summoner1ImageUrl?: string;
  summoner2ImageUrl?: string;
  Summoner2ImageUrl?: string;
  // Stats
  cs?: number;
  CS?: number;
  visionScore?: number;
  VisionScore?: number;
  // Arena specific
  placement?: number;
  Placement?: number;
  playerAugment1?: number;
  PlayerAugment1?: number;
  playerAugment2?: number;
  PlayerAugment2?: number;
  playerAugment3?: number;
  PlayerAugment3?: number;
  playerAugment4?: number;
  PlayerAugment4?: number;
  playerSubteamId?: number;
  PlayerSubteamId?: number;
}

export interface MatchData {
  matchId: string;
  MatchId?: string;
  gameMode: string;
  GameMode?: string;
  gameDate: string | Date;
  GameDate?: string | Date;
  gameDurationMinutes: number;
  GameDurationMinutes?: number;
  gameDuration?: number;
  GameDuration?: number;
  victory: boolean;
  Victory?: boolean;
  mainPlayer: PlayerStats;
  MainPlayer?: PlayerStats;
  allPlayers?: PlayerStats[];
  AllPlayers?: PlayerStats[];
}

export type MatchHistory = MatchData[];

// ============================================================================
// Ranked Types
// ============================================================================

export interface RankedQueueInfo {
  queueType: 'RANKED_SOLO_5x5' | 'RANKED_FLEX_SR' | 'RANKED_FLEX_TT';
  tier: 'IRON' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'EMERALD' | 'DIAMOND' | 'MASTER' | 'GRANDMASTER' | 'CHALLENGER';
  rank: 'I' | 'II' | 'III' | 'IV';
  leaguePoints: number;
  wins: number;
  losses: number;
}

export type RankedInfo = RankedQueueInfo[];

// ============================================================================
// Mastery Types
// ============================================================================

export interface ChampionMastery {
  championId: number;
  championLevel: number;
  ChampionLevel?: number;
  championPoints: number;
  ChampionPoints?: number;
  championName?: string;
  ChampionName?: string;
  championImageUrl?: string;
  championIconUrl?: string;
  ChampionImageUrl?: string;
  ChampionIconUrl?: string;
  lastPlayTime?: number;
  tokensEarned?: number;
}

export type MasteryInfo = ChampionMastery[];

// ============================================================================
// Match Statistics Types
// ============================================================================

export interface RoleStats {
  top: number;
  jungle: number;
  mid: number;
  adc: number;
  support: number;
}

export interface MatchStatistics {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKills: string;
  avgDeaths: string;
  avgAssists: string;
  kdaRatio: string;
  roleStats: RoleStats;
}

// ============================================================================
// Data Dragon Types
// ============================================================================

export interface ItemData {
  name: string;
  description: string;
  image: {
    full: string;
    sprite: string;
    group: string;
  };
  gold: {
    base: number;
    total: number;
    sell: number;
    purchasable: boolean;
  };
}

export interface SummonerSpellData {
  id: string;
  name: string;
  description: string;
  image: {
    full: string;
    sprite: string;
    group: string;
  };
  key: string;
}

export interface AugmentData {
  id: number | string;
  name: string;
  iconUrl: string;
  rarity: 'kBronze' | 'kSilver' | 'kGold' | 'kPrismatic' | string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Helper type for properties that might have different casing from API
 */
export type FlexibleCase<T> = T & {
  [K in keyof T as Capitalize<string & K>]?: T[K];
};
