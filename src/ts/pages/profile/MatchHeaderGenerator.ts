/**
 * Match Header Generator
 * Generates HTML for match history headers and statistics displays
 */
import type { MatchStatistics, RoleStats } from '@/types/api.types.js';

export class MatchHeaderGenerator {
  /**
   * Generate complete header HTML with stats
   */
  static generateHeaderHTML(stats: MatchStatistics): string {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (stats.winRate / 100) * circumference;

    return `
      <div class="stats-header">Recent Games</div>
      <div class="stats-content">
        <div class="winrate-section">
          <div class="games-label">${stats.totalMatches}G ${stats.wins}W ${stats.losses}L</div>
          <div class="circular-progress">
            <svg width="50" height="50" viewBox="0 0 50 50">
              <circle class="progress-ring-bg" cx="25" cy="25" r="${radius}" />
              <circle class="progress-ring-fill" cx="25" cy="25" r="${radius}"
                      stroke-dasharray="${circumference}"
                      stroke-dashoffset="${offset}" />
            </svg>
            <div class="progress-text">${stats.winRate}%</div>
          </div>
        </div>
        <div class="kda-section">
          <div class="kda-numbers">${stats.avgKills} / ${stats.avgDeaths} / ${stats.avgAssists}</div>
          <div class="kda-label">${stats.kdaRatio}:1 KDA</div>
        </div>
      </div>
      <div class="role-stats">
        ${this.generateRoleStatsHTML(stats.roleStats, stats.totalMatches)}
      </div>
    `;
  }

  /**
   * Generate role statistics bars HTML
   */
  static generateRoleStatsHTML(roleStats: RoleStats, totalMatches: number): string {
    const maxGames = totalMatches > 0 ? totalMatches : 1;

    const roles = [
      {
        name: 'Top',
        count: roleStats.top,
        icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-top.png',
      },
      {
        name: 'Jungle',
        count: roleStats.jungle,
        icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-jungle.png',
      },
      {
        name: 'Mid',
        count: roleStats.mid,
        icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-middle.png',
      },
      {
        name: 'ADC',
        count: roleStats.adc,
        icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-bottom.png',
      },
      {
        name: 'Support',
        count: roleStats.support,
        icon: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-clash/global/default/assets/images/position-selector/positions/icon-position-utility.png',
      },
    ];

    return roles
      .map((role) => {
        const heightPercent = maxGames > 0 ? (role.count / maxGames) * 100 : 0;
        return `
        <div class="role-stat">
          <div class="role-bar-container">
            <div class="role-bar-fill" style="height: ${heightPercent}%"></div>
          </div>
          <img src="${role.icon}" alt="${role.name}" class="role-icon" />
          <div class="role-count">${role.count}</div>
        </div>
      `;
      })
      .join('');
  }

  /**
   * Generate circular progress SVG
   */
  static generateCircularProgress(winRate: number, radius = 20): string {
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (winRate / 100) * circumference;

    return `
      <svg width="50" height="50" viewBox="0 0 50 50">
        <circle class="progress-ring-bg" cx="25" cy="25" r="${radius}" />
        <circle class="progress-ring-fill" cx="25" cy="25" r="${radius}"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${offset}" />
      </svg>
      <div class="progress-text">${winRate}%</div>
    `;
  }

  /**
   * Generate no matches placeholder HTML
   */
  static generateNoMatchesHTML(): string {
    return `
      <div class="match-history-header">
        <h3>Recent Games (0G 0W 0L)</h3>
      </div>
      <div class="no-matches">No recent matches found</div>
    `;
  }
}

export default MatchHeaderGenerator;
