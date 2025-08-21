import { IUserRepository } from '../../domain/repositories/IUserRepository'
import { User } from '../../domain/entities/User'
import { CreateUserDto, UpdateUserDto } from '../dtos/UserDtos'
import { validateUsername } from '@/src/shared/utils/validation'
import { ValidationError } from '@/src/shared/errors/AppError'

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Validate input
    const errors = validateUsername(createUserDto.username)
    if (errors.length > 0) {
      throw new ValidationError(errors[0])
    }

    return await this.userRepository.create(createUserDto.username)
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.findById(id)
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findByUsername(username)
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Validate input
    const errors = validateUsername(updateUserDto.username)
    if (errors.length > 0) {
      throw new ValidationError(errors[0])
    }

    return await this.userRepository.update(id, updateUserDto.username)
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id)
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll()
  }
}