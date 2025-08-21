import { IGameRepository } from '../../domain/repositories/IGameRepository'
import { Game } from '../../domain/entities/Game'
import { CreateGameDto, UpdateGameDto, GameSearchDto } from '../dtos/GameDtos'
import { validateGameName, validateGameType, validateBase64Image } from '@/src/shared/utils/validation'
import { ValidationError } from '@/src/shared/errors/AppError'
import { GameType } from '@/src/shared/types/common'

export class GameService {
  constructor(private readonly gameRepository: IGameRepository) {}

  async createGame(createGameDto: CreateGameDto): Promise<Game> {
    // Validate input
    const nameErrors = validateGameName(createGameDto.name)
    if (nameErrors.length > 0) {
      throw new ValidationError(nameErrors[0])
    }

    const typeErrors = validateGameType(createGameDto.type)
    if (typeErrors.length > 0) {
      throw new ValidationError(typeErrors[0])
    }

    if (createGameDto.imageData) {
      const imageErrors = validateBase64Image(createGameDto.imageData)
      if (imageErrors.length > 0) {
        throw new ValidationError(imageErrors[0])
      }
    }

    return await this.gameRepository.create(
      createGameDto.name,
      createGameDto.type,
      createGameDto.createdBy,
      createGameDto.imageData
    )
  }

  async getGameById(id: number): Promise<Game | null> {
    return await this.gameRepository.findById(id)
  }

  async getGameByName(name: string): Promise<Game | null> {
    return await this.gameRepository.findByName(name)
  }

  async getAllGames(): Promise<Game[]> {
    return await this.gameRepository.findAll()
  }

  async getGamesByType(type: GameType): Promise<Game[]> {
    return await this.gameRepository.findByType(type)
  }

  async getGamesByCreator(createdBy: number): Promise<Game[]> {
    return await this.gameRepository.findByCreator(createdBy)
  }

  async updateGame(id: number, updateGameDto: UpdateGameDto): Promise<Game> {
    // Validate input
    const nameErrors = validateGameName(updateGameDto.name)
    if (nameErrors.length > 0) {
      throw new ValidationError(nameErrors[0])
    }

    if (updateGameDto.imageData) {
      const imageErrors = validateBase64Image(updateGameDto.imageData)
      if (imageErrors.length > 0) {
        throw new ValidationError(imageErrors[0])
      }
    }

    return await this.gameRepository.update(id, updateGameDto.name, updateGameDto.imageData)
  }

  async deleteGame(id: number): Promise<void> {
    await this.gameRepository.delete(id)
  }

  async searchGames(searchDto: GameSearchDto): Promise<Game[]> {
    if (searchDto.query) {
      return await this.gameRepository.search(searchDto.query)
    }

    if (searchDto.type) {
      return await this.gameRepository.findByType(searchDto.type)
    }

    if (searchDto.createdBy) {
      return await this.gameRepository.findByCreator(searchDto.createdBy)
    }

    return await this.gameRepository.findAll()
  }
}