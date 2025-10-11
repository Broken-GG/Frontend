// User Profile Page JavaScript
class UserPageService {
  constructor() {
    // Match your backend URL - HTTP port 5000 based on your logs
    this.baseUrl = 'http://localhost:5000/api';
    this.fallbackUrl = 'https://localhost:5001/api';
    this.timeout = 10000;
  }

  async makeRequest(endpoint, options = {}) {
    let url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
    };

    const config = { ...defaultOptions, ...options };

    try {
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
      
    } catch (error) {
      console.error('HTTPS request failed, trying HTTP fallback:', error);
      
      // Try HTTP fallback
      url = `${this.fallbackUrl}${endpoint}`;
      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
      } catch (fallbackError) {
        console.error('Both HTTPS and HTTP requests failed');
        throw new Error(`Failed to fetch summoner data: ${error.message}`);
      }
    }
  }

  async getSummonerInfo(summonerName, tagLine) {
    return this.makeRequest(`/SummonerInfo/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagLine)}`, { 
      method: 'GET' 
    });
  }

  async getMatchHistory(puuid) {
    return this.makeRequest(`/MatchInfo/${encodeURIComponent(puuid)}`, { 
      method: 'GET' 
    });
  }

  async getMatchHistoryBySummoner(summonerName, tagLine) {
    // More secure approach - let backend handle PUUID internally
    return this.makeRequest(`/MatchInfo/summoner/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagLine)}`, { 
      method: 'GET' 
    });
  }
}

// Utility functions
function getUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    summonerName: urlParams.get('summonerName'),
    tagLine: urlParams.get('tagLine'),
    profileURLIconId: urlParams.get('ProfileIconUrl')
  };
}

function showLoading() {
  const elements = ['profile-name', 'profile-tag', 'profile-lvl', 'profile-lastupdate', 'profile-icon'];
  elements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = 'Loading...';
      element.classList.add('loading');
    }
  });
}

function hideLoading() {
  const elements = document.querySelectorAll('.loading');
  elements.forEach(element => {
    element.classList.remove('loading');
  });
}

function showError(message) {
  console.error('User page error:', message);
  
  // Display error in profile elements
  const profileName = document.getElementById('profile-name');
  const profileTag = document.getElementById('profile-tag');
  const profileLvl = document.getElementById('profile-lvl');
  const profileIcon = document.getElementById('profile-icon');
  
  if (profileName) profileName.textContent = 'Error';
  if (profileTag) profileTag.textContent = '#Error';
  if (profileLvl) profileLvl.textContent = '?';
  if (profileIcon) {
    profileIcon.src = 'https://static.wikia.nocookie.net/leagueoflegends/images/6/6c/ProfileIcon1732.png';
    profileIcon.onerror = null; // Clear any error handlers
  }

  // You could also add a dedicated error container
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

async function displaySummonerData(data) {
  console.log('Displaying summoner data:', data);
  
  // Update profile name
  const profileName = document.getElementById('profile-name');
  if (profileName) {
    profileName.textContent = data.summonerName || 'Unknown';
  }
  
  // Update profile tag
  const profileTag = document.getElementById('profile-tag');
  if (profileTag) {
    profileTag.textContent = `#${data.tagline || 'Unknown'}`;
  }
  
  // Update profile icon with comprehensive error handling
  const profileIcon = document.getElementById('profile-icon');
  if (profileIcon) {
    // Try different possible property names (case sensitivity)
    const iconUrl = data.profileIconUrl || data.ProfileIconUrl || data.profileiconurl || null;
    
    console.log('Profile icon data analysis:');
    console.log('- Raw data object:', data);
    console.log('- profileIconUrl:', data.profileIconUrl);
    console.log('- ProfileIconUrl:', data.ProfileIconUrl);
    console.log('- Selected iconUrl:', iconUrl);
    
    if (iconUrl && iconUrl !== '') {
      console.log('Setting profile icon to:', iconUrl);
      
      // Clear any previous error handlers
      profileIcon.onerror = null;
      profileIcon.onload = null;
      
      // Set the new image source
      profileIcon.src = iconUrl;
      
      // Add comprehensive error handling for image loading
      profileIcon.onerror = function() {
        console.warn('❌ Failed to load profile icon from:', iconUrl);
        console.log('🔄 Attempting fallback to default icon');
        
        // Try a few fallback options
        const fallbackIcons = [
          'https://ddragon.leagueoflegends.com/cdn/14.20.1/img/profileicon/0.png',
          'https://ddragon.leagueoflegends.com/cdn/13.6.1/img/profileicon/0.png',
          'https://static.wikia.nocookie.net/leagueoflegends/images/6/6c/ProfileIcon1732.png'
        ];
        
        // Try first fallback
        this.src = fallbackIcons[0];
        this.onerror = function() {
          console.warn('❌ First fallback also failed, trying second...');
          this.src = fallbackIcons[1];
          this.onerror = function() {
            console.warn('❌ Second fallback failed, using wiki image...');
            this.src = fallbackIcons[2];
            this.onerror = null; // Stop trying after this
          };
        };
      };
      
      // Add success handler
      profileIcon.onload = function() {
        console.log('✅ Profile icon loaded successfully from:', iconUrl);
      };
    } else {
      console.warn('⚠️  No profile icon URL found in data');
      console.log('📋 Available properties:', Object.keys(data));
      console.log('🔄 Using default icon');
      profileIcon.src = 'https://static.wikia.nocookie.net/leagueoflegends/images/6/6c/ProfileIcon1732.png';
    }
  }

  // Update profile level
  const profileLvl = document.getElementById('profile-lvl');
  if (profileLvl) {
    profileLvl.textContent = data.level || '?';
  }
  
  // Update last update time
  const profileLastUpdate = document.getElementById('profile-lastupdate');
  if (profileLastUpdate) {
    const now = new Date();
    profileLastUpdate.textContent = now.toLocaleString();
  }
  
  // Update document title
  document.title = `${data.summonerName}#${data.tagline} - User Profile`;
  
  // Store data for future use (optional)
  window.currentSummonerData = data;
  
  // Load match history after profile is loaded
  console.log('✅ Profile loaded successfully. Loading match history...');
  
  // Load match history using the secure method
  await loadMatchHistoryBySummoner(data.summonerName, data.tagline);
}

async function loadSummonerProfile() {
  console.log('Loading summoner profile...');
  
  try {
    // Get URL parameters
    const { summonerName, tagLine } = getUrlParameters();
    
    if (!summonerName || !tagLine) {
      throw new Error('Missing summoner name or tag line in URL parameters');
    }
    
    console.log('Loading profile for:', summonerName, tagLine);
    
    // Show loading state
    showLoading();
    
    // Create service instance and fetch data
    const userService = new UserPageService();
    const summonerData = await userService.getSummonerInfo(summonerName, tagLine);
    
    // Display the data
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
async function loadMatchHistory(puuid) {
  console.log('🎮 loadMatchHistory called with PUUID:', puuid);
  
  try {
    // Show loading state for match history
    // showMatchHistoryLoading(); // Function removed
    console.log('📱 Loading state shown');
    
    const userService = new UserPageService();
    console.log('🔧 UserPageService created, making API call...');
    
    const matchData = await userService.getMatchHistory(puuid);
    
    console.log('📊 Match history API response received:');
    console.log('- Type:', typeof matchData);
    console.log('- Is Array:', Array.isArray(matchData));
    console.log('- Data:', matchData);
    
    // Display match history
    displayMatchHistory(matchData);
    
  } catch (error) {
    console.error('❌ Failed to load match history:', error);
    console.log('📋 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    displayNoMatches();
  }
}

// New secure method - no PUUID exposure
async function loadMatchHistoryBySummoner(summonerName, tagLine) {
  console.log('🔒 loadMatchHistoryBySummoner called with:', summonerName, tagLine);
  
  try {
    // Show loading state for match history
    // showMatchHistoryLoading(); // Function removed
    console.log('📱 Loading state shown');
    
    const userService = new UserPageService();
    console.log('🔧 UserPageService created, making secure API call...');
    
    const matchData = await userService.getMatchHistoryBySummoner(summonerName, tagLine);
    
    console.log('📊 Secure match history API response received:');
    console.log('- Type:', typeof matchData);
    console.log('- Is Array:', Array.isArray(matchData));
    console.log('- Length:', matchData?.length);
    console.log('- Raw Data:', matchData);
    console.log('- Stringified:', JSON.stringify(matchData, null, 2));
    
    if (matchData && matchData.length > 0) {
      console.log('🔍 First match analysis:');
      console.log('- First match type:', typeof matchData[0]);
      console.log('- First match keys:', Object.keys(matchData[0]));
      console.log('- MainPlayer exists:', 'MainPlayer' in matchData[0]);
      console.log('- MainPlayer value:', matchData[0].MainPlayer);
      console.log('- Victory exists:', 'Victory' in matchData[0]);
      console.log('- Victory value:', matchData[0].Victory);
    }
    
    // Display match history
    displayMatchHistory(matchData);
    
    // Add debug info to page to see backend structure
    addBackendDebugInfo(matchData);
    
  } catch (error) {
    console.error('❌ Failed to load match history securely:', error);
    console.log('📋 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Fallback: try the old PUUID method if it exists in the data
    console.log('🔄 Attempting fallback to direct PUUID method...');
    if (window.currentSummonerData && (window.currentSummonerData.puuid || window.currentSummonerData.PUUID)) {
      const puuid = window.currentSummonerData.puuid || window.currentSummonerData.PUUID;
      console.log('🔄 Using stored PUUID for fallback:', puuid);
      // API call would be made here to get match history if needed
      console.log('📊 Match history API endpoint available if needed');
    } else {
      console.log('⚠️ Unable to make match history API call');
    }
  }
}

// All match history display functions removed - keeping only API functionality

function getTimeAgo(date) {
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

function formatGameDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Debug function to show backend data structure on page
function addBackendDebugInfo(matchData) {
  const debugContainer = document.createElement('div');
  debugContainer.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    width: 400px;
    max-height: 500px;
    overflow-y: auto;
    background: rgba(0,0,0,0.9);
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-family: monospace;
    font-size: 11px;
    z-index: 10000;
    border: 2px solid #00ff00;
  `;
  
  let debugInfo = '<h4>🔍 Backend Response Debug</h4>';
  debugInfo += `<p><strong>Type:</strong> ${typeof matchData}</p>`;
  debugInfo += `<p><strong>Is Array:</strong> ${Array.isArray(matchData)}</p>`;
  debugInfo += `<p><strong>Length:</strong> ${matchData?.length || 'N/A'}</p>`;
  
  if (matchData && matchData.length > 0) {
    const firstMatch = matchData[0];
    debugInfo += '<h5>First Match Structure:</h5>';
    debugInfo += `<p><strong>Keys:</strong> ${Object.keys(firstMatch).join(', ')}</p>`;
    debugInfo += `<p><strong>MainPlayer exists:</strong> ${'MainPlayer' in firstMatch}</p>`;
    debugInfo += `<p><strong>mainPlayer exists:</strong> ${'mainPlayer' in firstMatch}</p>`;
    debugInfo += `<p><strong>Victory exists:</strong> ${'Victory' in firstMatch}</p>`;
    debugInfo += `<p><strong>victory exists:</strong> ${'victory' in firstMatch}</p>`;
    
    if (firstMatch.MainPlayer) {
      debugInfo += '<h5>MainPlayer Structure:</h5>';
      debugInfo += `<p><strong>Keys:</strong> ${Object.keys(firstMatch.MainPlayer).join(', ')}</p>`;
    }
    
    debugInfo += '<h5>Raw JSON (truncated):</h5>';
    debugInfo += `<pre style="font-size: 9px; max-height: 200px; overflow: auto;">${JSON.stringify(firstMatch, null, 1).substring(0, 1000)}...</pre>`;
  }
  
  debugContainer.innerHTML = debugInfo;
  document.body.appendChild(debugContainer);
  
  // Auto-remove after 30 seconds
  setTimeout(() => {
    if (debugContainer.parentNode) {
      debugContainer.parentNode.removeChild(debugContainer);
    }
  }, 30000);
}

// OP.GG Style Match History Display - Fixed for backend structure
function displayMatchHistory(matchData) {
  console.log('🎮 Displaying OP.GG style match history:', matchData);
  console.log('🔍 Match data type:', typeof matchData);
  console.log('🔍 Is array:', Array.isArray(matchData));
  
  // Your backend returns an array of MatchSummary objects directly
  let matches = [];
  if (Array.isArray(matchData)) {
    matches = matchData;
    console.log('✅ Using direct array format from backend');
  } else {
    console.log('❌ Expected array but got:', typeof matchData);
    displayNoMatches();
    return;
  }
  
  console.log('📊 Total matches found:', matches.length);
  
  if (!matches || matches.length === 0) {
    console.log('❌ No matches to display');
    displayNoMatches();
    return;
  }
  
  // Log first match structure for debugging
  console.log('🎯 First match structure:', matches[0]);
  console.log('🎯 First match keys:', Object.keys(matches[0]));
  console.log('🎯 First match full JSON:', JSON.stringify(matches[0], null, 2));
  console.log('🎯 MainPlayer exists?', matches[0]?.MainPlayer !== undefined);
  console.log('🎯 MainPlayer value:', matches[0]?.MainPlayer);
  console.log('🎯 Victory value:', matches[0]?.Victory);
  
  console.log('✅ Processing matches for display...');
  displayMatchList(matches);
}

function displayMatchList(matches) {
  const container = document.querySelector('.matches');
  
  if (!container) {
    console.error('❌ Matches container not found');
    return;
  }
  
  // Clear the matches container
  container.innerHTML = '';
  
  // Limit to last 10 matches
  const last10Matches = matches.slice(0, 10);
  
  // Create match history header
  const header = document.createElement('div');
  header.className = 'match-history-header';
  const wins = last10Matches.filter(match => match.Victory === true).length; // Fixed: use Victory
  const losses = last10Matches.length - wins;
  
  header.innerHTML = `
    <h3>Recent Games (${last10Matches.length}G ${wins}W ${losses}L)</h3>
  `;
  container.appendChild(header);
  console.log('📝 Header added with stats:', { total: last10Matches.length, wins, losses });
  
  // Add each match as a separate card directly to the matches container
  last10Matches.forEach((match, index) => {
    console.log(`🎯 Creating individual match card ${index + 1} for:`, match);
    console.log(`🎯 Match Victory status:`, match.Victory);
    console.log(`🎯 Match MainPlayer:`, match.MainPlayer);
    
    try {
      const matchElement = createOPGGMatchCard(match);
      console.log(`✅ Match element created for ${index + 1}:`, matchElement.className);
      
      container.appendChild(matchElement);
      console.log(`✅ Added match card ${index + 1} to matches container`);
      
    } catch (error) {
      console.error(`❌ Error creating match card ${index + 1}:`, error);
      console.error(`❌ Match data:`, match);
    }
  });
  
  console.log(`🏁 Total match cards added: ${last10Matches.length}`);
  
  // Debug: Check final container state
  setTimeout(() => {
    console.log('🔍 Final container inspection:');
    console.log('📏 Container children count:', container.children.length);
    console.log('📐 Container innerHTML length:', container.innerHTML.length);
    console.log('👀 Container visibility:', window.getComputedStyle(container).display);
    console.log('📊 Container dimensions:', {
      width: container.offsetWidth,
      height: container.offsetHeight
    });
    
    if (container.children.length > 1) { // >1 because we have header + cards
      console.log('🎉 SUCCESS: Match cards are in the container!');
      console.log('🔍 Container structure:', Array.from(container.children).map(child => child.className));
    } else {
      console.error('💥 PROBLEM: No match cards in container despite processing');
      console.log('🔍 Container HTML:', container.innerHTML.substring(0, 500));
    }
  }, 200);
}

function createOPGGMatchCard(match) {
  console.log('🔧 Creating match card for backend match:', match);
  
  try {
    // Validate required data
    if (!match) {
      throw new Error('Match data is null or undefined');
    }
    
    // Handle different property casing (C# backend might serialize differently)
    const mainPlayer = match.MainPlayer || match.mainPlayer;
    const isWin = match.Victory === true || match.victory === true;
    const matchId = match.MatchId || match.matchId || Date.now();
    const gameMode = match.GameMode || match.gameMode || 'Unknown';
    const gameDate = match.GameDate || match.gameDate;
    const gameDurationMinutes = match.GameDurationMinutes || match.gameDurationMinutes;
    
    if (!mainPlayer) {
      throw new Error('MainPlayer/mainPlayer data missing from match. Available keys: ' + Object.keys(match).join(', '));
    }
    
    console.log('🏆 Match result:', isWin ? 'Victory' : 'Defeat');
    console.log('👤 Main player data found:', mainPlayer);
    
    // Get main player data from backend structure (handle different casings)
    const championName = mainPlayer.ChampionName || mainPlayer.championName || 'Unknown';
    const championImageUrl = mainPlayer.ChampionImageUrl || mainPlayer.championImageUrl || getChampionImageUrl(championName);
    
    console.log('👤 Main player champion:', championName);
    console.log('🖼️ Champion image URL:', championImageUrl);
    
    // Extract KDA from backend (handle different casings)
    const kills = mainPlayer.Kills || mainPlayer.kills || 0;
    const deaths = mainPlayer.Deaths || mainPlayer.deaths || 0;
    const assists = mainPlayer.Assists || mainPlayer.assists || 0;
    const kdaText = mainPlayer.KDA || mainPlayer.kda || `${kills}/${deaths}/${assists}`;
    
    console.log('📊 Player stats:', { kills, deaths, assists, kdaText });
    
    // Calculate game duration and time ago
    const parsedGameDate = gameDate ? new Date(gameDate) : new Date();
    const duration = gameDurationMinutes ? `${gameDurationMinutes}:00` : '30:00';
    const timeAgo = getTimeAgo(parsedGameDate);
    
    // Mock additional stats (since backend doesn't provide CS/Vision yet)
    const cs = Math.floor(Math.random() * 200) + 100;
    const vision = Math.floor(Math.random() * 30) + 10;
    const gameMinutes = gameDurationMinutes || 30;
    const csPerMin = (cs / gameMinutes).toFixed(1);
    
    // Create individual match card container
    const matchCard = document.createElement('div');
    matchCard.className = `match-card ${isWin ? 'victory' : 'defeat'}`;
    
    // Add a unique identifier for debugging
    const cardId = `match-${matchId}-${Math.random()}`;
    matchCard.setAttribute('data-match-id', cardId);
    
    console.log('🎨 Match card class:', matchCard.className);
    console.log('🆔 Match card ID:', cardId);
    
    matchCard.innerHTML = `
      <div class="match-info">
        <div class="game-type">${gameMode}</div>
        <div class="time-ago">${timeAgo}</div>
        <div class="game-result ${isWin ? 'win' : 'loss'}">${isWin ? 'Victory' : 'Defeat'}</div>
        <div class="game-duration">${duration}</div>
      </div>
      
      <div class="champion-section">
        <div class="champion-container">
          <img src="${championImageUrl}" alt="${championName}" class="champion-icon" 
               onerror="this.src='https://ddragon.leagueoflegends.com/cdn/13.6.1/img/champion/Unknown.png'">
        </div>
        <div class="summoner-spells">
          <div class="spell-placeholder"></div>
          <div class="spell-placeholder"></div>
        </div>
      </div>
      
      <div class="items-section">
        <div class="items-row">
          <div class="item-slot"></div>
          <div class="item-slot"></div>
          <div class="item-slot"></div>
          <div class="item-slot"></div>
          <div class="item-slot"></div>
          <div class="item-slot"></div>
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
        ${createTeamsDisplayFromBackend(match)}
      </div>
    `;
    
    console.log('✅ Match card created successfully with ID:', cardId);
    return matchCard;
    
  } catch (error) {
    console.error('❌ Error in createOPGGMatchCard:', error);
    console.error('❌ Match data that caused error:', match);
    
    // Return a simple error card instead of crashing
    const errorCard = document.createElement('div');
    errorCard.className = 'match-card error';
    errorCard.innerHTML = `
      <div class="match-error">
        <span>Error loading match data</span>
        <small>${error.message}</small>
      </div>
    `;
    return errorCard;
  }
}

function createTeamsDisplayFromBackend(match) {
  console.log('🏁 Creating teams display from backend data');
  
  // Use AllPlayers array from backend
  const allPlayers = match.AllPlayers || [];
  console.log('� Total players found:', allPlayers.length);
  
  if (allPlayers.length === 0) {
    console.log('❌ No player data available');
    return '<div class="team-vs-team"><div class="no-team-data">No team data available</div></div>';
  }
  
  // Split players by TeamId (100 and 200)
  const team1 = allPlayers.filter(p => p.TeamId === 100);
  const team2 = allPlayers.filter(p => p.TeamId === 200);
  
  console.log('🔵 Team 1 players:', team1.length);
  console.log('🔴 Team 2 players:', team2.length);
  console.log('🎯 Team 1 data:', team1.map(p => ({ name: p.SummonerName, champion: p.ChampionName, isMain: p.IsMainPlayer })));
  console.log('🎯 Team 2 data:', team2.map(p => ({ name: p.SummonerName, champion: p.ChampionName, isMain: p.IsMainPlayer })));
  
  return `
    <div class="team-vs-team">
      <div class="team blue-team">
        ${team1.map(player => createPlayerDisplayFromBackend(player)).join('')}
      </div>
      <div class="vs-divider">VS</div>
      <div class="team red-team">
        ${team2.map(player => createPlayerDisplayFromBackend(player)).join('')}
      </div>
    </div>
  `;
}

function createPlayerDisplayFromBackend(player) {
  const championName = player.ChampionName || 'Unknown';
  const summonerName = player.SummonerName || 'Player';
  const championImageUrl = player.ChampionImageUrl || getChampionImageUrl(championName);
  const isMainPlayer = player.IsMainPlayer === true;
  
  const playerClass = isMainPlayer ? 'searched-player' : '';
  
  return `
    <div class="team-player ${playerClass}">
      <img src="${championImageUrl}" alt="${championName}" class="team-champion-icon"
           onerror="this.src='https://ddragon.leagueoflegends.com/cdn/13.6.1/img/champion/Unknown.png'">
      <span class="player-name">${summonerName}</span>
    </div>
  `;
}

function createPlayerDisplay(player, searchedPlayerName) {
  const championName = player.championName || player.summonerName || 'Unknown';
  const summonerName = player.summonerName || player.SummonerName || 'Player';
  const championImageUrl = getChampionImageUrl(championName);
  
  // Check if this is the searched player
  const isSearchedPlayer = summonerName === searchedPlayerName;
  const playerClass = isSearchedPlayer ? 'searched-player' : '';
  
  return `
    <div class="team-player ${playerClass}">
      <img src="${championImageUrl}" alt="${championName}" class="team-champion-icon"
           onerror="this.src='https://ddragon.leagueoflegends.com/cdn/13.6.1/img/champion/Unknown.png'">
      <span class="player-name">${summonerName}</span>
    </div>
  `;
}

function getPlayerChampion(match) {
  // Try to get the specific player's champion (the one we searched for)
  let championName = match.playerChampionName || 
                     match.championName || 
                     match.ChampionName;
  
  // If it's an array, get the first one (should be the searched player)
  if (Array.isArray(championName)) {
    championName = championName[0];
  }
  
  console.log('🔍 Extracted champion name:', championName);
  return championName || 'Unknown';
}

function getChampionImageUrl(championName) {
  return `https://ddragon.leagueoflegends.com/cdn/13.6.1/img/champion/${championName}.png`;
}

function displayNoMatches() {
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



// Check if we're coming from stored data (from search page)
async function loadFromStoredData() {
  try {
    const storedData = localStorage.getItem('lastSearchedSummoner');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      
      // Check if the stored data matches current URL parameters
      const { summonerName, tagLine } = getUrlParameters();
      
      if (parsed.summonerName === summonerName && parsed.tagLine === tagLine) {
        // Check if data is recent (within 5 minutes)
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        if (parsed.timestamp > fiveMinutesAgo) {
          console.log('Using stored summoner data');
          await displaySummonerData(parsed.data);
          hideLoading();
          return true;
        }
      }
    }
  } catch (error) {
    console.log('Could not load from stored data:', error);
  }
  
  return false;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
  console.log('User page loaded');
  
  // First try to load from stored data, if that fails, fetch from API
  if (!(await loadFromStoredData())) {
    await loadSummonerProfile();
  }
});

// Optional: Add refresh functionality
function refreshProfile() {
  // Clear stored data and reload
  localStorage.removeItem('lastSearchedSummoner');
  loadSummonerProfile();
}

// Debug function for match history
function debugMatchHistory() {
  console.log('🐛 Debug Match History clicked');
  
  if (window.currentSummonerData) {
    const data = window.currentSummonerData;
    console.log('📋 Current summoner data:', data);
    
    // Use secure method first
    console.log('🔒 Testing secure match history method...');
    loadMatchHistoryBySummoner(data.summonerName, data.tagline);
    
  } else {
    console.error('❌ No summoner data available');
    alert('No summoner data loaded. Refresh the page first.');
  }
}

// Manual update function (only when user clicks update)
function manualUpdateProfile() {
  console.log('🔄 Manual update requested');
  
  if (window.currentSummonerData) {
    const data = window.currentSummonerData;
    console.log('🔄 Updating profile and match history for:', data.summonerName);
    
    // Show loading state
    showMatchHistoryLoading();
    
    // Load fresh match history
    loadMatchHistoryBySummoner(data.summonerName, data.tagline);
    
  } else {
    // If no stored data, reload the whole profile
    console.log('🔄 No stored data, reloading entire profile');
    loadSummonerProfile();
  }
}

// Optional: Add navigation back to search
function goBackToSearch() {
  window.location.href = '../../index.html';
}

// Make functions available globally for potential button clicks
window.refreshProfile = refreshProfile;
window.goBackToSearch = goBackToSearch;
window.debugMatchHistory = debugMatchHistory;
window.manualUpdateProfile = manualUpdateProfile;