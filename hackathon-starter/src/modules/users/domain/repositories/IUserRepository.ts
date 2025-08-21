import { User } from '../entities/User'

export interface IUserRepository {
  create(username: string): Promise<User>
  findById(id: number): Promise<User | null>
  findByUsername(username: string): Promise<User | null>
  update(id: number, username: string): Promise<User>
  delete(id: number): Promise<void>
  findAll(): Promise<User[]>
}