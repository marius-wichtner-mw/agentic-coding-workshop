import { PrismaClient } from '@prisma/client'
import { GameResult, PlayerResult } from '../../domain/entities/GameResult'
import { IGameResultRepository, CreateGameResultData, UpdateGameResultData } from '../../domain/repositories/IGameResultRepository'
import { AppError } from '@/src/shared/errors/AppError'

interface PrismaGameResultWithPlayers {
  id: number
  gameId: number
  playedAt: Date
  notes: string | null
  createdAt: Date
  players: {
    id: number
    gameResultId: number
    userId: number
    score: number
    isWinner: boolean
  }[]
}

export class PrismaGameResultRepository implements IGameResultRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateGameResultData): Promise<GameResult> {
    try {
      const gameResult = await this.prisma.gameResult.create({
        data: {
          gameId: data.gameId,
          playedAt: data.playedAt,
          notes: data.notes,
          players: {
            create: data.players.map(player => ({
              userId: player.userId,
              score: player.score,
              isWinner: player.isWinner
            }))
          }
        },
        include: {
          players: true
        }
      })

      return this.mapToDomain(gameResult)
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Failed to create game result: ${error.message}`, 500)
      }
      throw new AppError('Failed to create game result', 500)
    }
  }

  async findById(id: number): Promise<GameResult | null> {
    try {
      const gameResult = await this.prisma.gameResult.findUnique({
        where: { id },
        include: {
          players: true
        }
      })

      return gameResult ? this.mapToDomain(gameResult) : null
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Failed to find game result: ${error.message}`, 500)
      }
      throw new AppError('Failed to find game result', 500)
    }
  }

  async findAll(): Promise<GameResult[]> {
    try {
      const gameResults = await this.prisma.gameResult.findMany({
        include: {
          players: true
        },
        orderBy: {
          playedAt: 'desc'
        }
      })

      return gameResults.map(gr => this.mapToDomain(gr))
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Failed to find game results: ${error.message}`, 500)
      }
      throw new AppError('Failed to find game results', 500)
    }
  }

  async findByGameId(gameId: number): Promise<GameResult[]> {
    try {
      const gameResults = await this.prisma.gameResult.findMany({
        where: { gameId },
        include: {
          players: true
        },
        orderBy: {
          playedAt: 'desc'
        }
      })

      return gameResults.map(gr => this.mapToDomain(gr))
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Failed to find game results by game ID: ${error.message}`, 500)
      }
      throw new AppError('Failed to find game results by game ID', 500)
    }
  }

  async findByUserId(userId: number): Promise<GameResult[]> {
    try {
      const gameResults = await this.prisma.gameResult.findMany({
        where: {
          players: {
            some: {
              userId: userId
            }
          }
        },
        include: {
          players: true
        },
        orderBy: {
          playedAt: 'desc'
        }
      })

      return gameResults.map(gr => this.mapToDomain(gr))
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Failed to find game results by user ID: ${error.message}`, 500)
      }
      throw new AppError('Failed to find game results by user ID', 500)
    }
  }

  async update(id: number, data: UpdateGameResultData): Promise<GameResult> {
    try {
      // If updating players, we need to delete existing players and create new ones
      if (data.players) {
        await this.prisma.$transaction(async (tx) => {
          // Delete existing players
          await tx.gameResultPlayer.deleteMany({
            where: { gameResultId: id }
          })

          // Update game result and create new players
          await tx.gameResult.update({
            where: { id },
            data: {
              playedAt: data.playedAt,
              notes: data.notes,
              players: {
                create: data.players!.map(player => ({
                  userId: player.userId,
                  score: player.score,
                  isWinner: player.isWinner
                }))
              }
            }
          })
        })
      } else {
        // Just update the game result fields
        await this.prisma.gameResult.update({
          where: { id },
          data: {
            playedAt: data.playedAt,
            notes: data.notes
          }
        })
      }

      // Fetch the updated result
      const updatedResult = await this.prisma.gameResult.findUnique({
        where: { id },
        include: {
          players: true
        }
      })

      if (!updatedResult) {
        throw new AppError('Game result not found after update', 404)
      }

      return this.mapToDomain(updatedResult)
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      if (error instanceof Error) {
        throw new AppError(`Failed to update game result: ${error.message}`, 500)
      }
      throw new AppError('Failed to update game result', 500)
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Delete players first (due to foreign key constraint)
        await tx.gameResultPlayer.deleteMany({
          where: { gameResultId: id }
        })

        // Delete the game result
        await tx.gameResult.delete({
          where: { id }
        })
      })
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Failed to delete game result: ${error.message}`, 500)
      }
      throw new AppError('Failed to delete game result', 500)
    }
  }

  async findRecentResults(limit = 10): Promise<GameResult[]> {
    try {
      const gameResults = await this.prisma.gameResult.findMany({
        include: {
          players: true
        },
        orderBy: {
          playedAt: 'desc'
        },
        take: limit
      })

      return gameResults.map(gr => this.mapToDomain(gr))
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Failed to find recent game results: ${error.message}`, 500)
      }
      throw new AppError('Failed to find recent game results', 500)
    }
  }

  private mapToDomain(prismaGameResult: PrismaGameResultWithPlayers): GameResult {
    const players: PlayerResult[] = prismaGameResult.players.map(p => ({
      userId: p.userId,
      score: p.score,
      isWinner: p.isWinner
    }))

    return new GameResult(
      prismaGameResult.id,
      prismaGameResult.gameId,
      players,
      prismaGameResult.playedAt,
      prismaGameResult.notes || undefined
    )
  }
}