import { IUserRepository } from '../../domain/repositories/IUserRepository'
import { User } from '../../domain/entities/User'
import { prisma } from '@/src/shared/database/prisma'
import { ConflictError, NotFoundError } from '@/src/shared/errors/AppError'

export class PrismaUserRepository implements IUserRepository {
  async create(username: string): Promise<User> {
    try {
      const userData = await prisma.user.create({
        data: { username },
      })

      return new User({
        id: userData.id,
        username: userData.username,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      })
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictError('Username already exists')
      }
      throw error
    }
  }

  async findById(id: number): Promise<User | null> {
    const userData = await prisma.user.findUnique({
      where: { id },
    })

    if (!userData) {
      return null
    }

    return new User({
      id: userData.id,
      username: userData.username,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    })
  }

  async findByUsername(username: string): Promise<User | null> {
    const userData = await prisma.user.findUnique({
      where: { username },
    })

    if (!userData) {
      return null
    }

    return new User({
      id: userData.id,
      username: userData.username,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    })
  }

  async update(id: number, username: string): Promise<User> {
    try {
      const userData = await prisma.user.update({
        where: { id },
        data: { username },
      })

      return new User({
        id: userData.id,
        username: userData.username,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      })
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error) {
        if (error.code === 'P2025') {
          throw new NotFoundError('User')
        }
        if (error.code === 'P2002') {
          throw new ConflictError('Username already exists')
        }
      }
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id },
      })
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        throw new NotFoundError('User')
      }
      throw error
    }
  }

  async findAll(): Promise<User[]> {
    const usersData = await prisma.user.findMany()

    return usersData.map(userData => new User({
      id: userData.id,
      username: userData.username,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    }))
  }
}