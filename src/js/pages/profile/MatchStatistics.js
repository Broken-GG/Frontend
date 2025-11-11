/**
 * Match Statistics Calculator
 * Calculates match stats, win rates, KDA, and role distribution
 */

import logger from '@/js/utils/logger.js';

export class MatchStatistics {
  /**
   * Calculate overall match statistics
   */
  static calculateMatchStats(matches) {
    const totalMatches = matches.length;
    const wins = matches.filter((m) => m.victory === true || m.Victory === true).length;
    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(0) : 0;

    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;

    matches.forEach((match) => {
      const player = match.MainPlayer || match.mainPlayer;
      if (player) {
        totalKills += player.kills || player.Kills || 0;
        totalDeaths += player.deaths || player.Deaths || 0;
        totalAssists += player.assists || player.Assists || 0;
      }
    });

    const avgKills = (totalKills / totalMatches).toFixed(1);
    const avgDeaths = (totalDeaths / totalMatches).toFixed(1);
    const avgAssists = (totalAssists / totalMatches).toFixed(1);
    const kdaRatio = totalDeaths > 0 ? ((totalKills + totalAssists) / totalDeaths).toFixed(2) : 'Perfect';

    const roleStats = this.calculateRoleStats(matches);

    return {
      totalMatches,
      wins,
      losses,
      winRate,
      avgKills,
      avgDeaths,
      avgAssists,
      kdaRatio,
      roleStats,
    };
  }

  /**
   * Calculate role distribution statistics
   */
  static calculateRoleStats(matches) {
    const roles = {
      top: 0,
      jungle: 0,
      mid: 0,
      adc: 0,
      support: 0,
    };

    matches.forEach((match) => {
      const player = match.MainPlayer || match.mainPlayer;
      if (!player) return;

      const position = (player.TeamPosition || player.teamPosition || '').toUpperCase();

      if (position === 'TOP') roles.top++;
      else if (position === 'JUNGLE') roles.jungle++;
      else if (position === 'MIDDLE' || position === 'MID') roles.mid++;
      else if (position === 'BOTTOM' || position === 'ADC' || position === 'BOT') roles.adc++;
      else if (position === 'UTILITY' || position === 'SUPPORT' || position === 'SUP') roles.support++;
    });

    return roles;
  }

  /**
   * Calculate win rate percentage
   */
  static calculateWinRate(wins, losses) {
    const total = wins + losses;
    if (total === 0) return 0;
    return ((wins / total) * 100).toFixed(0);
  }

  /**
   * Calculate KDA ratio
   */
  static calculateKDA(kills, deaths, assists) {
    if (deaths === 0) return 'Perfect';
    return ((kills + assists) / deaths).toFixed(2);
  }
}

export default MatchStatistics;
