/**
 * Centralized API Service
 * Handles all HTTP requests to the backend API
 */

import config from '@/js/config/config.js';
import logger from '@/js/utils/logger.js';
import { ApiError } from '@/js/utils/errorHandler.js';

class ApiService {
  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.fallbackUrl = config.api.fallbackUrl;
    this.timeout = config.api.timeout;
    this.defaultHeaders = config.api.headers;
    this.defaultOptions = config.api.options;
  }

  /**
   * Make an HTTP request with automatic fallback
   */
  async request(endpoint, options = {}) {
    const requestConfig = {
      ...this.defaultOptions,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    return this._tryRequestWithFallback(endpoint, requestConfig);
  }

  /**
   * Try primary URL, fallback to secondary if it fails
   */
  async _tryRequestWithFallback(endpoint, config) {
    try {
      return await this._fetchFromUrl(this.baseUrl + endpoint, config);
    } catch (error) {
      logger.warn('Primary API request failed, trying fallback:', error.message);
      
      try {
        return await this._fetchFromUrl(this.fallbackUrl + endpoint, config);
      } catch (fallbackError) {
        logger.error('Both API endpoints failed');
        throw new ApiError(
          `Failed to fetch data from API: ${error.message}`,
          error.statusCode || 500
        );
      }
    }
  }

  /**
   * Fetch data from a specific URL
   */
  async _fetchFromUrl(url, config) {
    logger.debug('API Request:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        logger.error('API Error Response:', errorText);
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new ApiError('Invalid response format (expected JSON)', 500);
      }

      const data = await response.json();
      logger.debug('API Response:', data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(error.message || 'Network request failed', 500);
    }
  }

  /**
   * GET request
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ============================================================================
  // Summoner Endpoints
  // ============================================================================

  /**
   * Get summoner information
   */
  async getSummonerInfo(summonerName, tagLine) {
    return this.get(
      `/Summoner/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagLine)}`
    );
  }

  // ============================================================================
  // Match Endpoints
  // ============================================================================

  /**
   * Get match history by summoner
   */
  async getMatchHistoryBySummoner(summonerName, tagLine, start = 0, count = 10) {
    return this.get(
      `/Match/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagLine)}?start=${start}&count=${count}`
    );
  }

  /**
   * Get match history by PUUID
   */
  async getMatchHistoryByPuuid(puuid, start = 0, count = 10) {
    return this.get(`/Match/${encodeURIComponent(puuid)}?start=${start}&count=${count}`);
  }

  // ============================================================================
  // Ranked Endpoints
  // ============================================================================

  /**
   * Get ranked information
   */
  async getRankedInfo(puuid) {
    return this.get(`/Ranked/${encodeURIComponent(puuid)}`);
  }

  // ============================================================================
  // Mastery Endpoints
  // ============================================================================

  /**
   * Get champion mastery information
   */
  async getMasteryInfo(puuid) {
    return this.get(`/Mastery/${encodeURIComponent(puuid)}`);
  }
}

// Export singleton instance
export default new ApiService();
