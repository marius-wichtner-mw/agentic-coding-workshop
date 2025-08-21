import { GameResult, PlayerResult } from '../domain/entities/GameResult'
import { AppError } from '@/src/shared/errors/AppError'

describe('GameResult Entity', () => {
  const validPlayers: PlayerResult[] = [
    { userId: 1, score: 100, isWinner: true },
    { userId: 2, score: 80, isWinner: false }
  ]

  const validPlayedAt = new Date('2024-01-01T10:00:00Z')

  describe('constructor', () => {
    it('should create a valid GameResult', () => {
      const gameResult = new GameResult(1, 10, validPlayers, validPlayedAt, 'Great game!')

      expect(gameResult.id).toBe(1)
      expect(gameResult.gameId).toBe(10)
      expect(gameResult.players).toEqual(validPlayers)
      expect(gameResult.playedAt).toEqual(validPlayedAt)
      expect(gameResult.notes).toBe('Great game!')
    })

    it('should throw error for invalid ID', () => {
      expect(() => {
        new GameResult(0, 10, validPlayers, validPlayedAt)
      }).toThrow(AppError)
    })

    it('should throw error for invalid game ID', () => {
      expect(() => {
        new GameResult(1, 0, validPlayers, validPlayedAt)
      }).toThrow(AppError)
    })

    it('should throw error for less than 2 players', () => {
      expect(() => {
        new GameResult(1, 10, [validPlayers[0]], validPlayedAt)
      }).toThrow(AppError)
    })

    it('should throw error for more than 10 players', () => {
      const tooManyPlayers = Array.from({ length: 11 }, (_, i) => ({
        userId: i + 1,
        score: 100,
        isWinner: i === 0
      }))

      expect(() => {
        new GameResult(1, 10, tooManyPlayers, validPlayedAt)
      }).toThrow(AppError)
    })

    it('should throw error for duplicate players', () => {
      const duplicatePlayers: PlayerResult[] = [
        { userId: 1, score: 100, isWinner: true },
        { userId: 1, score: 80, isWinner: false }
      ]

      expect(() => {
        new GameResult(1, 10, duplicatePlayers, validPlayedAt)
      }).toThrow(AppError)
    })

    it('should throw error for no winners', () => {
      const noWinners: PlayerResult[] = [
        { userId: 1, score: 100, isWinner: false },
        { userId: 2, score: 80, isWinner: false }
      ]

      expect(() => {
        new GameResult(1, 10, noWinners, validPlayedAt)
      }).toThrow(AppError)
    })

    it('should throw error for future date', () => {
      const futureDate = new Date(Date.now() + 86400000) // Tomorrow

      expect(() => {
        new GameResult(1, 10, validPlayers, futureDate)
      }).toThrow(AppError)
    })

    it('should throw error for notes too long', () => {
      const longNotes = 'a'.repeat(501)

      expect(() => {
        new GameResult(1, 10, validPlayers, validPlayedAt, longNotes)
      }).toThrow(AppError)
    })
  })

  describe('methods', () => {
    let gameResult: GameResult

    beforeEach(() => {
      const players: PlayerResult[] = [
        { userId: 1, score: 100, isWinner: true },
        { userId: 2, score: 80, isWinner: false },
        { userId: 3, score: 90, isWinner: true }
      ]
      gameResult = new GameResult(1, 10, players, validPlayedAt)
    })

    it('should return winners', () => {
      const winners = gameResult.getWinners()
      expect(winners).toHaveLength(2)
      expect(winners[0].userId).toBe(1)
      expect(winners[1].userId).toBe(3)
    })

    it('should return player score', () => {
      expect(gameResult.getPlayerScore(1)).toBe(100)
      expect(gameResult.getPlayerScore(2)).toBe(80)
      expect(gameResult.getPlayerScore(999)).toBeNull()
    })

    it('should check if player exists', () => {
      expect(gameResult.hasPlayer(1)).toBe(true)
      expect(gameResult.hasPlayer(999)).toBe(false)
    })
  })

  describe('create static method', () => {
    it('should create valid game result data', () => {
      const data = GameResult.create(10, validPlayers, validPlayedAt, 'Test notes')

      expect(data.gameId).toBe(10)
      expect(data.players).toEqual(validPlayers)
      expect(data.playedAt).toEqual(validPlayedAt)
      expect(data.notes).toBe('Test notes')
    })

    it('should validate data during creation', () => {
      expect(() => {
        GameResult.create(0, validPlayers, validPlayedAt)
      }).toThrow(AppError)
    })
  })
})