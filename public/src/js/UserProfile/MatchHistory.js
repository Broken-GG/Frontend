// Match History Management Module
console.log('🎮 MatchHistory.js loading...');

// Fetch and cache the latest Data Dragon version
let cachedDDragonVersion = null;
async function getLatestDDragonVersion() {
  if (cachedDDragonVersion) {
    return cachedDDragonVersion;
  }
  
  try {
    const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await response.json();
    cachedDDragonVersion = versions[0]; // Latest version is first
    console.log('✅ Latest Data Dragon version:', cachedDDragonVersion);
    return cachedDDragonVersion;
  } catch (error) {
    console.error('Failed to fetch Data Dragon version, using fallback:', error);
    cachedDDragonVersion = '14.20.1'; // Fallback version
    return cachedDDragonVersion;
  }
}

// Initialize version on module load
getLatestDDragonVersion();

/**
 * Loads match history for a summoner by name and tag
 * @param {string} summonerName - The summoner's name
 * @param {string} tagLine - The summoner's tag line
 * @param {Object} userService - Instance of UserPageService for API calls
 */
export async function loadMatchHistoryBySummoner(summonerName, tagLine, userService) {
  console.log('Loading match history for:', summonerName, tagLine);
  
  try {
    const matchData = await userService.getMatchHistoryBySummoner(summonerName, tagLine, 0, 20);
    
    console.log('Match history received:', matchData?.length || 0, 'matches');
    await MatchDisplayManager.displayMatchHistory(matchData, summonerName, tagLine, userService);
    
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
  static allMatches = []; // Store all loaded matches
  static matchesPerLoad = 20; // How many matches to fetch per API call
  static currentStartIndex = 0; // Track where we are in the API pagination
  static summonerName = '';
  static tagLine = '';
  static userService = null;
  static isLoading = false;
  
  /**
   * Displays match history data
   * @param {Array} matchData - Array of match objects
   * @param {string} summonerName - The summoner's name
   * @param {string} tagLine - The summoner's tag line
   * @param {Object} userService - Instance of UserPageService for API calls
   */
  static async displayMatchHistory(matchData, summonerName = '', tagLine = '', userService = null) {
    if (this.isRendering) {
      console.warn('Already rendering match history, skipping...');
      return;
    }
    
    console.log('Displaying match history:', matchData?.length || 0, 'matches');
    
    if (!Array.isArray(matchData) || matchData.length === 0) {
      this.displayNoMatches();
      return;
    }
    
    this.isRendering = true;
    
    // Store for loading more
    this.summonerName = summonerName;
    this.tagLine = tagLine;
    this.userService = userService;
    this.currentStartIndex = matchData.length; // Start next fetch after these matches
    
    // Store matches
    this.allMatches = matchData;
    
    // Clear and display
    const container = document.querySelector('.matches');
    const topContainer = document.querySelector('.profile-main-top');
    
    if (container) {
      container.innerHTML = '';
      
      // Add header to the top section instead of matches container
      if (topContainer) {
        this.addMatchHistoryHeader(topContainer, matchData.length);
      }
      
      await this.displayMatches(matchData, container);
      this.addLoadMoreButton(container);
    }
    
    this.isRendering = false;
  }

  /**
   * Display match cards
   */
  static async displayMatches(matches, container) {
    for (const match of matches) {
      try {
        const matchElement = await this.createMatchCard(match);
        container.appendChild(matchElement);
      } catch (error) {
        console.error('Error creating match card:', error);
      }
    }
  }

  /**
   * Add the "Show more" button
   */
  static addLoadMoreButton(container) {
    // Remove existing button
    const existingButton = container.querySelector('.load-more-button');
    if (existingButton) {
      existingButton.remove();
    }
    
    // Create button
    const button = document.createElement('button');
    button.className = 'load-more-button';
    button.textContent = this.isLoading ? 'Loading...' : 'Show more';
    button.disabled = this.isLoading;
    
    button.addEventListener('click', async () => {
      await this.loadMore();
    });
    
    container.appendChild(button);
  }

  /**
   * Load more matches from API
   */
  static async loadMore() {
    if (this.isLoading) {
      console.log('Already loading...');
      return;
    }
    
    if (!this.userService || !this.summonerName || !this.tagLine) {
      console.error('Missing data to load more matches');
      return;
    }
    
    console.log('Loading more matches... start=' + this.currentStartIndex);
    
    this.isLoading = true;
    const container = document.querySelector('.matches');
    this.addLoadMoreButton(container); // Update button to show "Loading..."
    
    try {
      // Fetch next batch
      const newMatches = await this.userService.getMatchHistoryBySummoner(
        this.summonerName,
        this.tagLine,
        this.currentStartIndex,
        this.matchesPerLoad
      );
      
      console.log('Received ' + (newMatches?.length || 0) + ' new matches');
      
      if (newMatches && newMatches.length > 0) {
        // Add to our array
        this.allMatches.push(...newMatches);
        this.currentStartIndex += newMatches.length;
        
        // Remove button temporarily
        const button = container.querySelector('.load-more-button');
        if (button) button.remove();
        
        // Add new matches to display
        await this.displayMatches(newMatches, container);
        
        // Update header with new stats
        this.updateMatchHistoryHeader();
        
        // Re-add button
        this.addLoadMoreButton(container);
        
        console.log('Total matches now: ' + this.allMatches.length);
      } else {
        console.log('No more matches available');
      }
    } catch (error) {
      console.error('Failed to load more matches:', error);
    } finally {
      this.isLoading = false;
      this.addLoadMoreButton(container); // Update button back to "Show more"
    }
  }

  /**
   * Updates the match history header with current stats
   */
  static updateMatchHistoryHeader() {
    const topContainer = document.querySelector('.profile-main-top');
    if (!topContainer) return;
    
    const header = topContainer.querySelector('.match-history-header');
    if (!header) return;
    
    const totalMatches = this.allMatches.length;
    const wins = this.allMatches.filter(m => m.victory === true || m.Victory === true).length;
    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(0) : 0;
    
    // Calculate KDA stats
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    
    this.allMatches.forEach(match => {
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
    
    // Calculate circle progress
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (winRate / 100) * circumference;
    
    header.innerHTML = `
      <div class="stats-header">Recent Games</div>
      <div class="stats-content">
        <div class="winrate-section">
          <div class="games-label">${totalMatches}G ${wins}W ${losses}L</div>
          <div class="circular-progress">
            <svg width="50" height="50" viewBox="0 0 50 50">
              <circle class="progress-ring-bg" cx="25" cy="25" r="${radius}" />
              <circle class="progress-ring-fill" cx="25" cy="25" r="${radius}"
                      stroke-dasharray="${circumference}"
                      stroke-dashoffset="${offset}" />
            </svg>
            <div class="progress-text">${winRate}%</div>
          </div>
        </div>
        <div class="kda-section">
          <div class="kda-numbers">${avgKills} / ${avgDeaths} / ${avgAssists}</div>
          <div class="kda-label">${kdaRatio}:1 KDA</div>
        </div>
      </div>
    `;
  }

  /**
   * Adds the match history header to the container
   */
  static addMatchHistoryHeader(container, totalMatches) {
    const wins = this.allMatches.filter(m => m.victory === true || m.Victory === true).length;
    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(0) : 0;
    
    // Calculate KDA stats
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    
    this.allMatches.forEach(match => {
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
    
    // Calculate circle progress
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (winRate / 100) * circumference;
    
    const header = document.createElement('div');
    header.className = 'match-history-header';
    header.innerHTML = `
      <div class="stats-header">Recent Games</div>
      <div class="stats-content">
        <div class="winrate-section">
          <div class="games-label">${totalMatches}G ${wins}W ${losses}L</div>
          <div class="circular-progress">
            <svg width="50" height="50" viewBox="0 0 50 50">
              <circle class="progress-ring-bg" cx="25" cy="25" r="${radius}" />
              <circle class="progress-ring-fill" cx="25" cy="25" r="${radius}"
                      stroke-dasharray="${circumference}"
                      stroke-dashoffset="${offset}" />
            </svg>
            <div class="progress-text">${winRate}%</div>
          </div>
        </div>
        <div class="kda-section">
          <div class="kda-numbers">${avgKills} / ${avgDeaths} / ${avgAssists}</div>
          <div class="kda-label">${kdaRatio}:1 KDA</div>
        </div>
      </div>
    `;
    container.appendChild(header);
  }

  /**
   * Creates a match card element
   * @param {Object} match - Match data object
   * @returns {HTMLElement} The created match card element
   */
  static async createMatchCard(match) {
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
    
    matchCard.innerHTML = await this.generateMatchCardHTML(match, mainPlayer, isWin);
    
    return matchCard;
  }

  /**
   * Generates HTML for a match card
   * @param {Object} match - Match data object
   * @param {Object} mainPlayer - Main player data
   * @param {boolean} isWin - Whether the match was won
   * @returns {string} HTML string for the match card
   */
  static async generateMatchCardHTML(match, mainPlayer, isWin) {
    const gameMode = match.GameMode || match.gameMode || 'Unknown';
    const gameDate = match.GameDate || match.gameDate;
    const gameDurationMinutes = match.GameDurationMinutes || match.gameDurationMinutes;
    
    const championName = mainPlayer.ChampionName || mainPlayer.championName || 'Unknown';
    const championImageUrl = mainPlayer.ChampionImageUrl || mainPlayer.championImageUrl || await this.getChampionImageUrl(championName);
    
    const kills = mainPlayer.Kills || mainPlayer.kills || 0;
    const deaths = mainPlayer.Deaths || mainPlayer.deaths || 0;
    const assists = mainPlayer.Assists || mainPlayer.assists || 0;
    
    // Calculate KDA ratio: (kills + assists) / deaths (or "Perfect" if no deaths)
    const kdaRatio = deaths === 0 
      ? 'Perfect' 
      : ((kills + assists) / deaths).toFixed(2);
    
    const parsedGameDate = gameDate ? new Date(gameDate) : new Date();
    const duration = gameDurationMinutes ? `${gameDurationMinutes}:00` : '30:00';
    const timeAgo = this.getTimeAgo(parsedGameDate);
    
    // Mock additional stats
    const cs = mainPlayer.CS || mainPlayer.cs || 0;
    const vision = mainPlayer.VisionScore || mainPlayer.visionScore || 0;
    const gameMinutes = gameDurationMinutes || 30;
    const csPerMin = (cs / gameMinutes).toFixed(1);

    // Get champion base URL from CONFIG if available, otherwise use latest version
    const version = await getLatestDDragonVersion();
    const championBaseUrl = window.CONFIG?.IMAGES?.CHAMPION_BASE_URL || `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion`;
    
    // Generate items and summoner spells HTML before the template literal
    const itemsHTML = await this.generateItemSlotsHTML(mainPlayer);
    const spellsHTML = await this.generateSummonerSpellsHTML(mainPlayer);
    const teamsHTML = await this.createTeamsDisplay(match);

    return `
      <div class="match-info">
        <div class="game-type">${gameMode}</div>
        <div class="time-ago">${timeAgo}</div>
        <div class="game-result ${isWin ? 'win' : 'loss'}">${isWin ? 'Victory' : 'Defeat'}</div>
        <div class="game-duration">${duration}</div>
      </div>

      <div class="champion-section">
        <div>
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
      </div>

      <div class="stats-section">
        <div class="kda">
          <span class="kda-numbers">${kills}/${deaths}/${assists}</span>
          <span class="kda-ratio">${kdaRatio} KDA</span>
        </div>
        <div class="cs-vision">
          <div>CS ${cs} (${csPerMin})</div>
          <div>Vision ${vision}</div>
        </div>
      </div>

      <div class="teams-section">
        ${teamsHTML}
      </div>
    `;
  }

  /**
   * Creates the teams display HTML
   * @param {Object} match - Match data object
   * @returns {string} HTML string for teams display
   */
  static async createTeamsDisplay(match) {
    const allPlayers = match.AllPlayers || match.allPlayers || [];
    
    if (allPlayers.length === 0) {
      return '<div class="team-vs-team"><div class="no-team-data">No team data available</div></div>';
    }
    
    const team1 = allPlayers.filter(p => (p.TeamId || p.teamId) === 100);
    const team2 = allPlayers.filter(p => (p.TeamId || p.teamId) === 200);
    
    const team1HTML = await Promise.all(team1.map(player => this.createPlayerDisplay(player)));
    const team2HTML = await Promise.all(team2.map(player => this.createPlayerDisplay(player)));
    
    return `
      <div class="team-vs-team">
        <div class="team blue-team">
          ${team1HTML.join('')}
        </div>
        <div class="vs-divider">VS</div>
        <div class="team red-team">
          ${team2HTML.join('')}
        </div>
      </div>
    `;
  }

  /**
   * Creates a player display HTML
   * @param {Object} player - Player data object
   * @returns {string} HTML string for player display
   */
  static async createPlayerDisplay(player) {
    const championName = player.ChampionName || player.championName || 'Unknown';
    const summonerName = player.SummonerName || player.summonerName || 'Player';
    const tagLine = player.tagline || player.Tagline || player.tagLine || '';
    const championImageUrl = player.ChampionImageUrl || player.championImageUrl || await this.getChampionImageUrl(championName);
    const isMainPlayer = player.IsMainPlayer === true || player.isMainPlayer === true;
    
    // Escape quotes and special characters for onclick attribute
    const escapedSummonerName = summonerName.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const escapedTagLine = tagLine.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    
    // Get champion base URL from CONFIG if available, otherwise use latest version
    const version = await getLatestDDragonVersion();
    const championBaseUrl = window.CONFIG?.IMAGES?.CHAMPION_BASE_URL || `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion`;
    
    return `
      <div class="team-player ${isMainPlayer ? 'searched-player' : ''}">
        <img src="${championImageUrl}" alt="${championName}" class="team-champion-icon"
             onerror="this.src='${championBaseUrl}/Unknown.png'">
        <button class="player-name" onclick="handleSearch('${escapedSummonerName}', '${escapedTagLine}')">${summonerName}</button>
      </div>
    `;
  }

  /**
   * Gets the champion image URL
   * @param {string} championName - The champion's name
   * @returns {string} URL to the champion image
   */
  static async getChampionImageUrl(championName) {
    const version = await getLatestDDragonVersion();
    const championBaseUrl = window.CONFIG?.IMAGES?.CHAMPION_BASE_URL || `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion`;
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

  static async generateSummonerSpellsHTML(player) {
    // Placeholder: a 1x1 gray pixel data URL
    const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Crect width="32" height="32" fill="%23333333"/%3E%3C/svg%3E';
    
    let spellsHTML = '';
    // Use URLs from backend if available
    const spell1Url = player.summoner1ImageUrl || player.Summoner1ImageUrl;
    const spell2Url = player.summoner2ImageUrl || player.Summoner2ImageUrl;

    if (spell1Url) {
      spellsHTML += `<div class="spell-slot">
        <img src="${spell1Url}" alt="Spell 1" class="spell-icon"
             onerror="this.src='${placeholder}';">
      </div>`;
    } else {
      spellsHTML += `<div class="spell-slot"></div>`;
    }
    if (spell2Url) {
      spellsHTML += `<div class="spell-slot">
        <img src="${spell2Url}" alt="Spell 2" class="spell-icon"
             onerror="this.src='${placeholder}';">
      </div>`;
    } else {
      spellsHTML += `<div class="spell-slot"></div>`;
    }
    return spellsHTML;
  }
  static async generateItemSlotsHTML(player) {
    // Placeholder: a 1x1 gray pixel data URL
    const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Crect width="32" height="32" fill="%23333333"/%3E%3C/svg%3E';
    
    let itemsHTML = '';
    for (let i = 0; i <= 5; i++) {
      // Use URLs from backend if available
      const itemUrl = player[`item${i}ImageUrl`] || player[`Item${i}ImageUrl`];
      const itemId = player[`item${i}`] || player[`Item${i}`];
      
      if (itemUrl && itemId && itemId !== 0) {
        itemsHTML += `<div class="item-slot">
          <img src="${itemUrl}" alt="Item ${itemId}" class="item-icon"
               onerror="this.src='${placeholder}';">
        </div>`;
      } else {
        itemsHTML += `<div class="item-slot"></div>`;
      }
    }
    // Item 6 is the trinket (vision ward slot)
    const trinketUrl = player.item6ImageUrl || player.Item6ImageUrl;
    const trinketId = player.item6 || player.Item6;
    
    if (trinketUrl && trinketId && trinketId !== 0) {
      itemsHTML += `<div class="trinket-slot">
        <img src="${trinketUrl}" alt="Trinket ${trinketId}" class="item-icon"
             onerror="this.src='${placeholder}';">
      </div>`;
    } else {
      itemsHTML += `<div class="trinket-slot"></div>`;
    }
    return itemsHTML;
  }

  static loadMoreMatches() {
    
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

/**
 * Navigates to a summoner's profile page
 * @param {string} summonerName - The summoner's name
 * @param {string} tagLine - The summoner's tag line (optional)
 */
window.handleSearch = function(summonerName, tagLine) {
  console.log('🔍 handleSearch called with:', { summonerName, tagLine });
  
  // If tagLine is not provided or empty, try to parse from summonerName or use default
  if (!tagLine || tagLine === '') {
    if (summonerName.includes('#')) {
      // Format: "Name#TAG"
      const parts = summonerName.split('#');
      summonerName = parts[0];
      tagLine = parts[1];
    } else if (summonerName.includes('/')) {
      // Format: "Name/REGION" - some APIs return this format
      const parts = summonerName.split('/');
      summonerName = parts[0];
      tagLine = parts[1];
    } else {
      // Use default tag line
      tagLine = 'EUW';
    }
  }
  
  console.log('📝 Final values:', { summonerName, tagLine });
  
  // Construct the URL and navigate
  const url = `user.html?summonerName=${encodeURIComponent(summonerName)}&tagLine=${encodeURIComponent(tagLine)}`;
  console.log('🚀 Redirecting to:', url);
  window.location.href = url;
};

console.log('✅ MatchHistory.js fully loaded and exported');
console.log('✅ Exports:', { loadMatchHistoryBySummoner: typeof loadMatchHistoryBySummoner, MatchDisplayManager: typeof MatchDisplayManager });