import { User } from '../domain/entities/User'
import { ConflictError, NotFoundError } from '@/src/shared/errors/AppError'
import { IUserRepository } from '../domain/repositories/IUserRepository'

// Mock implementation for testing
class MockUserRepository implements IUserRepository {
  private users: User[] = []
  private nextId = 1

  async create(username: string): Promise<User> {
    // Check for existing username
    const existing = this.users.find(u => u.username === username)
    if (existing) {
      throw new ConflictError('Username already exists')
    }

    const userData = {
      id: this.nextId++,
      username,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const user = new User(userData)
    this.users.push(user)
    return user
  }

  async findById(id: number): Promise<User | null> {
    return this.users.find(u => u.id === id) || null
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.users.find(u => u.username === username) || null
  }

  async update(id: number, username: string): Promise<User> {
    const user = this.users.find(u => u.id === id)
    if (!user) {
      throw new NotFoundError('User')
    }

    // Check if new username is already taken by another user
    const existing = this.users.find(u => u.username === username && u.id !== id)
    if (existing) {
      throw new ConflictError('Username already exists')
    }

    user.updateUsername(username)
    return user
  }

  async delete(id: number): Promise<void> {
    const index = this.users.findIndex(u => u.id === id)
    if (index === -1) {
      throw new NotFoundError('User')
    }
    this.users.splice(index, 1)
  }

  async findAll(): Promise<User[]> {
    return [...this.users]
  }
}

describe('UserRepository Interface', () => {
  let repository: IUserRepository

  beforeEach(() => {
    repository = new MockUserRepository()
  })

  describe('create', () => {
    it('should create a new user with valid username', async () => {
      const user = await repository.create('testuser')

      expect(user.username).toBe('testuser')
      expect(user.id).toBeDefined()
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })

    it('should throw ConflictError for duplicate username', async () => {
      await repository.create('testuser')

      await expect(repository.create('testuser')).rejects.toThrow(ConflictError)
      await expect(repository.create('testuser')).rejects.toThrow('Username already exists')
    })
  })

  describe('findById', () => {
    it('should return user when found', async () => {
      const createdUser = await repository.create('testuser')
      const foundUser = await repository.findById(createdUser.id)

      expect(foundUser).not.toBeNull()
      expect(foundUser?.username).toBe('testuser')
    })

    it('should return null when user not found', async () => {
      const foundUser = await repository.findById(999)

      expect(foundUser).toBeNull()
    })
  })

  describe('findByUsername', () => {
    it('should return user when found', async () => {
      await repository.create('testuser')
      const foundUser = await repository.findByUsername('testuser')

      expect(foundUser).not.toBeNull()
      expect(foundUser?.username).toBe('testuser')
    })

    it('should return null when user not found', async () => {
      const foundUser = await repository.findByUsername('nonexistent')

      expect(foundUser).toBeNull()
    })
  })

  describe('update', () => {
    it('should update user username', async () => {
      const user = await repository.create('olduser')
      const updatedUser = await repository.update(user.id, 'newuser')

      expect(updatedUser.username).toBe('newuser')
    })

    it('should throw NotFoundError for non-existent user', async () => {
      await expect(repository.update(999, 'newuser')).rejects.toThrow(NotFoundError)
    })

    it('should throw ConflictError for duplicate username', async () => {
      const user1 = await repository.create('user1')
      await repository.create('user2')

      await expect(repository.update(user1.id, 'user2')).rejects.toThrow(ConflictError)
    })
  })

  describe('delete', () => {
    it('should delete existing user', async () => {
      const user = await repository.create('testuser')
      
      await repository.delete(user.id)
      
      const foundUser = await repository.findById(user.id)
      expect(foundUser).toBeNull()
    })

    it('should throw NotFoundError for non-existent user', async () => {
      await expect(repository.delete(999)).rejects.toThrow(NotFoundError)
    })
  })

  describe('findAll', () => {
    it('should return all users', async () => {
      await repository.create('user1')
      await repository.create('user2')

      const users = await repository.findAll()

      expect(users).toHaveLength(2)
      expect(users.map((u: User) => u.username)).toContain('user1')
      expect(users.map((u: User) => u.username)).toContain('user2')
    })

    it('should return empty array when no users exist', async () => {
      const users = await repository.findAll()

      expect(users).toHaveLength(0)
    })
  })
})