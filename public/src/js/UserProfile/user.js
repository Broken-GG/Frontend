// User Profile Page JavaScript
console.log('🚀 user.js script started executing');

try {
  console.log('📦 Attempting to import MatchHistory module...');
} catch (error) {
  console.error('❌ Error before import:', error);
}

import { loadMatchHistoryBySummoner, MatchDisplayManager } from './MatchHistory.js';
import { getSidebarInfo, displayRankedInfo, displayMasteryInfo } from './SideBarInfo.js';

console.log('✅ MatchHistory module imported successfully');
console.log('✅ loadMatchHistoryBySummoner:', typeof loadMatchHistoryBySummoner);
console.log('✅ MatchDisplayManager:', typeof MatchDisplayManager);

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
    ITEM_BASE_URL: 'https://ddragon.leagueoflegends.com/cdn/13.6.1/img/item',
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

// Make CONFIG available globally for MatchHistory module
window.CONFIG = CONFIG;

export class UserPageService {
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

  async getRankedInfo(puuid) {
    return this.makeRequest(`/SidePanelInfo/ranked/${encodeURIComponent(puuid)}`, { 
      method: 'GET' 
    });
  }

  async getMasteryInfo(puuid) {
    return this.makeRequest(`/SidePanelInfo/mastery/${encodeURIComponent(puuid)}`, { 
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
    static updateProfileIcon(data) {
      const profileIcon = document.getElementById('profile-icon');
      if (!profileIcon) return;

      // Riot API usually provides profileIconId, not a URL. Build the URL if needed.
      let iconUrl = data.profileIconUrl || data.ProfileIconUrl || data.profileiconurl;
      if (!iconUrl && (data.profileIconId || data.profileiconId)) {
        const iconId = data.profileIconId || data.profileiconId;
        iconUrl = `https://ddragon.leagueoflegends.com/cdn/14.20.1/img/profileicon/${iconId}.png`;
      }

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

async function displaySummonerData(data, userService = null) {
  console.log('Displaying summoner data:', data);
  console.log('Data keys:', Object.keys(data));
  
  ProfileDisplayManager.updateBasicInfo(data);
  ProfileDisplayManager.updateProfileIcon(data);
  
  // Store data for future use
  window.currentSummonerData = data;
  
  console.log('✅ Profile loaded successfully. Loading match history...');
  
  // Create userService if not provided
  if (!userService) {
    userService = new UserPageService();
  }
  
  // Load sidebar info (ranked and mastery) - non-blocking
  // Check for puuid with multiple possible property names (case-insensitive)
  const puuid = data.puuid || data.Puuid || data.PUUID || data.pUUID || 
                data.puuId || data.PuuId || data.PUUID;
  
  if (puuid) {
    console.log('Loading sidebar info for puuid:', puuid);
    // Don't await - load in background
    getSidebarInfo(puuid)
      .then(sidebarData => {
        console.log('Sidebar data loaded:', sidebarData);
        
        // Display ranked info
        if (sidebarData.ranked) {
          displayRankedInfo(sidebarData.ranked);
        }
        
        // Display mastery info
        if (sidebarData.mastery) {
          displayMasteryInfo(sidebarData.mastery);
        }
      })
      .catch(error => {
        console.error('Failed to load sidebar info:', error);
        // Display error state in sidebar
        const sidebar = document.querySelector('.profile-sidebar');
        if (sidebar) {
          sidebar.innerHTML = '<div class="sidebar-section"><p class="unranked">Sidebar data unavailable</p></div>';
        }
      });
  } else {
    console.warn('No puuid found in summoner data, cannot load sidebar info');
    console.warn('Available data properties:', Object.keys(data));
  }
  
  await loadMatchHistoryBySummoner(data.summonerName, data.tagline, userService);
}

async function loadSummonerProfile() {
  console.log('Loading summoner profile...');
  
  try {
    const { summonerName, tagLine } = getUrlParameters();
    
    if (!summonerName || !tagLine) {
      throw new Error('Missing summoner name or tag line in URL parameters');
    }
    
    // Create userService instance
    const userService = new UserPageService();
    
    // Try cache first
    const cachedData = CacheManager.loadData(summonerName, tagLine);
    if (cachedData) {
      console.log('Using cached summoner data');
      await displaySummonerData(cachedData, userService);
      return;
    }
    
    console.log('Loading profile for:', summonerName, tagLine);
    showLoading();
    
    const summonerData = await userService.getSummonerInfo(summonerName, tagLine);
    
    // Cache the data
    CacheManager.saveData(summonerName, tagLine, summonerData);
    
    await displaySummonerData(summonerData, userService);
    console.log('Profile loaded successfully');
    
  } catch (error) {
    console.error('Failed to load summoner profile:', error);
    showError(error.message);
  } finally {
    hideLoading();
  }
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

// Navigation and utility functions
function refreshProfile() {
  CacheManager.clearCache();
  loadSummonerProfile();
}

function manualUpdateProfile() {
  console.log('Manual update requested');
  refreshProfile();
}

function goBackToSearch() {
  window.location.href = '../../index.html';
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM Content Loaded - initializing...');
  try {
    loadSummonerProfile();
  } catch (error) {
    console.error('❌ Error in DOMContentLoaded:', error);
    showError(`Initialization error: ${error.message}`);
  }
});

// Make functions available globally
window.refreshProfile = refreshProfile;
window.manualUpdateProfile = manualUpdateProfile;
window.goBackToSearch = goBackToSearch;

console.log('✅ user.js fully loaded and initialized');