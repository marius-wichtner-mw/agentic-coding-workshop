import { NextRequest, NextResponse } from 'next/server'
import { GameService } from '@/src/modules/games/application/services/GameService'
import { PrismaGameRepository } from '@/src/modules/games/infrastructure/repositories/PrismaGameRepository'
import { UpdateGameDto } from '@/src/modules/games/application/dtos/GameDtos'
import { AppError } from '@/src/shared/errors/AppError'
import { ApiResponse } from '@/src/shared/types/common'

// Initialize dependencies
const gameRepository = new PrismaGameRepository()
const gameService = new GameService(gameRepository)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid game ID'
      }, { status: 400 })
    }

    const game = await gameService.getGameById(id)
    
    if (!game) {
      return NextResponse.json({
        success: false,
        error: 'Game not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: game.toJSON(),
      message: 'Game retrieved successfully'
    })
  } catch (error) {
    console.error('Error getting game:', error)
    
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
        error: 'Invalid game ID'
      }, { status: 400 })
    }

    const body = await request.json()
    const updateGameDto: UpdateGameDto = {
      name: body.name,
      imageData: body.imageData
    }

    const game = await gameService.updateGame(id, updateGameDto)
    
    return NextResponse.json({
      success: true,
      data: game.toJSON(),
      message: 'Game updated successfully'
    })
  } catch (error) {
    console.error('Error updating game:', error)
    
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
        error: 'Invalid game ID'
      }, { status: 400 })
    }

    await gameService.deleteGame(id)
    
    return NextResponse.json({
      success: true,
      message: 'Game deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting game:', error)
    
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