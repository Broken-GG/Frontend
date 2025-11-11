/**
 * Match Display Manager
 * Manages the display of match history and handles loading more matches
 */

import MatchCard from '@/js/components/MatchCard.js';
import MatchStatistics from '@/js/pages/profile/MatchStatistics.js';
import MatchHeaderGenerator from '@/js/pages/profile/MatchHeaderGenerator.js';
import logger from '@/js/utils/logger.js';
import config from '@/js/config/config.js';

export class MatchDisplayManager {
  constructor() {
    this.isRendering = false;
    this.allMatches = [];
    this.matchesPerLoad = config.matches.loadMoreCount;
    this.currentStartIndex = 0;
    this.summonerName = '';
    this.tagLine = '';
    this.userService = null;
    this.isLoading = false;
  }

  /**
   * Display match history data
   */
  async displayMatchHistory(matchData, summonerName = '', tagLine = '', userService = null) {
    if (this.isRendering) {
      logger.warn('Already rendering match history, skipping...');
      return;
    }

    logger.debug(`Displaying match history: ${matchData?.length || 0} matches`);

    if (!Array.isArray(matchData) || matchData.length === 0) {
      this.displayNoMatches();
      return;
    }

    this.isRendering = true;

    // Store for loading more
    this.summonerName = summonerName;
    this.tagLine = tagLine;
    this.userService = userService;
    this.currentStartIndex = matchData.length;

    // Store matches
    this.allMatches = matchData;

    // Clear and display
    const container = document.querySelector('.matches');
    const topContainer = document.querySelector('.profile-main-top');

    if (container) {
      container.innerHTML = '';

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
  async displayMatches(matches, container) {
    for (const match of matches) {
      try {
        const matchElement = await MatchCard.create(match);
        container.appendChild(matchElement);
      } catch (error) {
        logger.error('Error creating match card:', error);
      }
    }
  }

  /**
   * Add the "Show more" button
   */
  addLoadMoreButton(container) {
    const existingButton = container.querySelector('.load-more-button');
    if (existingButton) {
      existingButton.remove();
    }

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
  async loadMore() {
    if (this.isLoading) {
      logger.debug('Already loading...');
      return;
    }

    if (!this.userService || !this.summonerName || !this.tagLine) {
      logger.error('Missing data to load more matches');
      return;
    }

    logger.debug(`Loading more matches... start=${this.currentStartIndex}`);

    this.isLoading = true;
    const container = document.querySelector('.matches');
    this.addLoadMoreButton(container);

    try {
      const newMatches = await this.userService.getMatchHistoryBySummoner(
        this.summonerName,
        this.tagLine,
        this.currentStartIndex,
        this.matchesPerLoad
      );

      logger.debug(`Received ${newMatches?.length || 0} new matches`);

      if (newMatches && newMatches.length > 0) {
        this.allMatches.push(...newMatches);
        this.currentStartIndex += newMatches.length;

        const button = container.querySelector('.load-more-button');
        if (button) button.remove();

        await this.displayMatches(newMatches, container);
        this.updateMatchHistoryHeader();
        this.addLoadMoreButton(container);

        logger.debug(`Total matches now: ${this.allMatches.length}`);
      } else {
        logger.debug('No more matches available');
      }
    } catch (error) {
      logger.error('Failed to load more matches:', error);
    } finally {
      this.isLoading = false;
      this.addLoadMoreButton(container);
    }
  }

  /**
   * Display "no matches" message
   */
  displayNoMatches() {
    const container = document.querySelector('.matches');
    if (container) {
      container.innerHTML = MatchHeaderGenerator.generateNoMatchesHTML();
    }
  }
}

export default new MatchDisplayManager();
