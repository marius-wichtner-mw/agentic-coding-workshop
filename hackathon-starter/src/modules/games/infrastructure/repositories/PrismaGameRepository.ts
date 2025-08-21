import { IGameRepository } from '../../domain/repositories/IGameRepository'
import { Game } from '../../domain/entities/Game'
import { prisma } from '@/src/shared/database/prisma'
import { ConflictError, NotFoundError } from '@/src/shared/errors/AppError'
import { GameType } from '@/src/shared/types/common'

export class PrismaGameRepository implements IGameRepository {
  async create(name: string, type: GameType, createdBy: number, imageData?: string): Promise<Game> {
    try {
      const gameData = await prisma.game.create({
        data: {
          name,
          type,
          createdBy,
          imageData,
        },
      })

      return new Game({
        id: gameData.id,
        name: gameData.name,
        type: gameData.type as GameType,
        imageData: gameData.imageData || undefined,
        createdBy: gameData.createdBy,
        createdAt: gameData.createdAt,
      })
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictError('Game name already exists')
      }
      throw error
    }
  }

  async findById(id: number): Promise<Game | null> {
    const gameData = await prisma.game.findUnique({
      where: { id },
    })

    if (!gameData) {
      return null
    }

    return new Game({
      id: gameData.id,
      name: gameData.name,
      type: gameData.type as GameType,
      imageData: gameData.imageData || undefined,
      createdBy: gameData.createdBy,
      createdAt: gameData.createdAt,
    })
  }

  async findByName(name: string): Promise<Game | null> {
    const gameData = await prisma.game.findFirst({
      where: { name },
    })

    if (!gameData) {
      return null
    }

    return new Game({
      id: gameData.id,
      name: gameData.name,
      type: gameData.type as GameType,
      imageData: gameData.imageData || undefined,
      createdBy: gameData.createdBy,
      createdAt: gameData.createdAt,
    })
  }

  async findAll(): Promise<Game[]> {
    const gamesData = await prisma.game.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return gamesData.map(gameData => new Game({
      id: gameData.id,
      name: gameData.name,
      type: gameData.type as GameType,
      imageData: gameData.imageData || undefined,
      createdBy: gameData.createdBy,
      createdAt: gameData.createdAt,
    }))
  }

  async findByType(type: GameType): Promise<Game[]> {
    const gamesData = await prisma.game.findMany({
      where: { type },
      orderBy: { createdAt: 'desc' },
    })

    return gamesData.map(gameData => new Game({
      id: gameData.id,
      name: gameData.name,
      type: gameData.type as GameType,
      imageData: gameData.imageData || undefined,
      createdBy: gameData.createdBy,
      createdAt: gameData.createdAt,
    }))
  }

  async findByCreator(createdBy: number): Promise<Game[]> {
    const gamesData = await prisma.game.findMany({
      where: { createdBy },
      orderBy: { createdAt: 'desc' },
    })

    return gamesData.map(gameData => new Game({
      id: gameData.id,
      name: gameData.name,
      type: gameData.type as GameType,
      imageData: gameData.imageData || undefined,
      createdBy: gameData.createdBy,
      createdAt: gameData.createdAt,
    }))
  }

  async update(id: number, name: string, imageData?: string): Promise<Game> {
    try {
      const gameData = await prisma.game.update({
        where: { id },
        data: { name, imageData },
      })

      return new Game({
        id: gameData.id,
        name: gameData.name,
        type: gameData.type as GameType,
        imageData: gameData.imageData || undefined,
        createdBy: gameData.createdBy,
        createdAt: gameData.createdAt,
      })
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error) {
        if (error.code === 'P2025') {
          throw new NotFoundError('Game')
        }
        if (error.code === 'P2002') {
          throw new ConflictError('Game name already exists')
        }
      }
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await prisma.game.delete({
        where: { id },
      })
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new NotFoundError('Game')
      }
      throw error
    }
  }

  async search(query: string): Promise<Game[]> {
    const gamesData = await prisma.game.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return gamesData.map(gameData => new Game({
      id: gameData.id,
      name: gameData.name,
      type: gameData.type as GameType,
      imageData: gameData.imageData || undefined,
      createdBy: gameData.createdBy,
      createdAt: gameData.createdAt,
    }))
  }
}