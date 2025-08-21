import { PlayerStats, GameStats, ScoreboardData } from '../entities/Scoreboard'

export interface RecentActivity {
  id: number
  type: 'game_result'
  gameId: number
  gameName: string
  playerCount: number
  winners: string[]
  playedAt: Date
}

export interface IScoreboardRepository {
  getScoreboardData(): Promise<ScoreboardData>
  getPlayerStats(userId?: number): Promise<PlayerStats[]>
  getGameStats(gameId?: number): Promise<GameStats[]>
  getPlayerStatsByGame(gameId: number): Promise<PlayerStats[]>
  getTopPlayersByWinRate(limit?: number): Promise<PlayerStats[]>
  getTopPlayersByWins(limit?: number): Promise<PlayerStats[]>
  getMostPlayedGames(limit?: number): Promise<GameStats[]>
  getRecentActivity(limit?: number): Promise<RecentActivity[]>
}