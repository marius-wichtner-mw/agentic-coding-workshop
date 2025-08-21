import { NextRequest, NextResponse } from 'next/server'
import { GameResultService } from '@/src/modules/results/application/services/GameResultService'
import { PrismaGameResultRepository } from '@/src/modules/results/infrastructure/repositories/PrismaGameResultRepository'
import { PrismaUserRepository } from '@/src/modules/users/infrastructure/repositories/PrismaUserRepository'
import { PrismaGameRepository } from '@/src/modules/games/infrastructure/repositories/PrismaGameRepository'
import { prisma } from '@/src/shared/database/prisma'
import { AppError } from '@/src/shared/errors/AppError'
import { CreateGameResultDto } from '@/src/modules/results/application/dtos/GameResultDtos'

const gameResultRepository = new PrismaGameResultRepository(prisma)
const userRepository = new PrismaUserRepository()
const gameRepository = new PrismaGameRepository()
const gameResultService = new GameResultService(gameResultRepository, userRepository, gameRepository)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')
    const userId = searchParams.get('userId')
    const recent = searchParams.get('recent')
    const limit = searchParams.get('limit')

    let results

    if (gameId) {
      results = await gameResultService.getGameResultsByGameId(parseInt(gameId))
    } else if (userId) {
      results = await gameResultService.getGameResultsByUserId(parseInt(userId))
    } else if (recent === 'true') {
      const limitNum = limit ? parseInt(limit) : 10
      results = await gameResultService.getRecentGameResults(limitNum)
    } else {
      results = await gameResultService.getAllGameResults()
    }

    return NextResponse.json({
      success: true,
      data: results
    })
  } catch (error) {
    console.error('Error fetching game results:', error)
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.gameId || !body.players || !Array.isArray(body.players)) {
      return NextResponse.json(
        { success: false, error: 'Game ID and players array are required' },
        { status: 400 }
      )
    }

    if (body.players.length < 2) {
      return NextResponse.json(
        { success: false, error: 'At least 2 players are required' },
        { status: 400 }
      )
    }

    // Validate each player
    for (const player of body.players) {
      if (!player.userId || typeof player.score !== 'number' || typeof player.isWinner !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'Each player must have userId, score, and isWinner fields' },
          { status: 400 }
        )
      }
    }

    const createDto: CreateGameResultDto = {
      gameId: parseInt(body.gameId),
      players: body.players,
      playedAt: body.playedAt ? new Date(body.playedAt) : new Date(),
      notes: body.notes
    }

    const result = await gameResultService.createGameResult(createDto)

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating game result:', error)
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}