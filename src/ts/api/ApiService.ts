/**
 * Centralized API Service
 * Handles all HTTP requests to the backend API
 */

import config from '@/config/config.js';
import logger from '@/utils/logger.js';
import { ApiError } from '@/utils/errorHandler.js';
import type { SummonerInfo, MatchHistory, RankedInfo, MasteryInfo } from '@/types/api.types.js';

// ============================================================================
// Type Definitions
// ============================================================================

interface RequestConfig extends RequestInit {
  headers?: Record<string, string>;
}

// ============================================================================
// ApiService Class
// ============================================================================

class ApiService {
  private baseUrl: string;
  private fallbackUrl: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private defaultOptions: RequestInit;

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
  async request<T = unknown>(endpoint: string, options: RequestConfig = {}): Promise<T> {
    const requestConfig: RequestConfig = {
      ...this.defaultOptions,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    return this._tryRequestWithFallback<T>(endpoint, requestConfig);
  }

  /**
   * Try primary URL, fallback to secondary if it fails
   */
  private async _tryRequestWithFallback<T>(endpoint: string, config: RequestConfig): Promise<T> {
    try {
      return await this._fetchFromUrl<T>(this.baseUrl + endpoint, config);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.warn('Primary API request failed, trying fallback:', errorMessage);
      
      try {
        return await this._fetchFromUrl<T>(this.fallbackUrl + endpoint, config);
      } catch (fallbackError) {
        logger.error('Both API endpoints failed');
        const originalError = error as ApiError;
        throw new ApiError(
          `Failed to fetch data from API: ${errorMessage}`,
          originalError.statusCode || 500
        );
      }
    }
  }

  /**
   * Fetch data from a specific URL
   */
  private async _fetchFromUrl<T>(url: string, config: RequestConfig): Promise<T> {
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
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }

      if (error instanceof ApiError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Network request failed';
      throw new ApiError(errorMessage, 500);
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = unknown>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ============================================================================
  // Summoner Endpoints
  // ============================================================================

  /**
   * Get summoner information
   */
  async getSummonerInfo(summonerName: string, tagLine: string): Promise<SummonerInfo> {
    return this.get<SummonerInfo>(
      `/Summoner/${encodeURIComponent(summonerName)}/${encodeURIComponent(tagLine)}`
    );
  }

  // ============================================================================
  // Match Endpoints
  // ============================================================================

  /**
   * Get match history by summoner
   * First fetches summoner info to get PUUID, then fetches match history
   */
  async getMatchHistoryBySummoner(
    summonerName: string,
    tagLine: string,
    start: number = 0,
    count: number = 10
  ): Promise<MatchHistory> {
    // First get summoner info to retrieve PUUID
    const summonerInfo = await this.getSummonerInfo(summonerName, tagLine);
    
    if (!summonerInfo.puuid) {
      throw new ApiError('Could not retrieve summoner PUUID', 404);
    }
    
    // Then get match history using PUUID
    return this.getMatchHistoryByPuuid(summonerInfo.puuid, start, count);
  }

  /**
   * Get match history by PUUID
   */
  async getMatchHistoryByPuuid(
    puuid: string,
    start: number = 0,
    count: number = 10
  ): Promise<MatchHistory> {
    return this.get<MatchHistory>(`/Match/${encodeURIComponent(puuid)}?start=${start}&count=${count}`);
  }

  // ============================================================================
  // Ranked Endpoints
  // ============================================================================

  /**
   * Get ranked information
   */
  async getRankedInfo(puuid: string): Promise<RankedInfo> {
    return this.get<RankedInfo>(`/Ranked/${encodeURIComponent(puuid)}`);
  }

  // ============================================================================
  // Mastery Endpoints
  // ============================================================================

  /**
   * Get champion mastery information
   */
  async getMasteryInfo(puuid: string): Promise<MasteryInfo> {
    return this.get<MasteryInfo>(`/Mastery/${encodeURIComponent(puuid)}`);
  }
}

// Export singleton instance
export default new ApiService();
