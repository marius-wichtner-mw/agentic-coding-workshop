import { IUserRepository } from '../domain/repositories/IUserRepository'
import { User } from '../domain/entities/User'
import { ValidationError, ConflictError, NotFoundError } from '@/src/shared/errors/AppError'
import { UserService } from '../application/services/UserService'

// Mock repository
class MockUserRepository implements IUserRepository {
  private users: User[] = []
  private nextId = 1

  async create(username: string): Promise<User> {
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

describe('UserService', () => {
  let userService: UserService
  let mockRepository: IUserRepository

  beforeEach(() => {
    mockRepository = new MockUserRepository()
    userService = new UserService(mockRepository)
  })

  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      const createUserDto = { username: 'testuser' }
      
      const user = await userService.createUser(createUserDto)

      expect(user.username).toBe('testuser')
      expect(user.id).toBeDefined()
    })

    it('should throw ValidationError for invalid username', async () => {
      const createUserDto = { username: 'ab' } // too short

      await expect(userService.createUser(createUserDto)).rejects.toThrow(ValidationError)
    })

    it('should throw ConflictError for duplicate username', async () => {
      const createUserDto = { username: 'testuser' }
      
      await userService.createUser(createUserDto)
      
      await expect(userService.createUser(createUserDto)).rejects.toThrow(ConflictError)
    })
  })

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const createdUser = await userService.createUser({ username: 'testuser' })
      
      const foundUser = await userService.getUserById(createdUser.id)

      expect(foundUser).not.toBeNull()
      expect(foundUser?.username).toBe('testuser')
    })

    it('should return null when user not found', async () => {
      const foundUser = await userService.getUserById(999)

      expect(foundUser).toBeNull()
    })
  })

  describe('getUserByUsername', () => {
    it('should return user when found', async () => {
      await userService.createUser({ username: 'testuser' })
      
      const foundUser = await userService.getUserByUsername('testuser')

      expect(foundUser).not.toBeNull()
      expect(foundUser?.username).toBe('testuser')
    })

    it('should return null when user not found', async () => {
      const foundUser = await userService.getUserByUsername('nonexistent')

      expect(foundUser).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('should update user with valid data', async () => {
      const user = await userService.createUser({ username: 'olduser' })
      const updateUserDto = { username: 'newuser' }
      
      const updatedUser = await userService.updateUser(user.id, updateUserDto)

      expect(updatedUser.username).toBe('newuser')
    })

    it('should throw ValidationError for invalid username', async () => {
      const user = await userService.createUser({ username: 'validuser' })
      const updateUserDto = { username: 'ab' } // too short

      await expect(userService.updateUser(user.id, updateUserDto)).rejects.toThrow(ValidationError)
    })

    it('should throw NotFoundError for non-existent user', async () => {
      const updateUserDto = { username: 'newuser' }

      await expect(userService.updateUser(999, updateUserDto)).rejects.toThrow(NotFoundError)
    })

    it('should throw ConflictError for duplicate username', async () => {
      const user1 = await userService.createUser({ username: 'user1' })
      await userService.createUser({ username: 'user2' })
      const updateUserDto = { username: 'user2' }

      await expect(userService.updateUser(user1.id, updateUserDto)).rejects.toThrow(ConflictError)
    })
  })

  describe('deleteUser', () => {
    it('should delete existing user', async () => {
      const user = await userService.createUser({ username: 'testuser' })
      
      await userService.deleteUser(user.id)
      
      const foundUser = await userService.getUserById(user.id)
      expect(foundUser).toBeNull()
    })

    it('should throw NotFoundError for non-existent user', async () => {
      await expect(userService.deleteUser(999)).rejects.toThrow(NotFoundError)
    })
  })

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      await userService.createUser({ username: 'user1' })
      await userService.createUser({ username: 'user2' })

      const users = await userService.getAllUsers()

      expect(users).toHaveLength(2)
      expect(users.map((u: User) => u.username)).toContain('user1')
      expect(users.map((u: User) => u.username)).toContain('user2')
    })

    it('should return empty array when no users exist', async () => {
      const users = await userService.getAllUsers()

      expect(users).toHaveLength(0)
    })
  })
})