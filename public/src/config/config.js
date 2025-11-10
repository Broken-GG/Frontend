// Configuration for API endpoints and settings
const config = {
  api: {
    // Update this to match your C# backend URL
    baseUrl: 'http://localhost:5000/api', // Matches your running backend
    
    // API endpoints
    endpoints: {
      users: '/users',
      userProfile: (userId) => `/users/${userId}`,
      userStats: (userId) => `/users/${userId}/stats`,
      userMatches: (userId) => `/users/${userId}/matches`,
      summonerInfo: (summonerName, tagline) => `/Summoner/${summonerName}/${tagline}`,
      matchHistory: (puuid) => `/Match/${puuid}`,
      masteryInfo: (puuid) => `/Mastery/${puuid}`,
      rankedInfo: (puuid) => `/Ranked/${puuid}`,
    },
    
    // Request timeout in milliseconds
    timeout: 10000,
    
    // Default headers
    headers: {
      'Content-Type': 'application/json',
    }
  },
  
  // Environment settings
  environment: 'development', // 'development' or 'production'
  
  // Debug settings
  debug: true,
};

export default config;