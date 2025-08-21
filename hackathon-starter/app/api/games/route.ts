import { NextRequest, NextResponse } from 'next/server'
import { GameService } from '@/src/modules/games/application/services/GameService'
import { PrismaGameRepository } from '@/src/modules/games/infrastructure/repositories/PrismaGameRepository'
import { CreateGameDto } from '@/src/modules/games/application/dtos/GameDtos'
import { AppError } from '@/src/shared/errors/AppError'
import { ApiResponse, GameType } from '@/src/shared/types/common'

// Initialize dependencies
const gameRepository = new PrismaGameRepository()
const gameService = new GameService(gameRepository)

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const createdBy = searchParams.get('createdBy')
    const query = searchParams.get('query')

    let games
    if (query) {
      games = await gameService.searchGames({ query })
    } else if (type) {
      games = await gameService.getGamesByType(type as GameType)
    } else if (createdBy) {
      games = await gameService.getGamesByCreator(parseInt(createdBy))
    } else {
      games = await gameService.getAllGames()
    }
    
    return NextResponse.json({
      success: true,
      data: games.map(game => game.toJSON()),
      message: 'Games retrieved successfully'
    })
  } catch (error) {
    console.error('Error getting games:', error)
    
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
    const createGameDto: CreateGameDto = {
      name: body.name,
      type: body.type,
      createdBy: body.createdBy,
      imageData: body.imageData
    }

    const game = await gameService.createGame(createGameDto)
    
    return NextResponse.json({
      success: true,
      data: game.toJSON(),
      message: 'Game created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating game:', error)
    
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