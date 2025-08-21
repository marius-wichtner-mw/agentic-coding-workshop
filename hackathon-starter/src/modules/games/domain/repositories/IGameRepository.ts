import { Game } from '../entities/Game'
import { GameType } from '@/src/shared/types/common'

export interface IGameRepository {
  create(name: string, type: GameType, createdBy: number, imageData?: string): Promise<Game>
  findById(id: number): Promise<Game | null>
  findByName(name: string): Promise<Game | null>
  findAll(): Promise<Game[]>
  findByType(type: GameType): Promise<Game[]>
  findByCreator(createdBy: number): Promise<Game[]>
  update(id: number, name: string, imageData?: string): Promise<Game>
  delete(id: number): Promise<void>
  search(query: string): Promise<Game[]>
}