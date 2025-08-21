import { GameType } from '@/src/shared/types/common'

export interface CreateGameDto {
  name: string
  type: GameType
  createdBy: number
  imageData?: string
}

export interface UpdateGameDto {
  name: string
  imageData?: string
}

export interface GameResponseDto {
  id: number
  name: string
  type: GameType
  imageData?: string
  createdBy: number
  createdAt: Date
}

export interface GameSearchDto {
  query?: string
  type?: GameType
  createdBy?: number
}