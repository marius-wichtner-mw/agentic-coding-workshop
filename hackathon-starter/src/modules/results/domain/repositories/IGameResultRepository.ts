import { GameResult, PlayerResult } from '../entities/GameResult'

export interface CreateGameResultData {
  gameId: number
  players: PlayerResult[]
  playedAt: Date
  notes?: string
}

export interface UpdateGameResultData {
  players?: PlayerResult[]
  playedAt?: Date
  notes?: string
}

export interface IGameResultRepository {
  create(gameResult: CreateGameResultData): Promise<GameResult>
  findById(id: number): Promise<GameResult | null>
  findAll(): Promise<GameResult[]>
  findByGameId(gameId: number): Promise<GameResult[]>
  findByUserId(userId: number): Promise<GameResult[]>
  update(id: number, gameResult: UpdateGameResultData): Promise<GameResult>
  delete(id: number): Promise<void>
  findRecentResults(limit?: number): Promise<GameResult[]>
}