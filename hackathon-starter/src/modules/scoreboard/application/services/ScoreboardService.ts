import { Scoreboard, PlayerStats, GameStats } from '../../domain/entities/Scoreboard'
import { IScoreboardRepository, RecentActivity } from '../../domain/repositories/IScoreboardRepository'
import { AppError } from '@/src/shared/errors/AppError'
import {
  ScoreboardResponseDto,
  PlayerStatsDto,
  GameStatsDto,
  LeaderboardDto,
  PlayerProfileDto,
  RecentActivityDto
} from '../dtos/ScoreboardDtos'

export class ScoreboardService {
  constructor(
    private readonly scoreboardRepository: IScoreboardRepository
  ) {}

  async getScoreboard(): Promise<ScoreboardResponseDto> {
    try {
      const scoreboardData = await this.scoreboardRepository.getScoreboardData()
      const scoreboard = new Scoreboard(scoreboardData)

      return {
        playerStats: scoreboardData.playerStats.map(this.mapPlayerStatsToDto),
        gameStats: scoreboardData.gameStats.map(this.mapGameStatsToDto),
        totalGames: scoreboardData.totalGames,
        totalPlayers: scoreboardData.totalPlayers,
        totalResults: scoreboardData.totalResults,
        lastUpdated: scoreboardData.lastUpdated.toISOString()
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Failed to get scoreboard: ${error.message}`, 500)
      }
      throw new AppError('Failed to get scoreboard', 500)
    }
  }

  async getLeaderboard(): Promise<LeaderboardDto> {
    try {
      const [topByWinRate, topByWins, mostPlayed, recentActivity] = await Promise.all([
        this.scoreboardRepository.getTopPlayersByWinRate(10),
        this.scoreboardRepository.getTopPlayersByWins(10),
        this.scoreboardRepository.getMostPlayedGames(10),
        this.scoreboardRepository.getRecentActivity(20)
      ])

      return {
        topPlayersByWinRate: topByWinRate.map(this.mapPlayerStatsToDto),
        topPlayersByWins: topByWins.map(this.mapPlayerStatsToDto),
        mostPlayedGames: mostPlayed.map(this.mapGameStatsToDto),
        recentActivity: recentActivity.map(this.mapRecentActivityToDto)
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Failed to get leaderboard: ${error.message}`, 500)
      }
      throw new AppError('Failed to get leaderboard', 500)
    }
  }

  async getPlayerProfile(userId: number): Promise<PlayerProfileDto> {
    try {
      const playerStats = await this.scoreboardRepository.getPlayerStats(userId)
      const player = playerStats.find(p => p.userId === userId)

      if (!player) {
        throw new AppError('Player not found', 404)
      }

      // Get game breakdown for this player
      const gameStats = await this.scoreboardRepository.getGameStats()
      const gameBreakdown = gameStats.map(game => ({
        gameId: game.gameId,
        gameName: game.gameName,
        gamesPlayed: 0, // This would need to be calculated from actual data
        wins: 0,
        winRate: 0,
        averageScore: 0,
        bestScore: 0
      }))

      // Get recent games for this player
      const recentActivity = await this.scoreboardRepository.getRecentActivity(10)
      const playerRecentGames = recentActivity.filter(activity => 
        // This is a simplified filter - in reality we'd need to check if the player participated
        true
      )

      return {
        player: this.mapPlayerStatsToDto(player),
        gameBreakdown,
        recentGames: playerRecentGames.map(this.mapRecentActivityToDto)
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      if (error instanceof Error) {
        throw new AppError(`Failed to get player profile: ${error.message}`, 500)
      }
      throw new AppError('Failed to get player profile', 500)
    }
  }

  async getGameLeaderboard(gameId: number): Promise<PlayerStatsDto[]> {
    try {
      const playerStats = await this.scoreboardRepository.getPlayerStatsByGame(gameId)
      return playerStats
        .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins)
        .map(this.mapPlayerStatsToDto)
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Failed to get game leaderboard: ${error.message}`, 500)
      }
      throw new AppError('Failed to get game leaderboard', 500)
    }
  }

  async getTopPlayers(sortBy: 'winRate' | 'wins' = 'winRate', limit = 10): Promise<PlayerStatsDto[]> {
    try {
      const playerStats = sortBy === 'winRate' 
        ? await this.scoreboardRepository.getTopPlayersByWinRate(limit)
        : await this.scoreboardRepository.getTopPlayersByWins(limit)

      return playerStats.map(this.mapPlayerStatsToDto)
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Failed to get top players: ${error.message}`, 500)
      }
      throw new AppError('Failed to get top players', 500)
    }
  }

  async getGameStats(gameId?: number): Promise<GameStatsDto[]> {
    try {
      const gameStats = await this.scoreboardRepository.getGameStats(gameId)
      return gameStats.map(this.mapGameStatsToDto)
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Failed to get game stats: ${error.message}`, 500)
      }
      throw new AppError('Failed to get game stats', 500)
    }
  }

  private mapPlayerStatsToDto(stats: PlayerStats): PlayerStatsDto {
    return {
      userId: stats.userId,
      username: stats.username,
      gamesPlayed: stats.gamesPlayed,
      wins: stats.wins,
      losses: stats.losses,
      totalScore: stats.totalScore,
      averageScore: Math.round(stats.averageScore * 100) / 100,
      winRate: Math.round(stats.winRate * 100) / 100,
      rank: stats.rank
    }
  }

  private mapGameStatsToDto(stats: GameStats): GameStatsDto {
    return {
      gameId: stats.gameId,
      gameName: stats.gameName,
      totalPlays: stats.totalPlays,
      uniquePlayers: stats.uniquePlayers,
      averageScore: Math.round(stats.averageScore * 100) / 100,
      highestScore: stats.highestScore,
      lowestScore: stats.lowestScore,
      lastPlayed: stats.lastPlayed.toISOString()
    }
  }

  private mapRecentActivityToDto(activity: RecentActivity): RecentActivityDto {
    return {
      id: activity.id,
      type: activity.type,
      gameId: activity.gameId,
      gameName: activity.gameName,
      playerCount: activity.playerCount,
      winners: activity.winners,
      playedAt: activity.playedAt.toISOString()
    }
  }
}