import { validateUsername } from '@/src/shared/utils/validation'
import { ValidationError } from '@/src/shared/errors/AppError'

export interface UserData {
  id: number
  username: string
  createdAt: Date
  updatedAt: Date
}

export class User {
  public readonly id: number
  public username: string
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(data: UserData) {
    this.validateUsername(data.username)
    
    this.id = data.id
    this.username = data.username
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  public updateUsername(newUsername: string): void {
    this.validateUsername(newUsername)
    this.username = newUsername
  }

  public toJSON(): UserData {
    return {
      id: this.id,
      username: this.username,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  private validateUsername(username: string): void {
    const errors = validateUsername(username)
    if (errors.length > 0) {
      throw new ValidationError(errors[0])
    }
  }
}