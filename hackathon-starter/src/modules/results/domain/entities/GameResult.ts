import { AppError } from '@/src/shared/errors/AppError'

export interface PlayerResult {
  userId: number
  score: number
  isWinner: boolean
}

export class GameResult {
  constructor(
    public readonly id: number,
    public readonly gameId: number,
    public readonly players: PlayerResult[],
    public readonly playedAt: Date,
    public readonly notes?: string
  ) {
    this.validate()
  }

  private validate(): void {
    if (this.id <= 0) {
      throw new AppError('Game result ID must be positive', 400)
    }

    if (this.gameId <= 0) {
      throw new AppError('Game ID must be positive', 400)
    }

    if (!this.players || this.players.length < 2) {
      throw new AppError('Game result must have at least 2 players', 400)
    }

    if (this.players.length > 10) {
      throw new AppError('Game result cannot have more than 10 players', 400)
    }

    // Validate each player
    const userIds = new Set<number>()
    let winnerCount = 0

    for (const player of this.players) {
      if (player.userId <= 0) {
        throw new AppError('Player user ID must be positive', 400)
      }

      if (userIds.has(player.userId)) {
        throw new AppError('Duplicate player in game result', 400)
      }
      userIds.add(player.userId)

      if (typeof player.score !== 'number') {
        throw new AppError('Player score must be a number', 400)
      }

      if (player.isWinner) {
        winnerCount++
      }
    }

    if (winnerCount === 0) {
      throw new AppError('Game result must have at least one winner', 400)
    }

    if (!this.playedAt || !(this.playedAt instanceof Date)) {
      throw new AppError('Played at date is required', 400)
    }

    if (this.playedAt > new Date()) {
      throw new AppError('Played at date cannot be in the future', 400)
    }

    if (this.notes && this.notes.length > 500) {
      throw new AppError('Notes cannot exceed 500 characters', 400)
    }
  }

  public getWinners(): PlayerResult[] {
    return this.players.filter(player => player.isWinner)
  }

  public getPlayerScore(userId: number): number | null {
    const player = this.players.find(p => p.userId === userId)
    return player ? player.score : null
  }

  public hasPlayer(userId: number): boolean {
    return this.players.some(p => p.userId === userId)
  }

  public static create(
    gameId: number,
    players: PlayerResult[],
    playedAt: Date,
    notes?: string
  ): { gameId: number; players: PlayerResult[]; playedAt: Date; notes?: string } {
    // Validate without creating a full GameResult instance
    if (gameId <= 0) {
      throw new AppError('Game ID must be positive', 400)
    }

    if (!players || players.length < 2) {
      throw new AppError('Game result must have at least 2 players', 400)
    }

    if (players.length > 10) {
      throw new AppError('Game result cannot have more than 10 players', 400)
    }

    // Validate each player
    const userIds = new Set<number>()
    let winnerCount = 0

    for (const player of players) {
      if (player.userId <= 0) {
        throw new AppError('Player user ID must be positive', 400)
      }

      if (userIds.has(player.userId)) {
        throw new AppError('Duplicate player in game result', 400)
      }
      userIds.add(player.userId)

      if (typeof player.score !== 'number') {
        throw new AppError('Player score must be a number', 400)
      }

      if (player.isWinner) {
        winnerCount++
      }
    }

    if (winnerCount === 0) {
      throw new AppError('Game result must have at least one winner', 400)
    }

    if (!playedAt || !(playedAt instanceof Date)) {
      throw new AppError('Played at date is required', 400)
    }

    if (playedAt > new Date()) {
      throw new AppError('Played at date cannot be in the future', 400)
    }

    if (notes && notes.length > 500) {
      throw new AppError('Notes cannot exceed 500 characters', 400)
    }
    
    return {
      gameId,
      players,
      playedAt,
      notes
    }
  }
}