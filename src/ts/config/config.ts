/**
 * Application Configuration
 * Single source of truth for all configuration values
 * Supports environment variables via import.meta.env (Vite)
 */

declare global {
  interface ImportMetaEnv {
    readonly VITE_DDRAGON_VERSION?: string;
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_API_FALLBACK_URL?: string;
    readonly VITE_API_TIMEOUT?: number;
    readonly MODE?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api',
    fallbackUrl: import.meta.env?.VITE_API_FALLBACK_URL || 'https://localhost:5001/api',
    timeout: import.meta.env?.VITE_API_TIMEOUT || 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    options: {
      mode: 'cors' as RequestMode,
      credentials: 'omit' as RequestCredentials,
    }
  },

// External Services
services: {
    ddragon: {
        version: import.meta.env?.VITE_DDRAGON_VERSION || '14.20.1',
        baseUrl: 'https://ddragon.leagueoflegends.com/cdn' as const,
        endpoints: {
            versions: 'https://ddragon.leagueoflegends.com/api/versions.json' as const,
            champion: (version: string): string => `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion`,
            item: (version: string): string => `https://ddragon.leagueoflegends.com/cdn/${version}/img/item`,
            profileIcon: (version: string): string => `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon`,
            spell: (version: string): string => `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell`,
            itemData: (version: string): string => `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`,
            summonerData: (version: string): string => `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`,
        },
        fallbackIcons: [
            'https://ddragon.leagueoflegends.com/cdn/14.20.1/img/profileicon/0.png',
            'https://ddragon.leagueoflegends.com/cdn/13.6.1/img/profileicon/0.png',
        ] as const
    },
    communityDragon: {
        version: 'latest' as const,
        baseUrl: 'https://raw.communitydragon.org' as const,
        arenaAugments: [
            'https://raw.communitydragon.org/latest/cdragon/arena/en_us.json',
            'https://raw.communitydragon.org/13.24/cdragon/arena/en_us.json',
            'https://raw.communitydragon.org/13.16/cdragon/arena/en_us.json'
        ] as const
    }
},

  // Cache Configuration
  cache: {
    duration: 5 * 60 * 1000, // 5 minutes
  },

  // Match History Settings
  matches: {
    defaultCount: 10,
    loadMoreCount: 10,
  },

  // Environment
  environment: import.meta.env?.MODE || 'development',
  isDevelopment: import.meta.env?.MODE === 'development' || 
                 window.location.hostname === 'localhost' ||
                 window.location.hostname === '127.0.0.1',
};

// Freeze config to prevent modifications
export default Object.freeze(config);
