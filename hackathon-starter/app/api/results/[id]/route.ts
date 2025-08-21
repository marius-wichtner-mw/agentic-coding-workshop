import { NextRequest, NextResponse } from 'next/server'
import { GameResultService } from '@/src/modules/results/application/services/GameResultService'
import { PrismaGameResultRepository } from '@/src/modules/results/infrastructure/repositories/PrismaGameResultRepository'
import { PrismaUserRepository } from '@/src/modules/users/infrastructure/repositories/PrismaUserRepository'
import { PrismaGameRepository } from '@/src/modules/games/infrastructure/repositories/PrismaGameRepository'
import { prisma } from '@/src/shared/database/prisma'
import { AppError } from '@/src/shared/errors/AppError'
import { UpdateGameResultDto } from '@/src/modules/results/application/dtos/GameResultDtos'

const gameResultRepository = new PrismaGameResultRepository(prisma)
const userRepository = new PrismaUserRepository()
const gameRepository = new PrismaGameRepository()
const gameResultService = new GameResultService(gameResultRepository, userRepository, gameRepository)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid game result ID' },
        { status: 400 }
      )
    }

    const result = await gameResultService.getGameResultById(id)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error fetching game result:', error)
    
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid game result ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    const updateDto: UpdateGameResultDto = {
      players: body.players,
      playedAt: body.playedAt ? new Date(body.playedAt) : undefined,
      notes: body.notes
    }

    // Validate players if provided
    if (updateDto.players) {
      if (!Array.isArray(updateDto.players) || updateDto.players.length < 2) {
        return NextResponse.json(
          { success: false, error: 'At least 2 players are required' },
          { status: 400 }
        )
      }

      for (const player of updateDto.players) {
        if (!player.userId || typeof player.score !== 'number' || typeof player.isWinner !== 'boolean') {
          return NextResponse.json(
            { success: false, error: 'Each player must have userId, score, and isWinner fields' },
            { status: 400 }
          )
        }
      }
    }

    const result = await gameResultService.updateGameResult(id, updateDto)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error updating game result:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid game result ID' },
        { status: 400 }
      )
    }

    await gameResultService.deleteGameResult(id)

    return NextResponse.json({
      success: true,
      message: 'Game result deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting game result:', error)
    
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