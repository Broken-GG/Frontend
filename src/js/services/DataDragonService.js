/**
 * Data Dragon Service
 * Handles Data Dragon API interactions and caching
 */

import config from '@/js/config/config.js';
import logger from '@/js/utils/logger.js';

class DataDragonService {
  constructor() {
    this.cachedVersion = null;
    this.cachedItemData = null;
    this.cachedSummonerSpellData = null;
  }

  /**
   * Get the latest Data Dragon version
   */
  async getLatestVersion() {
    if (this.cachedVersion) {
      return this.cachedVersion;
    }

    try {
      const response = await fetch(config.services.ddragon.endpoints.versions);
      const versions = await response.json();
      this.cachedVersion = versions[0]; // Latest version is first
      logger.success(`Latest Data Dragon version: ${this.cachedVersion}`);
      return this.cachedVersion;
    } catch (error) {
      logger.error('Failed to fetch Data Dragon version, using fallback:', error);
      this.cachedVersion = config.services.ddragon.version;
      return this.cachedVersion;
    }
  }

  /**
   * Get item data from Data Dragon
   */
  async getItemData() {
    if (this.cachedItemData) {
      return this.cachedItemData;
    }

    try {
      const version = await this.getLatestVersion();
      const url = config.services.ddragon.endpoints.itemData(version);
      const response = await fetch(url);
      const data = await response.json();
      this.cachedItemData = data.data;
      logger.success('Loaded item data');
      return this.cachedItemData;
    } catch (error) {
      logger.error('Failed to fetch item data:', error);
      return {};
    }
  }

  /**
   * Get summoner spell data from Data Dragon
   */
  async getSummonerSpellData() {
    if (this.cachedSummonerSpellData) {
      return this.cachedSummonerSpellData;
    }

    try {
      const version = await this.getLatestVersion();
      const url = config.services.ddragon.endpoints.summonerData(version);
      const response = await fetch(url);
      const data = await response.json();
      this.cachedSummonerSpellData = data.data;
      logger.success('Loaded summoner spell data');
      return this.cachedSummonerSpellData;
    } catch (error) {
      logger.error('Failed to fetch summoner spell data:', error);
      return {};
    }
  }

  /**
   * Get item name by ID
   */
  getItemName(itemId) {
    if (!itemId || itemId === 0) return null;
    return this.cachedItemData?.[itemId]?.name || `Item ${itemId}`;
  }

  /**
   * Get summoner spell name from image URL
   */
  getSummonerSpellName(spellImageUrl) {
    if (!spellImageUrl || !this.cachedSummonerSpellData) return null;

    // Extract spell key from URL (e.g., "SummonerFlash.png" -> "SummonerFlash")
    const match = spellImageUrl.match(/\/([^/]+)\.png$/);
    if (!match) return null;

    const spellKey = match[1];

    // Find spell by matching image property
    for (const [key, spell] of Object.entries(this.cachedSummonerSpellData)) {
      if (spell.image?.full === `${spellKey}.png` || spell.id === spellKey) {
        return spell.name;
      }
    }

    return spellKey.replace('Summoner', '');
  }

  /**
   * Get champion image URL
   */
  async getChampionImageUrl(championName) {
    const version = await this.getLatestVersion();
    return `${config.services.ddragon.endpoints.champion(version)}/${championName}.png`;
  }

  /**
   * Initialize by preloading data
   */
  async initialize() {
    await Promise.all([
      this.getLatestVersion(),
      this.getItemData(),
      this.getSummonerSpellData(),
    ]);
  }
}

// Export singleton instance
const dataDragonService = new DataDragonService();

// Initialize on module load
dataDragonService.initialize();

export default dataDragonService;
