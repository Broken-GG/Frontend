// API Service functionality (inline since modules might not work with simple HTTP server)
class ApiService {
  constructor() {
    // Try HTTPS first, fallback to HTTP if needed
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
      console.log('Trying HTTPS endpoint:', url);
      console.log('Request config:', config);
      
      const response = await fetch(url, config);
      
      console.log('HTTPS Response:');
      console.log('- Status:', response.status);
      console.log('- StatusText:', response.statusText);
      console.log('- Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTPS Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        throw new Error('Response is not JSON');
      }
      
      const data = await response.json();
      console.log('HTTPS Success:', data);
      return data;
    } catch (error) {
      console.error('HTTPS request failed:', error);
      
      // Try HTTP fallback
      url = `${this.fallbackUrl}${endpoint}`;
      console.log('Trying HTTP fallback:', url);
      
      try {
        const response = await fetch(url, config);
        
        console.log('HTTP Response:');
        console.log('- Status:', response.status);
        console.log('- Headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('HTTP Error response:', errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('HTTP Success:', data);
        return data;
      } catch (fallbackError) {
        console.error('HTTP fallback also failed:', fallbackError);
        throw new Error(`Network error: Both HTTPS and HTTP requests failed. Backend: ${error.message}, Fallback: ${fallbackError.message}`);
      }
    }
  }

  async get(endpoint) {
    return this.makeRequest(endpoint, { method: 'GET' });
  }

  async getSummonerInfo(summonerName, tagLine) {
    return this.get(`/SummonerInfo/${summonerName}/${tagLine}`);
  }
}

// Create API service instance
const apiService = new ApiService();

// Parse summoner input (format: SummonerName#TagLine)
function parseSummonerInput(input) {
  const trimmedInput = input.trim();
  const parts = trimmedInput.split('#');
  
  if (parts.length !== 2) {
    throw new Error('Please use the format: SummonerName#TagLine (e.g., Faker#EUW)');
  }
  
  const summonerName = parts[0].trim();
  const tagLine = parts[1].trim(); // Keep original case, don't force uppercase
  
  if (!summonerName || !tagLine) {
    throw new Error('Both summoner name and tag line are required');
  }
  
  return { summonerName, tagLine };
}

// Show error message
function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

// Hide error message
function hideError() {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.style.display = 'none';
}

// Show loading state
function setLoading(isLoading) {
  const searchButton = document.getElementById('searchButton');
  const searchText = searchButton.querySelector('.search-text');
  const loadingSpinner = searchButton.querySelector('.loading-spinner');
  const summonerInput = document.getElementById('summonerInput');
  
  if (isLoading) {
    searchButton.disabled = true;
    summonerInput.disabled = true;
    searchText.style.display = 'none';
    loadingSpinner.style.display = 'inline-block';
  } else {
    searchButton.disabled = false;
    summonerInput.disabled = false;
    searchText.style.display = 'inline-block';
    loadingSpinner.style.display = 'none';
  }
}

// Handle form submission
async function handleSearch(event) {
  event.preventDefault();
  
  const input = document.getElementById('summonerInput').value;
  hideError();
  
  console.log('Search initiated with input:', input);
  
  try {
    // Parse the input
    const { summonerName, tagLine } = parseSummonerInput(input);
    
    console.log('Searching for summoner:', summonerName, tagLine);
    
    // Show loading state
    setLoading(true);
    
    // Make API call to validate summoner exists
    console.log('Making API call to validate summoner...');
    const apiUrl = `${apiService.baseUrl}/SummonerInfo/${summonerName}/${tagLine}`;
    console.log('API URL:', apiUrl);
    
    const summonerData = await apiService.getSummonerInfo(summonerName, tagLine);
    
    console.log('Summoner found:', summonerData);
    
    // Store summoner data temporarily (optional)
    localStorage.setItem('lastSearchedSummoner', JSON.stringify({
      summonerName,
      tagLine,
      data: summonerData,
      timestamp: Date.now()
    }));
    
    // Redirect to user page with summoner information
    const redirectUrl = `src/pages/user.html?summonerName=${encodeURIComponent(summonerName)}&tagLine=${encodeURIComponent(tagLine)}`;
    console.log('Redirecting to:', redirectUrl);
    window.location.href = redirectUrl;
    
  } catch (error) {
    console.error('Search failed:', error);
    
    // Show user-friendly error message
    let errorMessage = 'Failed to find summoner. Please check the name and tag line.';
    
    if (error.message.includes('format') || error.message.includes('supported')) {
      errorMessage = error.message;
    } else if (error.message.includes('404')) {
      errorMessage = 'Summoner not found. Please check the spelling and tag line.';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error.message.includes('CORS')) {
      errorMessage = 'Connection issue with backend. Please make sure the backend is running.';
    }
    
    showError(errorMessage);
  } finally {
    setLoading(false);
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded, initializing search functionality...');
  
  // Add event listener for form submission
  const searchForm = document.getElementById('summonerSearchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
    console.log('Search form listener added');
  } else {
    console.error('Search form not found!');
  }
  
  // Add event listener for Enter key in input field
  const summonerInput = document.getElementById('summonerInput');
  if (summonerInput) {
    summonerInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSearch(event);
      }
    });
    
    // Auto-focus on the search input
    summonerInput.focus();
    console.log('Input field listener added and focused');
  } else {
    console.error('Summoner input not found!');
  }
  
  // Keep the test button functionality
  const testButton = document.getElementById("testButton");
  if (testButton) {
    testButton.addEventListener("click", function() {
      // Test with a European summoner
      const summonerName = "TestSummoner";
      const tagLine = "EUW1";
      window.location.href = `src/pages/user.html?summonerName=${summonerName}&tagLine=${tagLine}`;
    });
  }
});