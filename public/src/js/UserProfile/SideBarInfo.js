
import { UserPageService } from './user.js';

/**
 * Fetches sidebar information including ranked and mastery data
 * @param {string} puuid - The player's PUUID
 * @returns {Object} Combined sidebar data
 */
async function fetchSidebarInfo(puuid) {
  const userPageService = new UserPageService();
  try {
    // Fetch both ranked and mastery info in parallel
    const [rankedData, masteryData] = await Promise.all([
      userPageService.getRankedInfo(puuid),
      userPageService.getMasteryInfo(puuid)
    ]);

    console.log('Ranked info fetched:', rankedData);
    console.log('Mastery info fetched:', masteryData);

    return {
      ranked: rankedData,
      mastery: masteryData
    };
  } catch (error) {
    console.error('Error fetching sidebar info:', error);
    throw error;
  }
}

/**
 * Main export function to get sidebar info
 * @param {string} puuid - The player's PUUID
 * @returns {Object} Sidebar information
 */
export async function getSidebarInfo(puuid) {
  const info = await fetchSidebarInfo(puuid);
  return info;
}

/**
 * Displays ranked information in the sidebar
 * @param {Array} rankedData - Array of ranked info objects
 */
export function displayRankedInfo(rankedData) {
  const sidebar = document.querySelector('.profile-sidebar');
  if (!sidebar) {
    console.warn('Sidebar element not found');
    return;
  }

  let rankedHTML = '';

  if (!rankedData || rankedData.length === 0) {
    rankedHTML += '<div class="sidebar-section ranked-section">';
    rankedHTML += '<h3>Ranked</h3>';
    rankedHTML += '<div class="rank-info unranked">Unranked</div>';
    rankedHTML += '</div>';
  } else {
    // Find Solo/Duo queue data
    const soloQueue = rankedData.find(q => q.queueType === 'RANKED_SOLO_5x5');
    const flexQueue = rankedData.find(q => q.queueType === 'RANKED_FLEX_SR');

    // Display Solo/Duo Queue
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

    // Display Flex Queue
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

    // If neither queue has data, show unranked
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
 * Displays mastery information in the sidebar
 * @param {Array} masteryData - Array of mastery info objects (top champions)
 */
export function displayMasteryInfo(masteryData) {
    const sidebar = document.querySelector('.profile-sidebar');
    if (!sidebar) {
        console.warn('Sidebar element not found');
        return;
    }

    let masteryHTML = '<div class="sidebar-section mastery-section">';
    masteryHTML += '<h3>Champion Mastery</h3>';

    if (!masteryData || masteryData.length === 0) {
        masteryHTML += '<div class="unranked">No mastery data</div>';
    } else {
        // Take top 3 champions
        const topChampions = masteryData.slice(0, 3);
        
        console.log('Top 3 champions data:', topChampions);

        topChampions.forEach(champ => {
            console.log('Champion data:', champ);
            
            // Use ChampionIconUrl from backend if available, otherwise build from ChampionName
            const iconUrl = champ.ChampionIconUrl || champ.championIconUrl || 
                          `https://ddragon.leagueoflegends.com/cdn/13.6.1/img/champion/${champ.ChampionName || champ.championName}.png`;
            const championName = champ.ChampionName || champ.championName || 'Unknown';
            const championLevel = champ.ChampionLevel || champ.championLevel || 0;
            const championPoints = champ.ChampionPoints || champ.championPoints || 0;
            
            console.log('Parsed:', { championName, championLevel, championPoints, iconUrl });
            
            const fallbackIcon = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22%3E%3Crect width=%2232%22 height=%2232%22 fill=%22%23333333%22/%3E%3C/svg%3E';
            
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
    
    // Append to existing sidebar content
    const existingContent = sidebar.innerHTML;
    sidebar.innerHTML = existingContent + masteryHTML;
}

/**
 * Calculate win rate percentage
 * @param {number} wins - Number of wins
 * @param {number} losses - Number of losses
 * @returns {string} Win rate percentage
 */
function calculateWinRate(wins, losses) {
  const total = wins + losses;
  if (total === 0) return '0';
  return ((wins / total) * 100).toFixed(1);
}

/**
 * Format mastery points with K/M suffix
 * @param {number} points - Mastery points
 * @returns {string} Formatted points
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
 * @param {string} tier - Rank tier (IRON, BRONZE, SILVER, etc.)
 * @returns {string} Hex color code
 */
function getRankColor(tier) {
  switch(tier) {
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