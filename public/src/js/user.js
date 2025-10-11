// User Profile Page JavaScript

// Configuration
const CONFIG = {
  API: {
    BASE_URL: 'http://localhost:5000/api',
    FALLBACK_URL: 'https://localhost:5001/api',
    TIMEOUT: 10000,
    DEFAULT_HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    DEFAULT_OPTIONS: {
      mode: 'cors',
      credentials: 'omit',
    }
  },
  IMAGES: {
    CHAMPION_BASE_URL: 'https://ddragon.leagueoflegends.com/cdn/13.6.1/img/champion',
    FALLBACK_ICONS: [
      'https://ddragon.leagueoflegends.com/cdn/14.20.1/img/profileicon/0.png',
      'https://ddragon.leagueoflegends.com/cdn/13.6.1/img/profileicon/0.png',
      'https://static.wikia.nocookie.net/leagueoflegends/images/6/6c/ProfileIcon1732.png'
    ]
  },
  CACHE: {
    DURATION: 5 * 60 * 1000 // 5 minutes
  }
};

class UserPageService {
  constructor() {
    this.baseUrl = CONFIG.API.BASE_URL;
    this.fallbackUrl = CONFIG.API.FALLBACK_URL;
    this.timeout = CONFIG.API.TIMEOUT;
  }

  async makeRequest(endpoint, options = {}) {
    const config = {
      ...CONFIG.API.DEFAULT_OPTIONS,
      headers: CONFIG.API.DEFAULT_HEADERS,
      ...options
    };

    return this._tryRequestWithFallback(endpoint, config);
  }

  async _tryRequestWithFallback(endpoint, config) {
    try {
      return await this._fetchFromUrl(this.baseUrl + endpoint, config);
    } catch (error) {
      console.error('Primary request failed, trying fallback:', error);
      try {
        return await this._fetchFromUrl(this.fallbackUrl + endpoint, config);
      } catch (fallbackError) {
        throw new Error(`Failed to fetch data: ${error.message}`);
      }
    }
  }

  async _fetchFromUrl(url, config) {
    console.log('Making request to:', url);
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    return data;
  }

  async getSummonerInfo(summonerName, tagLine) {
    return this.makeRequest(`/SummonerInfo/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagLine)}`, { 
      method: 'GET' 
    });
  }

  async getMatchHistoryBySummoner(summonerName, tagLine) {
    return this.makeRequest(`/MatchInfo/summoner/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagLine)}`, { 
      method: 'GET' 
    });
  }
}

// DOM Utility Functions
class DOMUtils {
  static getUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      summonerName: urlParams.get('summonerName'),
      tagLine: urlParams.get('tagLine'),
      profileURLIconId: urlParams.get('ProfileIconUrl')
    };
  }

  static updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  static updateElementsWithLoadingState(elementIds, isLoading = true) {
    elementIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        if (isLoading) {
          element.textContent = 'Loading...';
          element.classList.add('loading');
        } else {
          element.classList.remove('loading');
        }
      }
    });
  }

  static showError(message) {
    console.error('User page error:', message);
    
    // Update profile elements with error state
    const errorUpdates = {
      'profile-name': 'Error',
      'profile-tag': '#Error',
      'profile-lvl': '?'
    };

    Object.entries(errorUpdates).forEach(([id, text]) => {
      this.updateElementText(id, text);
    });

    // Set default error icon
    const profileIcon = document.getElementById('profile-icon');
    if (profileIcon) {
      profileIcon.src = CONFIG.IMAGES.FALLBACK_ICONS[2];
      profileIcon.onerror = null;
    }

    this._createErrorContainer(message);
  }

  static _createErrorContainer(message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-container';
    errorContainer.innerHTML = `
      <div class="error-message">
        <h3>Failed to load summoner data</h3>
        <p>${message}</p>
        <button onclick="window.history.back()" class="back-button">Go Back</button>
      </div>
    `;
    
    const container = document.querySelector('.profile-container');
    if (container) {
      container.prepend(errorContainer);
    }
  }

  static setupImageWithFallbacks(imgElement, primaryUrl, fallbackUrls = CONFIG.IMAGES.FALLBACK_ICONS) {
    if (!imgElement || !primaryUrl) return;

    let currentFallbackIndex = 0;
    
    const tryNextFallback = () => {
      if (currentFallbackIndex < fallbackUrls.length) {
        imgElement.src = fallbackUrls[currentFallbackIndex];
        currentFallbackIndex++;
      } else {
        imgElement.onerror = null; // Stop trying
      }
    };

    imgElement.onerror = tryNextFallback;
    imgElement.src = primaryUrl;
  }
}

// Utility functions
function getUrlParameters() {
  return DOMUtils.getUrlParameters();
}

function showLoading() {
  const elements = ['profile-name', 'profile-tag', 'profile-lvl', 'profile-lastupdate', 'profile-icon'];
  DOMUtils.updateElementsWithLoadingState(elements, true);
}

function hideLoading() {
  const elements = document.querySelectorAll('.loading');
  elements.forEach(element => {
    element.classList.remove('loading');
  });
}

function showError(message) {
  DOMUtils.showError(message);
}

// Profile Display Functions
class ProfileDisplayManager {
  static updateBasicInfo(data) {
    DOMUtils.updateElementText('profile-name', data.summonerName || 'Unknown');
    DOMUtils.updateElementText('profile-tag', `#${data.tagline || 'Unknown'}`);
    DOMUtils.updateElementText('profile-lvl', data.level || '?');
    
    const now = new Date();
    DOMUtils.updateElementText('profile-lastupdate', now.toLocaleString());
    
    document.title = `${data.summonerName}#${data.tagline} - User Profile`;
  }

  static updateProfileIcon(data) {
    const profileIcon = document.getElementById('profile-icon');
    if (!profileIcon) return;

    const iconUrl = data.profileIconUrl || data.ProfileIconUrl || data.profileiconurl;
    
    if (iconUrl && iconUrl !== '') {
      console.log('Setting profile icon to:', iconUrl);
      DOMUtils.setupImageWithFallbacks(profileIcon, iconUrl);
      
      profileIcon.onload = () => console.log('✅ Profile icon loaded successfully');
    } else {
      console.warn('⚠️ No profile icon URL found, using default');
      profileIcon.src = CONFIG.IMAGES.FALLBACK_ICONS[2];
    }
  }
}

async function displaySummonerData(data) {
  console.log('Displaying summoner data:', data);
  
  ProfileDisplayManager.updateBasicInfo(data);
  ProfileDisplayManager.updateProfileIcon(data);
  
  // Store data for future use
  window.currentSummonerData = data;
  
  console.log('✅ Profile loaded successfully. Loading match history...');
  await loadMatchHistoryBySummoner(data.summonerName, data.tagline);
}

async function loadSummonerProfile() {
  console.log('Loading summoner profile...');
  
  try {
    const { summonerName, tagLine } = getUrlParameters();
    
    if (!summonerName || !tagLine) {
      throw new Error('Missing summoner name or tag line in URL parameters');
    }
    
    // Try cache first
    const cachedData = CacheManager.loadData(summonerName, tagLine);
    if (cachedData) {
      console.log('Using cached summoner data');
      await displaySummonerData(cachedData);
      return;
    }
    
    console.log('Loading profile for:', summonerName, tagLine);
    showLoading();
    
    const userService = new UserPageService();
    const summonerData = await userService.getSummonerInfo(summonerName, tagLine);
    
    // Cache the data
    CacheManager.saveData(summonerName, tagLine, summonerData);
    
    await displaySummonerData(summonerData);
    console.log('Profile loaded successfully');
    
  } catch (error) {
    console.error('Failed to load summoner profile:', error);
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// Match History Functions
async function loadMatchHistoryBySummoner(summonerName, tagLine) {
  console.log('Loading match history for:', summonerName, tagLine);
  
  try {
    const userService = new UserPageService();
    const matchData = await userService.getMatchHistoryBySummoner(summonerName, tagLine);
    
    console.log('Match history received:', matchData?.length || 0, 'matches');
    displayMatchHistory(matchData);
    
  } catch (error) {
    console.error('Failed to load match history:', error);
    displayNoMatches();
  }
}

// Match Display Functions
class MatchDisplayManager {
  static displayMatchHistory(matchData) {
    console.log('Displaying match history:', matchData?.length || 0, 'matches');
    
    if (!Array.isArray(matchData) || matchData.length === 0) {
      this.displayNoMatches();
      return;
    }
    
    this.displayMatchList(matchData);
  }

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

  static addMatchHistoryHeader(container, total, wins, losses) {
    const header = document.createElement('div');
    header.className = 'match-history-header';
    header.innerHTML = `<h3>Recent Games (${total}G ${wins}W ${losses}L)</h3>`;
    container.appendChild(header);
  }

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
               onerror="this.src='${CONFIG.IMAGES.CHAMPION_BASE_URL}/Unknown.png'">
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

  static createPlayerDisplay(player) {
    const championName = player.ChampionName || 'Unknown';
    const summonerName = player.SummonerName || 'Player';
    const championImageUrl = player.ChampionImageUrl || this.getChampionImageUrl(championName);
    const isMainPlayer = player.IsMainPlayer === true;
    
    return `
      <div class="team-player ${isMainPlayer ? 'searched-player' : ''}">
        <img src="${championImageUrl}" alt="${championName}" class="team-champion-icon"
             onerror="this.src='${CONFIG.IMAGES.CHAMPION_BASE_URL}/Unknown.png'">
        <span class="player-name">${summonerName}</span>
      </div>
    `;
  }

  static getChampionImageUrl(championName) {
    return `${CONFIG.IMAGES.CHAMPION_BASE_URL}/${championName}.png`;
  }

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

// Wrapper functions for backwards compatibility
function displayMatchHistory(matchData) {
  MatchDisplayManager.displayMatchHistory(matchData);
}

function displayNoMatches() {
  MatchDisplayManager.displayNoMatches();
}


// Cache Management
class CacheManager {
  static getKey(summonerName, tagLine) {
    return `summoner_${summonerName}_${tagLine}`;
  }

  static saveData(summonerName, tagLine, data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        summonerName,
        tagLine
      };
      localStorage.setItem('lastSearchedSummoner', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save to cache:', error);
    }
  }

  static loadData(summonerName, tagLine) {
    try {
      const storedData = localStorage.getItem('lastSearchedSummoner');
      if (!storedData) return null;

      const parsed = JSON.parse(storedData);
      
      // Check if data matches and is recent
      if (parsed.summonerName === summonerName && 
          parsed.tagLine === tagLine && 
          parsed.timestamp > Date.now() - CONFIG.CACHE.DURATION) {
        return parsed.data;
      }
    } catch (error) {
      console.warn('Failed to load from cache:', error);
    }
    
    return null;
  }

  static clearCache() {
    localStorage.removeItem('lastSearchedSummoner');
  }
}

// Main loading and initialization functions
async function loadSummonerProfile() {
  console.log('Loading summoner profile...');
  
  try {
    const { summonerName, tagLine } = getUrlParameters();
    
    if (!summonerName || !tagLine) {
      throw new Error('Missing summoner name or tag line in URL parameters');
    }
    
    // Try cache first
    const cachedData = CacheManager.loadData(summonerName, tagLine);
    if (cachedData) {
      console.log('Using cached summoner data');
      await displaySummonerData(cachedData);
      return;
    }
    
    console.log('Loading profile for:', summonerName, tagLine);
    showLoading();
    
    const userService = new UserPageService();
    const summonerData = await userService.getSummonerInfo(summonerName, tagLine);
    
    // Cache the data
    CacheManager.saveData(summonerName, tagLine, summonerData);
    
    await displaySummonerData(summonerData);
    console.log('Profile loaded successfully');
    
  } catch (error) {
    console.error('Failed to load summoner profile:', error);
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// Navigation and utility functions
function refreshProfile() {
  CacheManager.clearCache();
  loadSummonerProfile();
}

function goBackToSearch() {
  window.location.href = '../../index.html';
}

// Initialize the page
document.addEventListener('DOMContentLoaded', loadSummonerProfile);

// Make functions available globally
window.refreshProfile = refreshProfile;
window.goBackToSearch = goBackToSearch;