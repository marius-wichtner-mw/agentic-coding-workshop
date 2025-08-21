import { NextRequest } from 'next/server'
import { GET as getUsersGET, POST as createUserPOST } from '@/app/api/users/route'
import { GET as getUserGET, PUT as updateUserPUT, DELETE as deleteUserDELETE } from '@/app/api/users/[id]/route'

// Mock the database
jest.mock('@/src/shared/database/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

describe('Users API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const { prisma } = require('@/src/shared/database/prisma')
      prisma.user.findMany.mockResolvedValue([
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
      ])

      const response = await getUsersGET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0].username).toBe('user1')
      expect(data.data[1].username).toBe('user2')
    })

    it('should return empty array when no users exist', async () => {
      const { prisma } = require('@/src/shared/database/prisma')
      prisma.user.findMany.mockResolvedValue([])

      const response = await getUsersGET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(0)
    })
  })

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const { prisma } = require('@/src/shared/database/prisma')
      const mockUser = {
        id: 1,
        username: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      prisma.user.create.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({ username: 'testuser' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await createUserPOST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.username).toBe('testuser')
      expect(data.message).toBe('User created successfully')
    })

    it('should return validation error for invalid username', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({ username: 'ab' }), // too short
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await createUserPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Username must be at least 3 characters long')
    })

    it('should return conflict error for duplicate username', async () => {
      const { prisma } = require('@/src/shared/database/prisma')
      const prismaError = new Error('Unique constraint failed')
      ;(prismaError as any).code = 'P2002'
      prisma.user.create.mockRejectedValue(prismaError)

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({ username: 'existinguser' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await createUserPOST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Username already exists')
    })
  })

  describe('GET /api/users/[id]', () => {
    it('should return user by id', async () => {
      const { prisma } = require('@/src/shared/database/prisma')
      const mockUser = {
        id: 1,
        username: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      prisma.user.findUnique.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/users/1')
      const response = await getUserGET(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.username).toBe('testuser')
    })

    it('should return 404 for non-existent user', async () => {
      const { prisma } = require('@/src/shared/database/prisma')
      prisma.user.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/users/999')
      const response = await getUserGET(request, { params: { id: '999' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('User not found')
    })

    it('should return 400 for invalid id', async () => {
      const request = new NextRequest('http://localhost:3000/api/users/invalid')
      const response = await getUserGET(request, { params: { id: 'invalid' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid user ID')
    })
  })

  describe('PUT /api/users/[id]', () => {
    it('should update user', async () => {
      const { prisma } = require('@/src/shared/database/prisma')
      const mockUser = {
        id: 1,
        username: 'updateduser',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      prisma.user.update.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/users/1', {
        method: 'PUT',
        body: JSON.stringify({ username: 'updateduser' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await updateUserPUT(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.username).toBe('updateduser')
      expect(data.message).toBe('User updated successfully')
    })
  })

  describe('DELETE /api/users/[id]', () => {
    it('should delete user', async () => {
      const { prisma } = require('@/src/shared/database/prisma')
      prisma.user.delete.mockResolvedValue({
        id: 1,
        username: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/users/1')
      const response = await deleteUserDELETE(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('User deleted successfully')
    })
  })
})