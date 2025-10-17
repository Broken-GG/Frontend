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
  /**
   * Displays match history data
   * @param {Array} matchData - Array of match objects
   */
  static displayMatchHistory(matchData) {
    console.log('Displaying match history:', matchData?.length || 0, 'matches');
    
    if (!Array.isArray(matchData) || matchData.length === 0) {
      this.displayNoMatches();
      return;
    }
    
    this.displayMatchList(matchData);
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
    const wins = last10Matches.filter(match => match.Victory === true).length;
    const losses = last10Matches.length - wins;
    
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
    header.innerHTML = `<h3>Recent Games (${total}G ${wins}W ${losses}L)</h3>`;
    container.appendChild(header);
  }

  /**
   * Creates a match card element
   * @param {Object} match - Match data object
   * @returns {HTMLElement} The created match card element
   */
  static createMatchCard(match) {
    const mainPlayer = match.MainPlayer || match.mainPlayer;
    const isWin = match.Victory === true;
    const matchId = match.MatchId || match.matchId || Date.now();
    
    if (!mainPlayer) {
      throw new Error('MainPlayer data missing from match');
    }
    
    const matchCard = document.createElement('div');
    matchCard.className = `match-card ${isWin ? 'victory' : 'defeat'}`;
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
    const cs = Math.floor(Math.random() * 200) + 100;
    const vision = Math.floor(Math.random() * 30) + 10;
    const gameMinutes = gameDurationMinutes || 30;
    const csPerMin = (cs / gameMinutes).toFixed(1);
    
    // Get champion base URL from CONFIG if available, otherwise use default
    const championBaseUrl = window.CONFIG?.IMAGES?.CHAMPION_BASE_URL || 'https://ddragon.leagueoflegends.com/cdn/13.6.1/img/champion';
    
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
          <div class="spell-placeholder"></div>
          <div class="spell-placeholder"></div>
        </div>
      </div>
      
      <div class="items-section">
        <div class="items-row">
          ${'<div class="item-slot"></div>'.repeat(6)}
          <div class="trinket-slot"></div>
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
    const allPlayers = match.AllPlayers || [];
    
    if (allPlayers.length === 0) {
      return '<div class="team-vs-team"><div class="no-team-data">No team data available</div></div>';
    }
    
    const team1 = allPlayers.filter(p => p.TeamId === 100);
    const team2 = allPlayers.filter(p => p.TeamId === 200);
    
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
    const championName = player.ChampionName || 'Unknown';
    const summonerName = player.SummonerName || 'Player';
    const championImageUrl = player.ChampionImageUrl || this.getChampionImageUrl(championName);
    const isMainPlayer = player.IsMainPlayer === true;
    
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