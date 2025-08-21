import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/src/modules/users/application/services/UserService'
import { PrismaUserRepository } from '@/src/modules/users/infrastructure/repositories/PrismaUserRepository'
import { CreateUserDto } from '@/src/modules/users/application/dtos/UserDtos'
import { AppError } from '@/src/shared/errors/AppError'
import { ApiResponse } from '@/src/shared/types/common'

// Initialize dependencies
const userRepository = new PrismaUserRepository()
const userService = new UserService(userRepository)

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const users = await userService.getAllUsers()
    
    return NextResponse.json({
      success: true,
      data: users.map(user => user.toJSON()),
      message: 'Users retrieved successfully'
    })
  } catch (error) {
    console.error('Error getting users:', error)
    
    if (error instanceof AppError) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: error.statusCode })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json()
    const createUserDto: CreateUserDto = {
      username: body.username
    }

    const user = await userService.createUser(createUserDto)
    
    return NextResponse.json({
      success: true,
      data: user.toJSON(),
      message: 'User created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    
    if (error instanceof AppError) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: error.statusCode })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}