import { PlayerResult } from '../../domain/entities/GameResult'

export interface CreateGameResultDto {
  gameId: number
  players: PlayerResult[]
  playedAt: Date
  notes?: string
}

export interface UpdateGameResultDto {
  players?: PlayerResult[]
  playedAt?: Date
  notes?: string
}

export interface GameResultResponseDto {
  id: number
  gameId: number
  gameName?: string
  players: PlayerResultDto[]
  playedAt: string
  notes?: string
}

export interface PlayerResultDto {
  userId: number
  username?: string
  score: number
  isWinner: boolean
}

export interface GameResultListDto {
  id: number
  gameId: number
  gameName?: string
  playerCount: number
  winners: string[]
  playedAt: string
  notes?: string
}