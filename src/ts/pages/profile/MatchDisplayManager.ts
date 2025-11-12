/**
 * Match Display Manager
 * Manages the display of match history and handles loading more matches
 */

import MatchCard from '@/components/MatchCard.js';
import MatchStatistics from '@/pages/profile/MatchStatistics.js';
import MatchHeaderGenerator from '@/pages/profile/MatchHeaderGenerator.js';
import logger from '@/utils/logger.js';
import config from '@/config/config.js';
import type { MatchData } from '@/types/api.types.js';
import type ApiService from '@/api/ApiService.js';

export class MatchDisplayManager {
  private isRendering: boolean;
  private allMatches: MatchData[];
  private matchesPerLoad: number;
  private currentStartIndex: number;
  private summonerName: string;
  private tagLine: string;
  private userService: typeof ApiService | null;
  private isLoading: boolean;


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
  async displayMatchHistory(matchData: MatchData[], summonerName = '', tagLine = '', userService: typeof ApiService | null = null): Promise<void> {
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
    const container: HTMLElement | null = document.querySelector('.matches');
    const topContainer: HTMLElement | null = document.querySelector('.profile-main-top');

    if (container) {
      container.innerHTML = '';

      if (topContainer) {
        this.addMatchHistoryHeader(topContainer);
      }

      await this.displayMatches(matchData, container);
      this.addLoadMoreButton(container);
    }

    this.isRendering = false;
  }

  /**
   * Display match cards
   */
  async displayMatches(matches: MatchData[], container: HTMLElement): Promise<void> {
    logger.debug('displayMatches called with', matches.length, 'matches');
    logger.debug('Container element:', container);
    logger.debug('Container children before:', container.children.length);
    
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      try {
        logger.debug(`Creating match card ${i+1}:`, match);
        const matchElement = await MatchCard.create(match);
        logger.debug(`Match element created, appending to container...`);
        container.appendChild(matchElement);
        logger.debug(`Match card ${i+1} appended. Container children now:`, container.children.length);
      } catch (error) {
        logger.error(`Error creating match card ${i+1}:`, error);
      }
    }
    logger.debug('All match cards created. Final container children:', container.children.length);
    logger.debug('Container innerHTML length:', container.innerHTML.length);
  }

  /**
   * Add the "Show more" button
   */
  addLoadMoreButton(container: HTMLElement | null): void {
    const existingButton = container?.querySelector('.load-more-button');
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

    container?.appendChild(button);
  }

  /**
   * Load more matches from API
   */
  async loadMore(): Promise<void> {
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
    const container = document.querySelector('.matches') as HTMLElement | null;
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

        const button = container?.querySelector('.load-more-button');
        if (button) button.remove();

        await this.displayMatches(newMatches, container!);
        this.updateMatchHistoryHeader();
        this.addLoadMoreButton(container!);
        logger.debug(`Total matches now: ${this.allMatches.length}`);
      } else {
        logger.debug('No more matches available');
      }
    } catch (error) {
      logger.error('Failed to load more matches:', error);
    } finally {
      this.isLoading = false;
      this.addLoadMoreButton(container!);
    }
  }

  /**
   * Add match history header with statistics
   */
  addMatchHistoryHeader(topContainer: HTMLElement): void {
    const stats = MatchStatistics.calculateMatchStats(this.allMatches);
    const headerHTML = MatchHeaderGenerator.generateHeaderHTML(stats);
    const existingHeader = topContainer.querySelector('.match-history-header');
    if (existingHeader) {
      existingHeader.remove();
    }
    topContainer.innerHTML = `<div class="match-history-header">${headerHTML}</div>`;
  }
  
  /**
   * Update match history header with new count
   */
  updateMatchHistoryHeader(): void {
    const topContainer = document.querySelector('.profile-main-top') as HTMLElement | null;
    if (topContainer) {
      this.addMatchHistoryHeader(topContainer);
    }
  }


  /**
   * Display "no matches" message
   */
  displayNoMatches(): void {
    const container = document.querySelector('.matches');
    if (container) {
      container.innerHTML = MatchHeaderGenerator.generateNoMatchesHTML();
    }
  }
}

export default new MatchDisplayManager();
