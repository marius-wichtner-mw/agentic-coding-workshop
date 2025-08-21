import { NextRequest, NextResponse } from 'next/server'
import { ScoreboardService } from '@/src/modules/scoreboard/application/services/ScoreboardService'
import { PrismaScoreboardRepository } from '@/src/modules/scoreboard/infrastructure/repositories/PrismaScoreboardRepository'
import { prisma } from '@/src/shared/database/prisma'
import { AppError } from '@/src/shared/errors/AppError'

const scoreboardRepository = new PrismaScoreboardRepository(prisma)
const scoreboardService = new ScoreboardService(scoreboardRepository)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const gameId = searchParams.get('gameId')
    const userId = searchParams.get('userId')
    const sortBy = searchParams.get('sortBy') as 'winRate' | 'wins' | null
    const limit = searchParams.get('limit')

    let data

    switch (type) {
      case 'leaderboard':
        data = await scoreboardService.getLeaderboard()
        break
      
      case 'player-profile':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'User ID is required for player profile' },
            { status: 400 }
          )
        }
        data = await scoreboardService.getPlayerProfile(parseInt(userId))
        break
      
      case 'game-leaderboard':
        if (!gameId) {
          return NextResponse.json(
            { success: false, error: 'Game ID is required for game leaderboard' },
            { status: 400 }
          )
        }
        data = await scoreboardService.getGameLeaderboard(parseInt(gameId))
        break
      
      case 'top-players':
        const limitNum = limit ? parseInt(limit) : 10
        data = await scoreboardService.getTopPlayers(sortBy || 'winRate', limitNum)
        break
      
      case 'game-stats':
        const gameIdNum = gameId ? parseInt(gameId) : undefined
        data = await scoreboardService.getGameStats(gameIdNum)
        break
      
      default:
        data = await scoreboardService.getScoreboard()
        break
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error fetching scoreboard data:', error)
    
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