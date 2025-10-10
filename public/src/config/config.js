// Configuration for API endpoints and settings
const config = {
  api: {
    // Update this to match your C# backend URL
    baseUrl: 'https://localhost:5001/api', // Matches your running backend
    
    // API endpoints
    endpoints: {
      users: '/users',
      userProfile: (userId) => `/users/${userId}`,
      userStats: (userId) => `/users/${userId}/stats`,
      userMatches: (userId) => `/users/${userId}/matches`,
      summonerInfo: (summonerName, tagline) => `/SummonerInfo/${summonerName}/${tagline}`,
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