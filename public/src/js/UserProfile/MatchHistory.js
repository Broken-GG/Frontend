// Match History Management Module
console.log('🎮 MatchHistory.js loading...');

/**
 * Loads match history for a summoner by name and tag
 * @param {string} summonerName - The summoner's name
 * @param {string} tagLine - The summoner's tag line
 * @param {Object} userService - Instance of UserPageService for API calls
 */
export async function loadMatchHistoryBySummoner(summonerName, tagLine, userService) {
  console.log('Loading match history for:', summonerName, tagLine);
  
  try {
    const matchData = await userService.getMatchHistoryBySummoner(summonerName, tagLine);
    
    console.log('Match history received:', matchData?.length || 0, 'matches');
    MatchDisplayManager.displayMatchHistory(matchData);
    
  } catch (error) {
    console.error('Failed to load match history:', error);
    MatchDisplayManager.displayNoMatches();
  }
}

/**
 * Match Display Manager - Handles all match history display logic
 */
export class MatchDisplayManager {
  static isRendering = false;
  
  /**
   * Displays match history data
   * @param {Array} matchData - Array of match objects
   */
  static displayMatchHistory(matchData) {
    if (this.isRendering) {
      console.warn('⚠️ Already rendering match history, skipping...');
      return;
    }
    
    console.log('Displaying match history:', matchData?.length || 0, 'matches');
    
    if (!Array.isArray(matchData) || matchData.length === 0) {
      this.displayNoMatches();
      return;
    }
    
    this.isRendering = true;
    this.displayMatchList(matchData);
    this.isRendering = false;
  }

  /**
   * Displays a list of matches
   * @param {Array} matches - Array of match objects
   */
  static displayMatchList(matches) {
    const container = document.querySelector('.matches');
    if (!container) {
      console.error('Matches container not found');
      return;
    }
    
    container.innerHTML = '';
    
    const last10Matches = matches.slice(0, 10);
    
    // Count wins by checking the match.victory property
    const wins = last10Matches.filter(match => match.victory === true || match.Victory === true).length;
    const losses = last10Matches.length - wins;
    
    console.log('📊 Match stats - Total:', last10Matches.length, 'Wins:', wins, 'Losses:', losses);
    
    // Add header
    this.addMatchHistoryHeader(container, last10Matches.length, wins, losses);
    
    // Add match cards
    last10Matches.forEach(match => {
      try {
        const matchElement = this.createMatchCard(match);
        container.appendChild(matchElement);
      } catch (error) {
        console.error('Error creating match card:', error);
      }
    });
  }

  /**
   * Adds the match history header to the container
   * @param {HTMLElement} container - The container element
   * @param {number} total - Total number of matches
   * @param {number} wins - Number of wins
   * @param {number} losses - Number of losses
   */
  static addMatchHistoryHeader(container, total, wins, losses) {
    const header = document.createElement('div');
    header.className = 'match-history-header';
    const winRate = total > 0 ? ((wins / total) * 100).toFixed(2) : 0;
    header.innerHTML = `<h3>Recent Games (${total}G ${wins}W ${losses}L) - Win Rate: ${winRate}%</h3>`;
    container.appendChild(header);
  }

  /**
   * Creates a match card element
   * @param {Object} match - Match data object
   * @returns {HTMLElement} The created match card element
   */
  static createMatchCard(match) {
    const mainPlayer = match.MainPlayer || match.mainPlayer;
    
    // Win status is in the match object, not mainPlayer
    const isWin = match.victory === true || match.Victory === true;
    const matchId = match.MatchId || match.matchId || Date.now();
    
    if (!mainPlayer) {
      throw new Error('MainPlayer data missing from match');
    }
    
    const matchCard = document.createElement('div');
    matchCard.className = `match-card ${isWin ? 'victory' : 'defeat'}`;
    console.log('✅ Match card created - isWin:', isWin, 'match.victory:', match.victory, 'className:', matchCard.className);
    matchCard.setAttribute('data-match-id', matchId);
    
    matchCard.innerHTML = this.generateMatchCardHTML(match, mainPlayer, isWin);
    
    return matchCard;
  }

  /**
   * Generates HTML for a match card
   * @param {Object} match - Match data object
   * @param {Object} mainPlayer - Main player data
   * @param {boolean} isWin - Whether the match was won
   * @returns {string} HTML string for the match card
   */
  static generateMatchCardHTML(match, mainPlayer, isWin) {
    const gameMode = match.GameMode || match.gameMode || 'Unknown';
    const gameDate = match.GameDate || match.gameDate;
    const gameDurationMinutes = match.GameDurationMinutes || match.gameDurationMinutes;
    
    const championName = mainPlayer.ChampionName || mainPlayer.championName || 'Unknown';
    const championImageUrl = mainPlayer.ChampionImageUrl || mainPlayer.championImageUrl || this.getChampionImageUrl(championName);
    
    const kills = mainPlayer.Kills || mainPlayer.kills || 0;
    const deaths = mainPlayer.Deaths || mainPlayer.deaths || 0;
    const assists = mainPlayer.Assists || mainPlayer.assists || 0;
    const kdaText = mainPlayer.KDA || mainPlayer.kda || `${kills}/${deaths}/${assists}`;
    
    const parsedGameDate = gameDate ? new Date(gameDate) : new Date();
    const duration = gameDurationMinutes ? `${gameDurationMinutes}:00` : '30:00';
    const timeAgo = this.getTimeAgo(parsedGameDate);
    
    // Mock additional stats
    const cs = mainPlayer.CS || mainPlayer.cs || 0;
    const vision = mainPlayer.VisionScore || mainPlayer.visionScore || 0;
    const gameMinutes = gameDurationMinutes || 30;
    const csPerMin = (cs / gameMinutes).toFixed(1);

    // Get champion base URL from CONFIG if available, otherwise use default
    const championBaseUrl = window.CONFIG?.IMAGES?.CHAMPION_BASE_URL || 'https://ddragon.leagueoflegends.com/cdn/13.6.1/img/champion';
    
    // Generate items and summoner spells HTML before the template literal
    const itemsHTML = this.generateItemSlotsHTML(mainPlayer);
    const spellsHTML = this.generateSummonerSpellsHTML(mainPlayer);

    return `
      <div class="match-info">
        <div class="game-type">${gameMode}</div>
        <div class="time-ago">${timeAgo}</div>
        <div class="game-result ${isWin ? 'win' : 'loss'}">${isWin ? 'Victory' : 'Defeat'}</div>
        <div class="game-duration">${duration}</div>
      </div>

      <div class="champion-section">
        <div class="champion-container">
          <img src="${championImageUrl}" alt="${championName}" class="champion-icon"
               onerror="this.src='${championBaseUrl}/Unknown.png'">
        </div>
        <div class="summoner-spells">
          ${spellsHTML}
        </div>
      </div>

      <div class="items-section">
        <div class="items-row">
          ${itemsHTML}
        </div>
      </div>

      <div class="stats-section">
        <div class="kda">
          <span class="kda-numbers">${kills}/${deaths}/${assists}</span>
          <span class="kda-ratio">${kdaText}</span>
        </div>
        <div class="cs-vision">
          <div>CS ${cs} (${csPerMin})</div>
          <div>Vision ${vision}</div>
        </div>
      </div>

      <div class="teams-section">
        ${this.createTeamsDisplay(match)}
      </div>
    `;
  }

  /**
   * Creates the teams display HTML
   * @param {Object} match - Match data object
   * @returns {string} HTML string for teams display
   */
  static createTeamsDisplay(match) {
    const allPlayers = match.AllPlayers || match.allPlayers || [];
    
    if (allPlayers.length === 0) {
      return '<div class="team-vs-team"><div class="no-team-data">No team data available</div></div>';
    }
    
    const team1 = allPlayers.filter(p => (p.TeamId || p.teamId) === 100);
    const team2 = allPlayers.filter(p => (p.TeamId || p.teamId) === 200);
    
    return `
      <div class="team-vs-team">
        <div class="team blue-team">
          ${team1.map(player => this.createPlayerDisplay(player)).join('')}
        </div>
        <div class="vs-divider">VS</div>
        <div class="team red-team">
          ${team2.map(player => this.createPlayerDisplay(player)).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Creates a player display HTML
   * @param {Object} player - Player data object
   * @returns {string} HTML string for player display
   */
  static createPlayerDisplay(player) {
    const championName = player.ChampionName || player.championName || 'Unknown';
    const summonerName = player.SummonerName || player.summonerName || 'Player';
    const championImageUrl = player.ChampionImageUrl || player.championImageUrl || this.getChampionImageUrl(championName);
    const isMainPlayer = player.IsMainPlayer === true || player.isMainPlayer === true;
    
    // Get champion base URL from CONFIG if available, otherwise use default
    const championBaseUrl = window.CONFIG?.IMAGES?.CHAMPION_BASE_URL || 'https://ddragon.leagueoflegends.com/cdn/13.6.1/img/champion';
    
    return `
      <div class="team-player ${isMainPlayer ? 'searched-player' : ''}">
        <img src="${championImageUrl}" alt="${championName}" class="team-champion-icon"
             onerror="this.src='${championBaseUrl}/Unknown.png'">
        <span class="player-name">${summonerName}</span>
      </div>
    `;
  }

  /**
   * Gets the champion image URL
   * @param {string} championName - The champion's name
   * @returns {string} URL to the champion image
   */
  static getChampionImageUrl(championName) {
    const championBaseUrl = window.CONFIG?.IMAGES?.CHAMPION_BASE_URL || 'https://ddragon.leagueoflegends.com/cdn/13.6.1/img/champion';
    return `${championBaseUrl}/${championName}.png`;
  }

  /**
   * Calculates time ago from a date
   * @param {Date} date - The date to calculate from
   * @returns {string} Human-readable time ago string
   */
  static getTimeAgo(date) {
    const now = new Date();
    const diffInMilliseconds = now - date;
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  static generateSummonerSpellsHTML(player) {
    const spellBaseUrl = window.CONFIG?.IMAGES?.SPELL_BASE_URL || 'https://ddragon.leagueoflegends.com/cdn/13.6.1/img/spell';
    // Placeholder: a 1x1 gray pixel data URL
    const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Crect width="32" height="32" fill="%23333333"/%3E%3C/svg%3E';
    
    let spellsHTML = '';
    const spell1Id = player.summoner1Id || player.Summoner1Id;
    const spell2Id = player.summoner2Id || player.Summoner2Id;

    if (spell1Id) {
      spellsHTML += `<div class="spell-slot">
        <img src="${spellBaseUrl}/${spell1Id}.png" alt="" class="spell-icon"
             onerror="this.src='${placeholder}';">
      </div>`;
    } else {
      spellsHTML += `<div class="spell-slot"></div>`;
    }
    if (spell2Id) {
      spellsHTML += `<div class="spell-slot">
        <img src="${spellBaseUrl}/${spell2Id}.png" alt="" class="spell-icon"
             onerror="this.src='${placeholder}';">
      </div>`;
    } else {
      spellsHTML += `<div class="spell-slot"></div>`;
    }
    return spellsHTML;
  }
  static generateItemSlotsHTML(player) {
    // Original: show items in their original slots (item0-item5), gaps preserved, Data Dragon only
    const itemBaseUrl = window.CONFIG?.IMAGES?.ITEM_BASE_URL || 'https://ddragon.leagueoflegends.com/cdn/13.6.1/img/item';
    // Placeholder: a 1x1 gray pixel data URL
    const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Crect width="32" height="32" fill="%23333333"/%3E%3C/svg%3E';
    
    let itemsHTML = '';
    for (let i = 0; i <= 5; i++) {
      const itemId = player[`item${i}`] || player[`Item${i}`];
      if (itemId && itemId !== 0) {
        itemsHTML += `<div class="item-slot">
          <img src="${itemBaseUrl}/${itemId}.png" alt="Item ${itemId}" class="item-icon"
               onerror="this.src='${placeholder}';">
        </div>`;
      } else {
        itemsHTML += `<div class="item-slot"></div>`;
      }
    }
    // Item 6 is the trinket (vision ward slot)
    const trinketId = player.item6 || player.Item6;
    if (trinketId && trinketId !== 0) {
      itemsHTML += `<div class="trinket-slot">
        <img src="${itemBaseUrl}/${trinketId}.png" alt="Trinket ${trinketId}" class="item-icon"
             onerror="this.src='${placeholder}';">
      </div>`;
    } else {
      itemsHTML += `<div class="trinket-slot"></div>`;
    }
    return itemsHTML;
  }

  /**
   * Displays a "no matches" message
   */
  static displayNoMatches() {
    const container = document.querySelector('.matches');
    if (container) {
      container.innerHTML = `
        <div class="match-history-header">
          <h3>Recent Games (0G 0W 0L)</h3>
        </div>
        <div class="no-matches">No recent matches found</div>
      `;
    }
  }
}

console.log('✅ MatchHistory.js fully loaded and exported');
console.log('✅ Exports:', { loadMatchHistoryBySummoner: typeof loadMatchHistoryBySummoner, MatchDisplayManager: typeof MatchDisplayManager });