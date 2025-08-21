import { prisma } from '@/src/shared/database/prisma'
import { ConflictError, NotFoundError } from '@/src/shared/errors/AppError'
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository'

// Mock Prisma
jest.mock('@/src/shared/database/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository

  beforeEach(() => {
    repository = new PrismaUserRepository()
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create a new user', async () => {
      const mockUserData = {
        id: 1,
        username: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.create.mockResolvedValue(mockUserData)

      const user = await repository.create('testuser')

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { username: 'testuser' },
      })
      expect(user.username).toBe('testuser')
      expect(user.id).toBe(1)
    })

    it('should throw ConflictError for duplicate username', async () => {
      const prismaError = new Error('Unique constraint failed')
      ;(prismaError as any).code = 'P2002'
      mockPrisma.user.create.mockRejectedValue(prismaError)

      await expect(repository.create('testuser')).rejects.toThrow(ConflictError)
      await expect(repository.create('testuser')).rejects.toThrow('Username already exists')
    })
  })

  describe('findById', () => {
    it('should return user when found', async () => {
      const mockUserData = {
        id: 1,
        username: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUserData)

      const user = await repository.findById(1)

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      })
      expect(user).not.toBeNull()
      expect(user?.username).toBe('testuser')
    })

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const user = await repository.findById(999)

      expect(user).toBeNull()
    })
  })

  describe('findByUsername', () => {
    it('should return user when found', async () => {
      const mockUserData = {
        id: 1,
        username: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUserData)

      const user = await repository.findByUsername('testuser')

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      })
      expect(user).not.toBeNull()
      expect(user?.username).toBe('testuser')
    })

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const user = await repository.findByUsername('nonexistent')

      expect(user).toBeNull()
    })
  })

  describe('update', () => {
    it('should update user', async () => {
      const mockUserData = {
        id: 1,
        username: 'newuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.update.mockResolvedValue(mockUserData)

      const user = await repository.update(1, 'newuser')

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { username: 'newuser' },
      })
      expect(user.username).toBe('newuser')
    })

    it('should throw NotFoundError when user not found', async () => {
      const prismaError = new Error('Record not found')
      ;(prismaError as any).code = 'P2025'
      mockPrisma.user.update.mockRejectedValue(prismaError)

      await expect(repository.update(999, 'newuser')).rejects.toThrow(NotFoundError)
    })

    it('should throw ConflictError for duplicate username', async () => {
      const prismaError = new Error('Unique constraint failed')
      ;(prismaError as any).code = 'P2002'
      mockPrisma.user.update.mockRejectedValue(prismaError)

      await expect(repository.update(1, 'existinguser')).rejects.toThrow(ConflictError)
    })
  })

  describe('delete', () => {
    it('should delete user', async () => {
      const mockUserData = {
        id: 1,
        username: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.delete.mockResolvedValue(mockUserData)

      await repository.delete(1)

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      })
    })

    it('should throw NotFoundError when user not found', async () => {
      const prismaError = new Error('Record not found')
      ;(prismaError as any).code = 'P2025'
      mockPrisma.user.delete.mockRejectedValue(prismaError)

      await expect(repository.delete(999)).rejects.toThrow(NotFoundError)
    })
  })

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsersData = [
        {
          id: 1,
          username: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          username: 'user2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrisma.user.findMany.mockResolvedValue(mockUsersData)

      const users = await repository.findAll()

      expect(mockPrisma.user.findMany).toHaveBeenCalled()
      expect(users).toHaveLength(2)
      expect(users[0].username).toBe('user1')
      expect(users[1].username).toBe('user2')
    })

    it('should return empty array when no users exist', async () => {
      mockPrisma.user.findMany.mockResolvedValue([])

      const users = await repository.findAll()

      expect(users).toHaveLength(0)
    })
  })
})