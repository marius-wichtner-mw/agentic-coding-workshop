export interface CreateUserDto {
  username: string
}

export interface UpdateUserDto {
  username: string
}

export interface UserResponseDto {
  id: number
  username: string
  createdAt: Date
  updatedAt: Date
}