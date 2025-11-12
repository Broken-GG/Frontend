/**
 * Arena Augments Service
 * Handles Arena mode augments data from Community Dragon
 */

import config from '@/config/config.js';
import logger from '@/utils/logger.js';
import type { AugmentData } from '@/types/api.types.js';

class AugmentsService {
    private cachedAugmentIconMap: Map<number | string, AugmentData> | null;

    constructor() {
        this.cachedAugmentIconMap = null;
  }

  /**
   * Convert icon path to Community Dragon URL
   */
  toCDragonUrl(iconPath: string, version = 'latest'): string | null {
    if (!iconPath) return null;
    if (/^https?:\/\//i.test(iconPath)) {
      return iconPath.replace('/pbe/', '/latest/');
    }

    let p = iconPath.replace(/^\/+/, '');
    const lower = p.toLowerCase();

    // Normalize common CDragon path variants
    if (lower.startsWith('lol-game-data/assets/')) {
      const rest = p.substring('lol-game-data/assets/'.length);
      return `${config.services.communityDragon.baseUrl}/${version}/plugins/rcp-be-lol-game-data/global/default/${rest}`;
    }
    if (lower.startsWith('game/')) {
      return `${config.services.communityDragon.baseUrl}/${version}/${p}`;
    }
    if (lower.startsWith('assets/')) {
      return `${config.services.communityDragon.baseUrl}/${version}/game/${p}`;
    }
    if (lower.startsWith('plugins/')) {
      return `${config.services.communityDragon.baseUrl}/${version}/${p}`;
    }

    // Fallback to the known augments icons folder
    return `${config.services.communityDragon.baseUrl}/${version}/game/assets/ux/cherry/augments/icons/${p}`;
  }

  /**
   * Get Arena augment icon map
   */
  async getAugmentIconMap(): Promise<Map<number | string, AugmentData>> {
    if (this.cachedAugmentIconMap) {
      return this.cachedAugmentIconMap;
    }

    const candidates = config.services.communityDragon.arenaAugments;

    let data = null;
    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: 'force-cache' });
        if (res.ok) {
          data = await res.json();
          logger.success(`Loaded arena augments from: ${url}`);
          break;
        }
      } catch (e) {
        logger.warn('Augments JSON fetch failed for', url, e);
      }
    }

    const map = new Map();
    const list = data?.augments || data?.Augments || [];
    logger.debug(`Processing ${list.length} augments`);

    for (const aug of list) {
      const id =
        aug.id ??
        aug.augmentId ??
        aug.contentId ??
        aug.perkId ??
        null;

      // Try several fields that appear across versions
      const iconPath =
        aug.iconSmall ||
        aug.iconLarge ||
        aug.icon ||
        aug.image ||
        aug.iconPath ||
        aug.iconfile ||
        null;

      const name = aug.name || aug.displayName || aug.title || `Augment ${id}`;
      const rarity = aug.rarity || aug.tier || aug.rarityType || null;

      if (id != null && iconPath) {
        map.set(Number(id), {
          iconUrl: this.toCDragonUrl(iconPath),
          name: name,
          rarity: rarity,
        });
      }
    }

    logger.success(`Built augment icon map with ${map.size} entries`);
    this.cachedAugmentIconMap = map;
    return this.cachedAugmentIconMap;
  }

  /**
   * Get augment info by ID
   */
  async getAugmentInfo(augmentId: number | string): Promise<AugmentData | null> {
    if (!this.cachedAugmentIconMap || !augmentId) return null;
    return (
      this.cachedAugmentIconMap.get(Number(augmentId)) ||
      this.cachedAugmentIconMap.get(String(augmentId)) ||
      null
    );
  }
}

// Export singleton instance
export default new AugmentsService();
