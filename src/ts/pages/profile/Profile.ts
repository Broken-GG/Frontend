/**
 * Profile Page Main Script
 * Handles user profile display, match history, and sidebar information
 */

import apiService from '@/ts/api/ApiService.js';
import matchDisplayManager from '@/ts/pages/profile/MatchDisplayManager.js';
import { displayRankedInfo, displayMasteryInfo } from '@/ts/pages/profile/SidebarInfo.js';
import logger from '@/ts/utils/logger.js';
import { handleError } from '@/ts/utils/errorHandler.js';
import type { SummonerInfo } from '@/ts/types/api.types.js';

// Extend Window interface for global functions
declare global {
  interface Window {
    manualUpdateProfile: () => Promise<void>;
    goToSummary: () => void;
    goToChampions: () => void;
    goToLiveGame: () => void;
    handleSearch: (summonerName: string, tagLine: string) => void;
  }
}

/**
 * Load match history for a summoner
 */
export async function loadMatchHistory(summonerName: string, tagLine: string): Promise<void> {
  logger.debug(`Loading match history for: ${summonerName}#${tagLine}`);

  try {
    const matchData = await apiService.getMatchHistoryBySummoner(summonerName, tagLine, 0, 20);
    logger.debug(`Match history received: ${matchData?.length || 0} matches`);
    await matchDisplayManager.displayMatchHistory(matchData, summonerName, tagLine, apiService);
  } catch (error) {
    logger.error('Failed to load match history:', error);
    matchDisplayManager.displayNoMatches();
    throw error;
  }
}

/**
 * Display summoner profile data
 */
function displaySummonerData(data: SummonerInfo): void {
  logger.debug('Displaying summoner data:', data);

  // Update profile icon
  const profileIcon = document.getElementById('profile-icon') as HTMLImageElement | null;
  if (profileIcon) {
    const iconUrl = data.profileIconUrl || data.ProfileIconUrl;
    if (iconUrl) {
      logger.debug('Setting profile icon to:', iconUrl);
      profileIcon.src = iconUrl as string;
      profileIcon.onload = () => logger.success('Profile icon loaded successfully');
    } else {
      logger.warn('No profile icon URL found, using default');
    }
  }

  // Update profile info
  const profileName = document.getElementById('profile-name');
  const profileTag = document.getElementById('profile-tag');
  const profileLvl = document.getElementById('profile-lvl');
  const profileLastUpdate = document.getElementById('profile-lastupdate');

  if (profileName) profileName.textContent = (data as any).summonerName || data.gameName || data.GameName || 'Unknown';
  if (profileTag) profileTag.textContent = `#${(data as any).tagline || data.tagLine || data.TagLine || ''}`;
  if (profileLvl) profileLvl.textContent = String((data as any).level || data.summonerLevel || data.SummonerLevel || '1');

  if (profileLastUpdate) {
    const lastUpdate = data.revisionDate || data.RevisionDate;
    if (lastUpdate) {
      const date = new Date(lastUpdate);
      const timeAgo = getTimeAgo(date);
      profileLastUpdate.textContent = `Updated ${timeAgo}`;
    } else {
      profileLastUpdate.textContent = 'Updated recently';
    }
  }
}

/**
 * Calculate time ago from a date
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
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
    return 'just now';
  }
}

/**
 * Load sidebar information (ranked + mastery)
 */
async function loadSidebarInfo(puuid: string): Promise<void> {
  logger.debug('Loading sidebar info for puuid:', puuid);

  try {
    const [rankedData, masteryData] = await Promise.all([
      apiService.getRankedInfo(puuid),
      apiService.getMasteryInfo(puuid),
    ]);

    logger.debug('Ranked info fetched:', rankedData);
    logger.debug('Mastery info fetched:', masteryData);

    displayRankedInfo(rankedData);
    displayMasteryInfo(masteryData);
  } catch (error) {
    logger.error('Error fetching sidebar info:', error);
    handleError(error as Error, 'Failed to load ranked and mastery information');
  }
}

/**
 * Initialize the profile page
 */
async function init(): Promise<void> {
  logger.debug('Profile page initializing...');

  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const summonerName = urlParams.get('summonerName');
  const tagLine = urlParams.get('tagLine');

  if (!summonerName || !tagLine) {
    handleError(new Error('Missing summoner information'), 'No summoner specified in URL');
    return;
  }

  try {
    // Fetch summoner info
    const summonerData = await apiService.getSummonerInfo(summonerName, tagLine);
    displaySummonerData(summonerData);

    const puuid = summonerData.puuid || summonerData.Puuid;
    
    if (!puuid) {
      throw new Error('PUUID not found in summoner data');
    }

    logger.success('Profile loaded successfully. Loading match history...');

    // Load match history and sidebar in parallel
    await Promise.all([loadMatchHistory(summonerName, tagLine), loadSidebarInfo(puuid)]);

    logger.success('Profile page fully loaded');
  } catch (error) {
    logger.error('Failed to load profile:', error);
    handleError(error as Error, 'Failed to load summoner profile');
  }
}

/**
 * Manual refresh button handler
 */
window.manualUpdateProfile = async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const summonerName = urlParams.get('summonerName');
  const tagLine = urlParams.get('tagLine');

  if (!summonerName || !tagLine) {
    handleError(new Error('Missing summoner information'), 'Cannot refresh profile');
    return;
  }

  logger.info('Manually refreshing profile...');
  await init();
};

/**
 * Tab navigation handlers
 */
window.goToSummary = function () {
  logger.info('Summary tab clicked (current page)');
};

window.goToChampions = function () {
  logger.info('Champions tab clicked (not implemented yet)');
};

window.goToLiveGame = function () {
  logger.info('Live Game tab clicked (not implemented yet)');
};

/**
 * Global search handler for clicking on player names in match history
 */
window.handleSearch = function (summonerName: string, tagLine: string) {
  logger.debug('handleSearch called with:', { summonerName, tagLine });

  if (!tagLine || tagLine === '') {
    if (summonerName.includes('#')) {
      const parts = summonerName.split('#');
      summonerName = parts[0];
      tagLine = parts[1];
    } else {
      tagLine = 'EUW';
    }
  }

  logger.debug('Final values:', { summonerName, tagLine });

  const url = `user.html?summonerName=${encodeURIComponent(summonerName)}&tagLine=${encodeURIComponent(tagLine)}`;
  logger.info('Redirecting to:', url);
  window.location.href = url;
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

logger.success('Profile page script loaded');
