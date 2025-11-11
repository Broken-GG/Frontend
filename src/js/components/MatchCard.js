/**
 * Match Card Component
 * Generates HTML for individual match cards
 */

import dataDragonService from '@/js/services/DataDragonService.js';
import augmentsService from '@/js/services/AugmentsService.js';
import logger from '@/js/utils/logger.js';

export class MatchCard {
  /**
   * Create a match card element
   */
  static async create(match) {
    const mainPlayer = match.MainPlayer || match.mainPlayer;

    // Win status is in the match object, not mainPlayer
    const isWin = match.victory === true || match.Victory === true;
    const matchId = match.MatchId || match.matchId || Date.now();
    const gameMode = match.GameMode || match.gameMode || 'Unknown';

    if (!mainPlayer) {
      throw new Error('MainPlayer data missing from match');
    }

    const matchCard = document.createElement('div');
    const arenaClass = gameMode === 'Arena' ? 'arena' : '';
    matchCard.className = `match-card ${isWin ? 'victory' : 'defeat'} ${arenaClass}`;
    matchCard.setAttribute('data-match-id', matchId);

    matchCard.innerHTML = await this.generateHTML(match, mainPlayer, isWin);

    return matchCard;
  }

  /**
   * Generate HTML for a match card
   */
  static async generateHTML(match, mainPlayer, isWin) {
    const gameMode = match.GameMode || match.gameMode || 'Unknown';
    const gameDate = match.GameDate || match.gameDate;
    const gameDurationMinutes = match.GameDurationMinutes || match.gameDurationMinutes;

    const championName = mainPlayer.ChampionName || mainPlayer.championName || 'Unknown';
    const championImageUrl =
      mainPlayer.ChampionImageUrl ||
      mainPlayer.championImageUrl ||
      (await dataDragonService.getChampionImageUrl(championName));

    const kills = mainPlayer.Kills || mainPlayer.kills || 0;
    const deaths = mainPlayer.Deaths || mainPlayer.deaths || 0;
    const assists = mainPlayer.Assists || mainPlayer.assists || 0;

    // Calculate KDA ratio: (kills + assists) / deaths (or "Perfect" if no deaths)
    const kdaRatio = deaths === 0 ? 'Perfect' : ((kills + assists) / deaths).toFixed(2);

    const parsedGameDate = gameDate ? new Date(gameDate) : new Date();
    const duration = gameDurationMinutes ? `${gameDurationMinutes}:00` : '30:00';
    const timeAgo = this.getTimeAgo(parsedGameDate);

    const cs = mainPlayer.CS || mainPlayer.cs || 0;
    const vision = mainPlayer.VisionScore || mainPlayer.visionScore || 0;
    const gameMinutes = gameDurationMinutes || 30;
    const csPerMin = (cs / gameMinutes).toFixed(1);

    const version = await dataDragonService.getLatestVersion();
    const championBaseUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion`;

    // Generate sub-sections
    const itemsHTML = await this.generateItemSlotsHTML(mainPlayer);
    const spellsHTML = await this.generateSummonerSpellsHTML(mainPlayer);
    const augmentsHTML = gameMode === 'Arena' ? await this.generateAugmentsHTML(mainPlayer) : '';

    // Teams display
    let teamsHTML;
    if (gameMode === 'Arena') {
      teamsHTML = await this.createArenaTeamsDisplay(match);
    } else {
      teamsHTML = await this.createTeamsDisplay(match);
    }

    return `
      <div class="match-info">
        <div class="game-type">${gameMode}</div>
        <div class="time-ago">${timeAgo}</div>
        <div class="game-result ${isWin ? 'win' : 'loss'}">${isWin ? 'Victory' : 'Defeat'}</div>
        <div class="game-duration">${duration}</div>
      </div>

      <div class="champion-section">
        <div class="champion-spells-items-row">
          <div class="champion-container">
            <img src="${championImageUrl}" alt="${championName}" class="champion-icon" title="${championName}"
                 onerror="this.src='${championBaseUrl}/Unknown.png'">
          </div>
          <div class="summoner-spells">
            ${spellsHTML}
          </div>
          <div class="items-section">
            <div class="items-row">
              ${itemsHTML}
            </div>
          </div>
        </div>
        ${augmentsHTML ? `<div class="augments-section">${augmentsHTML}</div>` : ''}
      </div>

      <div class="stats-section">
        <div class="kda">
          <span class="kda-numbers">${kills}/${deaths}/${assists}</span>
          <span class="kda-ratio">${kdaRatio} KDA</span>
        </div>
        <div class="cs-vision">
          <div>CS ${cs} (${csPerMin})</div>
          <div>Vision ${vision}</div>
        </div>
      </div>

      <div class="teams-section">
        ${teamsHTML}
      </div>
    `;
  }

  /**
   * Generate summoner spells HTML
   */
  static async generateSummonerSpellsHTML(player) {
    const placeholder =
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Crect width="32" height="32" fill="%23333333"/%3E%3C/svg%3E';

    let spellsHTML = '';
    const spell1Url = player.summoner1ImageUrl || player.Summoner1ImageUrl;
    const spell2Url = player.summoner2ImageUrl || player.Summoner2ImageUrl;

    const spell1Name = dataDragonService.getSummonerSpellName(spell1Url) || 'Summoner Spell 1';
    const spell2Name = dataDragonService.getSummonerSpellName(spell2Url) || 'Summoner Spell 2';

    if (spell1Url) {
      spellsHTML += `<div class="spell-slot" title="${spell1Name}">
        <img src="${spell1Url}" alt="${spell1Name}" class="spell-icon"
             onerror="this.src='${placeholder}';">
      </div>`;
    } else {
      spellsHTML += `<div class="spell-slot"></div>`;
    }

    if (spell2Url) {
      spellsHTML += `<div class="spell-slot" title="${spell2Name}">
        <img src="${spell2Url}" alt="${spell2Name}" class="spell-icon"
             onerror="this.src='${placeholder}';">
      </div>`;
    } else {
      spellsHTML += `<div class="spell-slot"></div>`;
    }

    return spellsHTML;
  }

  /**
   * Generate item slots HTML
   */
  static async generateItemSlotsHTML(player) {
    const placeholder =
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Crect width="32" height="32" fill="%23333333"/%3E%3C/svg%3E';

    let itemsHTML = '';
    for (let i = 0; i <= 5; i++) {
      const itemUrl = player[`item${i}ImageUrl`] || player[`Item${i}ImageUrl`];
      const itemId = player[`item${i}`] || player[`Item${i}`];

      if (itemUrl && itemId && itemId !== 0) {
        const itemName = dataDragonService.getItemName(itemId) || `Item ${itemId}`;
        itemsHTML += `<div class="item-slot" title="${itemName}">
          <img src="${itemUrl}" alt="${itemName}" class="item-icon"
               onerror="this.src='${placeholder}';">
        </div>`;
      } else {
        itemsHTML += `<div class="item-slot"></div>`;
      }
    }

    // Item 6 is the trinket
    const trinketUrl = player.item6ImageUrl || player.Item6ImageUrl;
    const trinketId = player.item6 || player.Item6;

    if (trinketUrl && trinketId && trinketId !== 0) {
      const trinketName = dataDragonService.getItemName(trinketId) || `Trinket ${trinketId}`;
      itemsHTML += `<div class="trinket-slot" title="${trinketName}">
        <img src="${trinketUrl}" alt="${trinketName}" class="item-icon"
             onerror="this.src='${placeholder}';">
      </div>`;
    } else {
      itemsHTML += `<div class="trinket-slot"></div>`;
    }

    return itemsHTML;
  }

  /**
   * Generate Arena augments HTML
   */
  static async generateAugmentsHTML(player) {
    const augments = player.PlayerAugments || player.playerAugments || [];

    if (!augments || augments.length === 0) {
      return '';
    }

    const iconMap = await augmentsService.getAugmentIconMap();

    let augmentsHTML = '<div class="augments-row">';
    augments.forEach((augmentId, index) => {
      if (!augmentId || augmentId === 0) {
        augmentsHTML += '<div class="augment-slot augment-empty"></div>';
        return;
      }

      const augmentInfo = augmentsService.getAugmentInfo(augmentId);

      if (augmentInfo && augmentInfo.iconUrl) {
        const augmentName = augmentInfo.name || `Augment ${augmentId}`;
        const rarity = augmentInfo.rarity || 0;
        let rarityClass = '';

        if (rarity === 2 || String(rarity).toLowerCase().includes('prismatic')) {
          rarityClass = 'prismatic';
        } else if (rarity === 1 || String(rarity).toLowerCase().includes('gold')) {
          rarityClass = 'gold';
        } else {
          rarityClass = 'silver';
        }

        augmentsHTML += `
          <div class="augment-slot augment-${rarityClass}" title="${augmentName}">
            <img src="${augmentInfo.iconUrl}" alt="${augmentName}" class="augment-icon"
                 onerror="this.parentElement.innerHTML='<div class=&quot;augment-id-display&quot;>${index + 1}</div>'">
          </div>`;
      } else {
        augmentsHTML += `
          <div class="augment-slot" title="Augment ${augmentId}">
            <div class="augment-id-display">${index + 1}</div>
          </div>`;
      }
    });
    augmentsHTML += '</div>';

    return augmentsHTML;
  }

  /**
   * Create Arena teams display (2v2v2v2v2v2 format)
   */
  static async createArenaTeamsDisplay(match) {
    const allPlayers = match.AllPlayers || match.allPlayers || [];

    if (allPlayers.length === 0) {
      return '<div class="arena-teams"><div class="no-team-data">No team data available</div></div>';
    }

    const teamsMap = new Map();

    allPlayers.forEach((player) => {
      const teamId = player.TeamId || player.teamId || 0;
      const subteamId = player.SubteamPlacement || player.subteamPlacement || 0;
      const teamKey = `${teamId}-${subteamId}`;

      if (!teamsMap.has(teamKey)) {
        teamsMap.set(teamKey, {
          placement: subteamId,
          players: [],
        });
      }
      teamsMap.get(teamKey).players.push(player);
    });

    const duoTeams = Array.from(teamsMap.values()).sort((a, b) => a.placement - b.placement);

    const duoTeamsHTML = await Promise.all(
      duoTeams.map(async (team) => {
        const playersHTML = await Promise.all(team.players.map((player) => this.createPlayerDisplay(player)));
        const placementLabel = this.getPlacementLabel(team.placement);
        return `
          <div class="arena-duo placement-${team.placement}">
            <div class="arena-placement">${placementLabel}</div>
            ${playersHTML.join('')}
          </div>
        `;
      })
    );

    const topDuoTeamsHTML = duoTeamsHTML.slice(0, 4);

    return `<div class="arena-teams">${topDuoTeamsHTML.join('')}</div>`;
  }

  /**
   * Create teams display (5v5 format)
   */
  static async createTeamsDisplay(match) {
    const allPlayers = match.AllPlayers || match.allPlayers || [];

    if (allPlayers.length === 0) {
      return '<div class="team-vs-team"><div class="no-team-data">No team data available</div></div>';
    }

    const team1 = allPlayers.filter((p) => (p.TeamId || p.teamId) === 100);
    const team2 = allPlayers.filter((p) => (p.TeamId || p.teamId) === 200);

    const team1HTML = await Promise.all(team1.map((player) => this.createPlayerDisplay(player)));
    const team2HTML = await Promise.all(team2.map((player) => this.createPlayerDisplay(player)));

    return `
      <div class="team-vs-team">
        <div class="team blue-team">
          ${team1HTML.join('')}
        </div>
        <div class="vs-divider">VS</div>
        <div class="team red-team">
          ${team2HTML.join('')}
        </div>
      </div>
    `;
  }

  /**
   * Create player display HTML
   */
  static async createPlayerDisplay(player) {
    const championName = player.ChampionName || player.championName || 'Unknown';
    const summonerName = player.SummonerName || player.summonerName || 'Player';
    const tagLine = player.tagline || player.Tagline || player.tagLine || '';
    const championImageUrl =
      player.ChampionImageUrl ||
      player.championImageUrl ||
      (await dataDragonService.getChampionImageUrl(championName));
    const isMainPlayer = player.IsMainPlayer === true || player.isMainPlayer === true;

    const escapedSummonerName = summonerName.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const escapedTagLine = tagLine.replace(/'/g, "\\'").replace(/"/g, '&quot;');

    const version = await dataDragonService.getLatestVersion();
    const championBaseUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion`;

    return `
      <div class="team-player ${isMainPlayer ? 'searched-player' : ''}">
        <img src="${championImageUrl}" alt="${championName}" class="team-champion-icon"
             onerror="this.src='${championBaseUrl}/Unknown.png'">
        <button class="player-name" onclick="handleSearch('${escapedSummonerName}', '${escapedTagLine}')">${summonerName}</button>
      </div>
    `;
  }

  /**
   * Get placement label with ordinal suffix
   */
  static getPlacementLabel(placement) {
    if (!placement || placement === 0) return '';

    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = placement % 100;
    return placement + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
  }

  /**
   * Calculate time ago from a date
   */
  static getTimeAgo(date) {
    const now = new Date();
    const diffInMilliseconds = now - date;
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
      return 'Just now';
    }
  }
}

export default MatchCard;
