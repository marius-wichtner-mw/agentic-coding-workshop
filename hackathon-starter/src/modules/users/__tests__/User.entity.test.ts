import { ValidationError } from '@/src/shared/errors/AppError'
import { User } from '../domain/entities/User'

describe('User Entity', () => {
  describe('constructor', () => {
    it('should create a user with valid data', () => {
      const userData = {
        id: 1,
        username: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const user = new User(userData)

      expect(user.id).toBe(1)
      expect(user.username).toBe('testuser')
      expect(user.createdAt).toEqual(userData.createdAt)
      expect(user.updatedAt).toEqual(userData.updatedAt)
    })

    it('should throw ValidationError for invalid username', () => {
      const userData = {
        id: 1,
        username: 'ab', // too short
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(() => new User(userData)).toThrow(ValidationError)
      expect(() => new User(userData)).toThrow('Username must be at least 3 characters long')
    })

    it('should throw ValidationError for empty username', () => {
      const userData = {
        id: 1,
        username: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(() => new User(userData)).toThrow(ValidationError)
      expect(() => new User(userData)).toThrow('Username is required')
    })

    it('should throw ValidationError for username with invalid characters', () => {
      const userData = {
        id: 1,
        username: 'test@user',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(() => new User(userData)).toThrow(ValidationError)
      expect(() => new User(userData)).toThrow('Username can only contain letters, numbers, underscores, and hyphens')
    })
  })

  describe('updateUsername', () => {
    it('should update username with valid value', () => {
      const user = new User({
        id: 1,
        username: 'olduser',
        createdAt: new Date(),
        updatedAt: new Date()
      })

      user.updateUsername('newuser')

      expect(user.username).toBe('newuser')
    })

    it('should throw ValidationError for invalid new username', () => {
      const user = new User({
        id: 1,
        username: 'validuser',
        createdAt: new Date(),
        updatedAt: new Date()
      })

      expect(() => user.updateUsername('ab')).toThrow(ValidationError)
    })
  })

  describe('toJSON', () => {
    it('should return user data as plain object', () => {
      const userData = {
        id: 1,
        username: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const user = new User(userData)
      const json = user.toJSON()

      expect(json).toEqual(userData)
    })
  })
})