export interface PlayerStatsDto {
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

export interface GameStatsDto {
  gameId: number
  gameName: string
  totalPlays: number
  uniquePlayers: number
  averageScore: number
  highestScore: number
  lowestScore: number
  lastPlayed: string
}

export interface ScoreboardResponseDto {
  playerStats: PlayerStatsDto[]
  gameStats: GameStatsDto[]
  totalGames: number
  totalPlayers: number
  totalResults: number
  lastUpdated: string
}

export interface RecentActivityDto {
  id: number
  type: 'game_result'
  gameId: number
  gameName: string
  playerCount: number
  winners: string[]
  playedAt: string
}

export interface LeaderboardDto {
  topPlayersByWinRate: PlayerStatsDto[]
  topPlayersByWins: PlayerStatsDto[]
  mostPlayedGames: GameStatsDto[]
  recentActivity: RecentActivityDto[]
}

export interface PlayerProfileDto {
  player: PlayerStatsDto
  gameBreakdown: {
    gameId: number
    gameName: string
    gamesPlayed: number
    wins: number
    winRate: number
    averageScore: number
    bestScore: number
  }[]
  recentGames: RecentActivityDto[]
}