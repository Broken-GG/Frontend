// User Profile Page JavaScript
class UserPageService {
  constructor() {
    // Match your backend URL
    this.baseUrl = 'https://localhost:5001/api';
    this.fallbackUrl = 'http://localhost:5000/api';
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

function displaySummonerData(data) {
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
    displaySummonerData(summonerData);
    
    console.log('Profile loaded successfully');
    
  } catch (error) {
    console.error('Failed to load summoner profile:', error);
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// Check if we're coming from stored data (from search page)
function loadFromStoredData() {
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
          displaySummonerData(parsed.data);
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
  if (!loadFromStoredData()) {
    await loadSummonerProfile();
  }
});

// Optional: Add refresh functionality
function refreshProfile() {
  // Clear stored data and reload
  localStorage.removeItem('lastSearchedSummoner');
  loadSummonerProfile();
}

// Optional: Add navigation back to search
function goBackToSearch() {
  window.location.href = '../../index.html';
}

// Make functions available globally for potential button clicks
window.refreshProfile = refreshProfile;
window.goBackToSearch = goBackToSearch;