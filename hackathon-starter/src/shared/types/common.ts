export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type GameType = 'video_game' | 'table_game' | 'card_game'

export interface CreateUserRequest {
  username: string
}

export interface UpdateUserRequest {
  username: string
}

export interface CreateGameRequest {
  name: string
  type: GameType
  imageData?: string
}

export interface SubmitResultRequest {
  gameId: number
  players: number[]
  scores: Record<string, number>
  winnerId?: number
}