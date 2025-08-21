export interface PlayerStats {
  userId: number
  username: string
  gamesPlayed: number
  wins: number
  losses: number
  totalScore: number
  averageScore: number
  winRate: number
  rank: number
}

export interface GameStats {
  gameId: number
  gameName: string
  totalPlays: number
  uniquePlayers: number
  averageScore: number
  highestScore: number
  lowestScore: number
  lastPlayed: Date
}

export interface ScoreboardData {
  playerStats: PlayerStats[]
  gameStats: GameStats[]
  totalGames: number
  totalPlayers: number
  totalResults: number
  lastUpdated: Date
}

export class Scoreboard {
  constructor(
    public readonly data: ScoreboardData
  ) {}

  public getTopPlayers(limit = 10): PlayerStats[] {
    return this.data.playerStats
      .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins)
      .slice(0, limit)
  }

  public getPlayerByUserId(userId: number): PlayerStats | null {
    return this.data.playerStats.find(p => p.userId === userId) || null
  }

  public getMostPlayedGames(limit = 10): GameStats[] {
    return this.data.gameStats
      .sort((a, b) => b.totalPlays - a.totalPlays)
      .slice(0, limit)
  }

  public getGameStats(gameId: number): GameStats | null {
    return this.data.gameStats.find(g => g.gameId === gameId) || null
  }

  public getPlayersByGame(gameId: number): PlayerStats[] {
    // This would need to be implemented with additional data
    // For now, return all players (in a real implementation, 
    // we'd filter by players who played this specific game)
    return this.data.playerStats
  }

  public getOverallStats() {
    return {
      totalGames: this.data.totalGames,
      totalPlayers: this.data.totalPlayers,
      totalResults: this.data.totalResults,
      lastUpdated: this.data.lastUpdated
    }
  }
}