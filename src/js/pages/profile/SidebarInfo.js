/**
 * Sidebar Information Display
 * Handles display of ranked and mastery information
 */

import logger from '@/js/utils/logger.js';

/**
 * Display ranked information in the sidebar
 */
export function displayRankedInfo(rankedData) {
  const sidebar = document.querySelector('.profile-sidebar');
  if (!sidebar) {
    logger.warn('Sidebar element not found');
    return;
  }

  let rankedHTML = '';

  if (!rankedData || rankedData.length === 0) {
    rankedHTML += '<div class="sidebar-section ranked-section">';
    rankedHTML += '<h3>Ranked</h3>';
    rankedHTML += '<div class="rank-info unranked">Unranked</div>';
    rankedHTML += '</div>';
  } else {
    const soloQueue = rankedData.find((q) => q.queueType === 'RANKED_SOLO_5x5');
    const flexQueue = rankedData.find((q) => q.queueType === 'RANKED_FLEX_SR');

    if (soloQueue) {
      const rankColor = getRankColor(soloQueue.tier);
      rankedHTML += '<div class="sidebar-section ranked-section">';
      rankedHTML += '<h3>Ranked Solo/Duo</h3>';
      rankedHTML += `
        <div class="rank-info">
          <div class="rank-tier" style="color: ${rankColor};">${soloQueue.tier} ${soloQueue.rank}</div>
          <div class="rank-lp">${soloQueue.leaguePoints} LP</div>
          <div class="rank-winrate">${soloQueue.wins}W ${soloQueue.losses}L</div>
          <div class="rank-winrate-percent">${calculateWinRate(soloQueue.wins, soloQueue.losses)}%</div>
        </div>
      `;
      rankedHTML += '</div>';
    }

    if (flexQueue) {
      const rankColor = getRankColor(flexQueue.tier);
      rankedHTML += '<div class="sidebar-section ranked-section">';
      rankedHTML += '<h3>Ranked Flex</h3>';
      rankedHTML += `
        <div class="rank-info">
          <div class="rank-tier" style="color: ${rankColor};">${flexQueue.tier} ${flexQueue.rank}</div>
          <div class="rank-lp">${flexQueue.leaguePoints} LP</div>
          <div class="rank-winrate">${flexQueue.wins}W ${flexQueue.losses}L</div>
          <div class="rank-winrate-percent">${calculateWinRate(flexQueue.wins, flexQueue.losses)}%</div>
        </div>
      `;
      rankedHTML += '</div>';
    }

    if (!soloQueue && !flexQueue) {
      rankedHTML += '<div class="sidebar-section ranked-section">';
      rankedHTML += '<h3>Ranked</h3>';
      rankedHTML += '<div class="rank-info unranked">Unranked</div>';
      rankedHTML += '</div>';
    }
  }

  sidebar.innerHTML = rankedHTML;
}

/**
 * Display mastery information in the sidebar
 */
export function displayMasteryInfo(masteryData) {
  const sidebar = document.querySelector('.profile-sidebar');
  if (!sidebar) {
    logger.warn('Sidebar element not found');
    return;
  }

  let masteryHTML = '<div class="sidebar-section mastery-section">';
  masteryHTML += '<h3>Champion Mastery</h3>';

  if (!masteryData || masteryData.length === 0) {
    masteryHTML += '<div class="unranked">No mastery data</div>';
  } else {
    const topChampions = masteryData.slice(0, 3);

    topChampions.forEach((champ) => {
      const iconUrl =
        champ.ChampionIconUrl ||
        champ.championIconUrl ||
        `https://ddragon.leagueoflegends.com/cdn/13.6.1/img/champion/${champ.ChampionName || champ.championName}.png`;
      const championName = champ.ChampionName || champ.championName || 'Unknown';
      const championLevel = champ.ChampionLevel || champ.championLevel || 0;
      const championPoints = champ.ChampionPoints || champ.championPoints || 0;

      const fallbackIcon =
        'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22%3E%3Crect width=%2232%22 height=%2232%22 fill=%22%23333333%22/%3E%3C/svg%3E';

      masteryHTML += `
        <div class="mastery-item">
          <img src="${iconUrl}" 
               alt="${championName}" 
               class="mastery-champ-icon"
               onerror="this.src='${fallbackIcon}'">
          <div class="mastery-details">
            <div class="mastery-name">${championName}</div>
            <div class="mastery-level">Level ${championLevel}</div>
            <div class="mastery-points">${formatMasteryPoints(championPoints)} points</div>
          </div>
        </div>
      `;
    });
  }

  masteryHTML += '</div>';

  const existingContent = sidebar.innerHTML;
  sidebar.innerHTML = existingContent + masteryHTML;
}

/**
 * Calculate win rate percentage
 */
function calculateWinRate(wins, losses) {
  const total = wins + losses;
  if (total === 0) return '0';
  return ((wins / total) * 100).toFixed(1);
}

/**
 * Format mastery points with K/M suffix
 */
function formatMasteryPoints(points) {
  if (points >= 1000000) {
    return (points / 1000000).toFixed(1) + 'M';
  } else if (points >= 1000) {
    return (points / 1000).toFixed(1) + 'K';
  }
  return points.toString();
}

/**
 * Get color for rank tier
 */
function getRankColor(tier) {
  switch (tier) {
    case 'IRON':
      return '#6e6e6e';
    case 'BRONZE':
      return '#b87333';
    case 'SILVER':
      return '#c0c0c0';
    case 'GOLD':
      return '#ffd700';
    case 'PLATINUM':
      return '#00e5ee';
    case 'EMERALD':
      return '#50C878';
    case 'DIAMOND':
      return '#b9f2ff';
    case 'MASTER':
      return '#ff00ff';
    case 'GRANDMASTER':
      return '#ff4500';
    case 'CHALLENGER':
      return '#ff0000';
    default:
      return '#22c55e';
  }
}
