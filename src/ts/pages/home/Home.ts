/**
 * Home Page Main Script
 * Handles summoner search functionality
 */

import apiService from '@/ts/api/ApiService.js';
import logger from '@/ts/utils/logger.js';
import { showError, hideError } from '@/ts/utils/errorHandler.js';

function parseSummonerInput(input: string): { summonerName: string; tagLine: string } {
  const trimmedInput: string = input.trim();
  const parts: string[] = trimmedInput.split('#');

  if (parts.length !== 2) {
    throw new Error('Please use the format: SummonerName#TagLine (e.g., Faker#EUW)');
  }

  const summonerName: string = parts[0].trim();
  const tagLine: string = parts[1].trim();

  if (!summonerName || !tagLine) {
    throw new Error('Summoner name and tagline cannot be empty');
  }

  return { summonerName, tagLine };
}

/**
 * Navigate to user profile page
 */
function navigateToProfile(summonerName: string, tagLine: string): void {
  const url = `/user.html?summonerName=${encodeURIComponent(summonerName)}&tagLine=${encodeURIComponent(tagLine)}`;
  logger.info('Navigating to:', url);
  window.location.href = url;
}

/**
 * Handle search form submission
 */
async function handleSearch(event: Event): Promise<void> {
  event.preventDefault();

  const input = document.getElementById('summonerInput') as HTMLInputElement;
  const searchButton = document.getElementById('searchButton') as HTMLButtonElement;
  const searchText = searchButton.querySelector('.search-text') as HTMLElement;
  const loadingSpinner = searchButton.querySelector('.loading-spinner') as HTMLElement;

  if (!input) {
    logger.error('Summoner input element not found');
    return;
  }

  hideError();

  try {
    // Parse input
    const { summonerName, tagLine } = parseSummonerInput(input.value);

    // Show loading state
    searchButton.disabled = true;
    searchText.style.display = 'none';
    loadingSpinner.style.display = 'inline';

    logger.info(`Searching for: ${summonerName}#${tagLine}`);

    // Verify summoner exists (optional - remove if you want to skip validation)
    const summonerData = await apiService.getSummonerInfo(summonerName, tagLine);

    logger.success(`Summoner found: ${JSON.stringify(summonerData)}`);

    // Navigate to profile
    navigateToProfile(summonerName, tagLine);
  } catch (error) {
    logger.error('Search failed:', error);

    let errorMessage: string = 'An error occurred. Please try again.';

    if (error instanceof Error) {
      if (error.message.includes('format')) {
        errorMessage = error.message;
      } else if (error.message.includes('404') || error.message.includes('not found')) {
        errorMessage = 'Summoner not found. Please check the name and tag.';
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and backend server.';
      }
    }

    showError(errorMessage);

    // Reset loading state
    searchButton.disabled = false;
    searchText.style.display = 'inline';
    loadingSpinner.style.display = 'none';
  }
}

/**
 * Initialize home page
 */
function init(): void {
  logger.success('Home page initialized');

  const searchForm = document.getElementById('summonerSearchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
  } else {
    logger.error('Search form not found');
  }

  // Focus on input
  const input = document.getElementById('summonerInput');
  if (input) {
    input.focus();
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

logger.success('Home page script loaded');
export {};