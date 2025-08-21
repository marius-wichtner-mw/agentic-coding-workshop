import { validateGameName, validateGameType, validateBase64Image } from '@/src/shared/utils/validation'
import { ValidationError } from '@/src/shared/errors/AppError'
import { GameType } from '@/src/shared/types/common'

export interface GameData {
  id: number
  name: string
  type: GameType
  imageData?: string
  createdBy: number
  createdAt: Date
}

export class Game {
  public readonly id: number
  public name: string
  public readonly type: GameType
  public imageData?: string
  public readonly createdBy: number
  public readonly createdAt: Date

  constructor(data: GameData) {
    this.validateGame(data.name, data.type, data.imageData)
    
    this.id = data.id
    this.name = data.name
    this.type = data.type
    this.imageData = data.imageData
    this.createdBy = data.createdBy
    this.createdAt = data.createdAt
  }

  public updateName(newName: string): void {
    this.validateGameName(newName)
    this.name = newName
  }

  public updateImage(newImageData?: string): void {
    if (newImageData) {
      this.validateImage(newImageData)
    }
    this.imageData = newImageData
  }

  public toJSON(): GameData {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      imageData: this.imageData,
      createdBy: this.createdBy,
      createdAt: this.createdAt
    }
  }

  private validateGame(name: string, type: GameType, imageData?: string): void {
    this.validateGameName(name)
    this.validateGameType(type)
    if (imageData) {
      this.validateImage(imageData)
    }
  }

  private validateGameName(name: string): void {
    const errors = validateGameName(name)
    if (errors.length > 0) {
      throw new ValidationError(errors[0])
    }
  }

  private validateGameType(type: GameType): void {
    const errors = validateGameType(type)
    if (errors.length > 0) {
      throw new ValidationError(errors[0])
    }
  }

  private validateImage(imageData: string): void {
    const errors = validateBase64Image(imageData)
    if (errors.length > 0) {
      throw new ValidationError(errors[0])
    }
  }
}