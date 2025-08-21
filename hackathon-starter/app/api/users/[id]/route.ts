import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/src/modules/users/application/services/UserService'
import { PrismaUserRepository } from '@/src/modules/users/infrastructure/repositories/PrismaUserRepository'
import { UpdateUserDto } from '@/src/modules/users/application/dtos/UserDtos'
import { AppError } from '@/src/shared/errors/AppError'
import { ApiResponse } from '@/src/shared/types/common'

// Initialize dependencies
const userRepository = new PrismaUserRepository()
const userService = new UserService(userRepository)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid user ID'
      }, { status: 400 })
    }

    const user = await userService.getUserById(id)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: user.toJSON(),
      message: 'User retrieved successfully'
    })
  } catch (error) {
    console.error('Error getting user:', error)
    
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid user ID'
      }, { status: 400 })
    }

    const body = await request.json()
    const updateUserDto: UpdateUserDto = {
      username: body.username
    }

    const user = await userService.updateUser(id, updateUserDto)
    
    return NextResponse.json({
      success: true,
      data: user.toJSON(),
      message: 'User updated successfully'
    })
  } catch (error) {
    console.error('Error updating user:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid user ID'
      }, { status: 400 })
    }

    await userService.deleteUser(id)
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    
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