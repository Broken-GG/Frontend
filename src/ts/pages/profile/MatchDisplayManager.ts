/**
 * Match Display Manager
 * Manages the display of match history and handles loading more matches
 */

import MatchCard from '@/ts/components/MatchCard.js';
import MatchHeaderGenerator from '@/ts/pages/profile/MatchHeaderGenerator.js';
import logger from '@/ts/utils/logger.js';
import config from '@/ts/config/config.js';
import type { MatchData } from '@/ts/types/api.types.js';
import type ApiService from '@/ts/api/ApiService.js';

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
  async displayMatches(matches: MatchData[], container: HTMLElement): Promise<void> {
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
   * Add match history header
   */
  addMatchHistoryHeader(topContainer: HTMLElement, matchCount: number): void {
    const headerHTML = `<div class="match-history-header"><h3>Recent Games (${matchCount}G)</h3></div>`;
    const existingHeader = topContainer.querySelector('.match-history-header');
    if (existingHeader) {
      existingHeader.remove();
    }
    topContainer.insertAdjacentHTML('beforeend', headerHTML);
  }
  
  /**
   * Update match history header with new count
   */
  updateMatchHistoryHeader(): void {
    const topContainer = document.querySelector('.profile-main-top') as HTMLElement | null;
    if (topContainer) {
      this.addMatchHistoryHeader(topContainer, this.allMatches.length);
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
