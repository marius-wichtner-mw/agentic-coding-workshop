import { PrismaClient } from '@prisma/client'
import { PlayerStats, GameStats, ScoreboardData } from '../../domain/entities/Scoreboard'
import { IScoreboardRepository, RecentActivity } from '../../domain/repositories/IScoreboardRepository'
import { AppError } from '@/src/shared/errors/AppError'

export class PrismaScoreboardRepository implements IScoreboardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getScoreboardData(): Promise<ScoreboardData> {
    try {
      const [playerStats, gameStats, totalCounts] = await Promise.all([
        this.getPlayerStats(),
        this.getGameStats(),
        this.getTotalCounts()
      ])

      return {
        playerStats,
        gameStats,
        totalGames: totalCounts.totalGames,
        totalPlayers: totalCounts.totalPlayers,
        totalResults: totalCounts.totalResults,
        lastUpdated: new Date()
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Failed to get scoreboard data: ${error.message}`, 500)
      }
      throw new AppError('Failed to get scoreboard data', 500)
    }
  }

  async getPlayerStats(userId?: number): Promise<PlayerStats[]> {
    try {
      const whereClause = userId ? { id: userId } : {}
      
      const users = await this.prisma.user.findMany({
        where: whereClause,
        include: {
          gameResults: {
            include: {
              gameResult: true
            }
          }
        }
      })

      const playerStats: PlayerStats[] = []

      for (const user of users) {
        const gamesPlayed = user.gameResults.length
        const wins = user.gameResults.filter(gr => gr.isWinner).length
        const losses = gamesPlayed - wins
        const totalScore = user.gameResults.reduce((sum, gr) => sum + gr.score, 0)
        const averageScore = gamesPlayed > 0 ? totalScore / gamesPlayed : 0
        const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0

        playerStats.push({
          userId: user.id,
          username: user.username,
          gamesPlayed,
          wins,
          losses,
          totalScore,
          averageScore,
          winRate,
          rank: 0 // Will be calculated after sorting
        })
      }

      // Sort by win rate and assign ranks
      playerStats.sort((a, b) => b.winRate - a.winRate || b.wins - a.wins)
      playerStats.forEach((player, index) => {
        player.rank = index + 1
      })

      return playerStats
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Failed to get player stats: ${error.message}`, 500)
      }
      throw new AppError('Failed to get player stats', 500)
    }
  }

  async getGameStats(gameId?: number): Promise<GameStats[]> {
    try {
      const whereClause = gameId ? { id: gameId } : {}
      
      const games = await this.prisma.game.findMany({
        where: whereClause,
        include: {
          results: {
            include: {
              players: true
            }
          }
        }
      })

      const gameStats: GameStats[] = []

      for (const game of games) {
        const totalPlays = game.results.length
        const uniquePlayers = new Set(
          game.results.flatMap(result => result.players.map(p => p.userId))
        ).size
        
        const allScores = game.results.flatMap(result => result.players.map(p => p.score))
        const averageScore = allScores.length > 0 ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length : 0
        const highestScore = allScores.length > 0 ? Math.max(...allScores) : 0
        const lowestScore = allScores.length > 0 ? Math.min(...allScores) : 0
        
        const lastPlayed = game.results.length > 0 
          ? new Date(Math.max(...game.results.map(r => r.playedAt.getTime())))
          : game.createdAt

        gameStats.push({
          gameId: game.id,
          gameName: game.name,
          totalPlays,
          uniquePlayers,
          averageScore,
          highestScore,
          lowestScore,
          lastPlayed
        })
      }

      return gameStats
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Failed to get game stats: ${error.message}`, 500)
      }
      throw new AppError('Failed to get game stats', 500)
    }
  }

  async getPlayerStatsByGame(gameId: number): Promise<PlayerStats[]> {
    try {
      const gameResults = await this.prisma.gameResult.findMany({
        where: { gameId },
        include: {
          players: {
            include: {
              user: true
            }
          }
        }
      })

      const playerStatsMap = new Map<number, {
        userId: number
        username: string
        gamesPlayed: number
        wins: number
        totalScore: number
        scores: number[]
      }>()

      // Aggregate stats for each player in this game
      for (const result of gameResults) {
        for (const player of result.players) {
          const existing = playerStatsMap.get(player.userId) || {
            userId: player.userId,
            username: player.user.username,
            gamesPlayed: 0,
            wins: 0,
            totalScore: 0,
            scores: []
          }

          existing.gamesPlayed++
          if (player.isWinner) existing.wins++
          existing.totalScore += player.score
          existing.scores.push(player.score)

          playerStatsMap.set(player.userId, existing)
        }
      }

      const playerStats: PlayerStats[] = Array.from(playerStatsMap.values()).map(stats => ({
        userId: stats.userId,
        username: stats.username,
        gamesPlayed: stats.gamesPlayed,
        wins: stats.wins,
        losses: stats.gamesPlayed - stats.wins,
        totalScore: stats.totalScore,
        averageScore: stats.totalScore / stats.gamesPlayed,
        winRate: (stats.wins / stats.gamesPlayed) * 100,
        rank: 0
      }))

      // Sort and assign ranks
      playerStats.sort((a, b) => b.winRate - a.winRate || b.wins - a.wins)
      playerStats.forEach((player, index) => {
        player.rank = index + 1
      })

      return playerStats
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Failed to get player stats by game: ${error.message}`, 500)
      }
      throw new AppError('Failed to get player stats by game', 500)
    }
  }

  async getTopPlayersByWinRate(limit = 10): Promise<PlayerStats[]> {
    const playerStats = await this.getPlayerStats()
    return playerStats
      .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins)
      .slice(0, limit)
  }

  async getTopPlayersByWins(limit = 10): Promise<PlayerStats[]> {
    const playerStats = await this.getPlayerStats()
    return playerStats
      .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate)
      .slice(0, limit)
  }

  async getMostPlayedGames(limit = 10): Promise<GameStats[]> {
    const gameStats = await this.getGameStats()
    return gameStats
      .sort((a, b) => b.totalPlays - a.totalPlays)
      .slice(0, limit)
  }

  async getRecentActivity(limit = 20): Promise<RecentActivity[]> {
    try {
      const recentResults = await this.prisma.gameResult.findMany({
        include: {
          game: true,
          players: {
            where: { isWinner: true },
            include: {
              user: true
            }
          }
        },
        orderBy: {
          playedAt: 'desc'
        },
        take: limit
      })

      return recentResults.map(result => ({
        id: result.id,
        type: 'game_result' as const,
        gameId: result.gameId,
        gameName: result.game.name,
        playerCount: result.players.length,
        winners: result.players.map(p => p.user.username),
        playedAt: result.playedAt
      }))
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Failed to get recent activity: ${error.message}`, 500)
      }
      throw new AppError('Failed to get recent activity', 500)
    }
  }

  private async getTotalCounts() {
    try {
      const [totalGames, totalPlayers, totalResults] = await Promise.all([
        this.prisma.game.count(),
        this.prisma.user.count(),
        this.prisma.gameResult.count()
      ])

      return { totalGames, totalPlayers, totalResults }
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Failed to get total counts: ${error.message}`, 500)
      }
      throw new AppError('Failed to get total counts', 500)
    }
  }
}