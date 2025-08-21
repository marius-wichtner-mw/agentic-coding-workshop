import { GameResult } from '../../domain/entities/GameResult'
import { IGameResultRepository, CreateGameResultData, UpdateGameResultData } from '../../domain/repositories/IGameResultRepository'
import { IUserRepository } from '../../../users/domain/repositories/IUserRepository'
import { IGameRepository } from '../../../games/domain/repositories/IGameRepository'
import { User } from '../../../users/domain/entities/User'
import { Game } from '../../../games/domain/entities/Game'
import { AppError } from '@/src/shared/errors/AppError'
import {
  CreateGameResultDto,
  UpdateGameResultDto,
  GameResultResponseDto,
  GameResultListDto,
  PlayerResultDto
} from '../dtos/GameResultDtos'

export class GameResultService {
  constructor(
    private readonly gameResultRepository: IGameResultRepository,
    private readonly userRepository: IUserRepository,
    private readonly gameRepository: IGameRepository
  ) {}

  async createGameResult(dto: CreateGameResultDto): Promise<GameResultResponseDto> {
    // Validate game exists
    const game = await this.gameRepository.findById(dto.gameId)
    if (!game) {
      throw new AppError('Game not found', 404)
    }

    // Validate all users exist
    const userIds = dto.players.map(p => p.userId)
    const users = await Promise.all(
      userIds.map(id => this.userRepository.findById(id))
    )
    
    for (let i = 0; i < users.length; i++) {
      if (!users[i]) {
        throw new AppError(`User with ID ${userIds[i]} not found`, 404)
      }
    }

    // Create the game result
    const gameResultData: CreateGameResultData = {
      gameId: dto.gameId,
      players: dto.players,
      playedAt: dto.playedAt,
      notes: dto.notes
    }

    const gameResult = await this.gameResultRepository.create(gameResultData)

    return this.mapToResponseDto(gameResult, game.name, users.filter(u => u !== null) as User[])
  }

  async getGameResultById(id: number): Promise<GameResultResponseDto> {
    const gameResult = await this.gameResultRepository.findById(id)
    if (!gameResult) {
      throw new AppError('Game result not found', 404)
    }

    // Get game and user details
    const game = await this.gameRepository.findById(gameResult.gameId)
    const userIds = gameResult.players.map(p => p.userId)
    const users = await Promise.all(
      userIds.map(id => this.userRepository.findById(id))
    )

    return this.mapToResponseDto(gameResult, game?.name, users.filter(u => u !== null) as User[])
  }

  async getAllGameResults(): Promise<GameResultListDto[]> {
    const gameResults = await this.gameResultRepository.findAll()
    
    // Get all unique game IDs and user IDs
    const gameIds = [...new Set(gameResults.map(gr => gr.gameId))]
    const userIds = [...new Set(gameResults.flatMap(gr => gr.players.map(p => p.userId)))]

    // Fetch games and users in parallel
    const [games, users] = await Promise.all([
      Promise.all(gameIds.map(id => this.gameRepository.findById(id))),
      Promise.all(userIds.map(id => this.userRepository.findById(id)))
    ])

    // Create lookup maps
    const gameMap = new Map(games.filter(g => g).map(g => [g!.id, g!]))
    const userMap = new Map(users.filter(u => u).map(u => [u!.id, u!]))

    return gameResults.map(gr => this.mapToListDto(gr, gameMap, userMap))
  }

  async getGameResultsByGameId(gameId: number): Promise<GameResultListDto[]> {
    const gameResults = await this.gameResultRepository.findByGameId(gameId)
    
    // Get game and user details
    const game = await this.gameRepository.findById(gameId)
    const userIds = [...new Set(gameResults.flatMap(gr => gr.players.map(p => p.userId)))]
    const users = await Promise.all(
      userIds.map(id => this.userRepository.findById(id))
    )

    const userMap = new Map(users.filter(u => u).map(u => [u!.id, u!]))
    const gameMap = new Map(game ? [[game.id, game]] : [])

    return gameResults.map(gr => this.mapToListDto(gr, gameMap, userMap))
  }

  async getGameResultsByUserId(userId: number): Promise<GameResultListDto[]> {
    const gameResults = await this.gameResultRepository.findByUserId(userId)
    
    // Get game and user details
    const gameIds = [...new Set(gameResults.map(gr => gr.gameId))]
    const userIds = [...new Set(gameResults.flatMap(gr => gr.players.map(p => p.userId)))]
    
    const [games, users] = await Promise.all([
      Promise.all(gameIds.map(id => this.gameRepository.findById(id))),
      Promise.all(userIds.map(id => this.userRepository.findById(id)))
    ])

    const gameMap = new Map(games.filter(g => g).map(g => [g!.id, g!]))
    const userMap = new Map(users.filter(u => u).map(u => [u!.id, u!]))

    return gameResults.map(gr => this.mapToListDto(gr, gameMap, userMap))
  }

  async updateGameResult(id: number, dto: UpdateGameResultDto): Promise<GameResultResponseDto> {
    const existingResult = await this.gameResultRepository.findById(id)
    if (!existingResult) {
      throw new AppError('Game result not found', 404)
    }

    // If updating players, validate all users exist
    if (dto.players) {
      const userIds = dto.players.map(p => p.userId)
      const users = await Promise.all(
        userIds.map(id => this.userRepository.findById(id))
      )
      
      for (let i = 0; i < users.length; i++) {
        if (!users[i]) {
          throw new AppError(`User with ID ${userIds[i]} not found`, 404)
        }
      }
    }

    const updatedResult = await this.gameResultRepository.update(id, dto)
    
    // Get game and user details for response
    const game = await this.gameRepository.findById(updatedResult.gameId)
    const userIds = updatedResult.players.map(p => p.userId)
    const users = await Promise.all(
      userIds.map(id => this.userRepository.findById(id))
    )

    return this.mapToResponseDto(updatedResult, game?.name, users.filter(u => u !== null) as User[])
  }

  async deleteGameResult(id: number): Promise<void> {
    const gameResult = await this.gameResultRepository.findById(id)
    if (!gameResult) {
      throw new AppError('Game result not found', 404)
    }

    await this.gameResultRepository.delete(id)
  }

  async getRecentGameResults(limit = 10): Promise<GameResultListDto[]> {
    const gameResults = await this.gameResultRepository.findRecentResults(limit)
    
    // Get all unique game IDs and user IDs
    const gameIds = [...new Set(gameResults.map(gr => gr.gameId))]
    const userIds = [...new Set(gameResults.flatMap(gr => gr.players.map(p => p.userId)))]

    // Fetch games and users in parallel
    const [games, users] = await Promise.all([
      Promise.all(gameIds.map(id => this.gameRepository.findById(id))),
      Promise.all(userIds.map(id => this.userRepository.findById(id)))
    ])

    // Create lookup maps
    const gameMap = new Map(games.filter(g => g).map(g => [g!.id, g!]))
    const userMap = new Map(users.filter(u => u).map(u => [u!.id, u!]))

    return gameResults.map(gr => this.mapToListDto(gr, gameMap, userMap))
  }

  private mapToResponseDto(
    gameResult: GameResult,
    gameName?: string,
    users: User[] = []
  ): GameResultResponseDto {
    const userMap = new Map(users.map(u => [u.id, u]))
    
    const players: PlayerResultDto[] = gameResult.players.map(p => ({
      userId: p.userId,
      username: userMap.get(p.userId)?.username,
      score: p.score,
      isWinner: p.isWinner
    }))

    return {
      id: gameResult.id,
      gameId: gameResult.gameId,
      gameName,
      players,
      playedAt: gameResult.playedAt.toISOString(),
      notes: gameResult.notes
    }
  }

  private mapToListDto(
    gameResult: GameResult,
    gameMap: Map<number, Game>,
    userMap: Map<number, User>
  ): GameResultListDto {
    const winners = gameResult.getWinners()
      .map(w => userMap.get(w.userId)?.username || `User ${w.userId}`)
      .filter(Boolean)

    return {
      id: gameResult.id,
      gameId: gameResult.gameId,
      gameName: gameMap.get(gameResult.gameId)?.name,
      playerCount: gameResult.players.length,
      winners,
      playedAt: gameResult.playedAt.toISOString(),
      notes: gameResult.notes
    }
  }
}