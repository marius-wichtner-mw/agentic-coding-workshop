import { NextRequest, NextResponse } from 'next/server'
import db, { PlayerStats, GameScoreboard } from '@/lib/db'

/**
 * @swagger
 * /api/games/{id}/scoreboard:
 *   get:
 *     summary: Get scoreboard for a specific game
 *     description: Returns player rankings and statistics for a specific game
 *     tags: [Scoreboards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The game ID
 *     responses:
 *       200:
 *         description: Game scoreboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameScoreboard'
 *       400:
 *         description: Invalid game ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Game not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const gameId = parseInt(id)
    
    if (isNaN(gameId)) {
      return NextResponse.json(
        { error: 'Invalid game ID' },
        { status: 400 }
      )
    }

    // Check if game exists
    const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId)
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    // Get all players who have played this game
    const playersQuery = `
      SELECT DISTINCT 
        u.id as player_id,
        u.username,
        COUNT(*) as games_played,
        SUM(CASE WHEN gr.winner_id = u.id THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN gr.winner_id != u.id THEN 1 ELSE 0 END) as losses,
        ROUND(
          CAST(SUM(CASE WHEN gr.winner_id = u.id THEN 1 ELSE 0 END) AS FLOAT) / 
          CAST(COUNT(*) AS FLOAT) * 100, 2
        ) as win_rate,
        SUM(
          CASE 
            WHEN gr.player1_id = u.id THEN gr.player1_score
            WHEN gr.player2_id = u.id THEN gr.player2_score
            ELSE 0
          END
        ) as total_score,
        ROUND(
          CAST(SUM(
            CASE 
              WHEN gr.player1_id = u.id THEN gr.player1_score
              WHEN gr.player2_id = u.id THEN gr.player2_score
              ELSE 0
            END
          ) AS FLOAT) / CAST(COUNT(*) AS FLOAT), 2
        ) as avg_score
      FROM users u
      JOIN game_results gr ON (gr.player1_id = u.id OR gr.player2_id = u.id)
      WHERE gr.game_id = ?
      GROUP BY u.id, u.username
      ORDER BY wins DESC, win_rate DESC, avg_score DESC
    `

    const players = db.prepare(playersQuery).all(gameId) as PlayerStats[]

    // Calculate streaks for each player
    const playersWithStreaks: PlayerStats[] = players.map(player => {
      // Get recent results for streak calculation
      const recentResults = db.prepare(`
        SELECT winner_id, timestamp
        FROM game_results 
        WHERE game_id = ? AND (player1_id = ? OR player2_id = ?)
        ORDER BY timestamp DESC
        LIMIT 50
      `).all(gameId, player.player_id, player.player_id) as { winner_id: number; timestamp: string }[]

      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0
      let isWinning = true

      for (const result of recentResults) {
        const isWin = result.winner_id === player.player_id
        
        if (currentStreak === 0) {
          // First result sets the streak type
          currentStreak = 1
          isWinning = isWin
        } else if (isWin === isWinning) {
          // Continue streak
          currentStreak++
        } else {
          // Streak broken
          break
        }
      }

      // Calculate longest streak (wins only)
      for (const result of recentResults) {
        const isWin = result.winner_id === player.player_id
        if (isWin) {
          tempStreak++
          longestStreak = Math.max(longestStreak, tempStreak)
        } else {
          tempStreak = 0
        }
      }

      // If current streak is losses, make it negative
      if (!isWinning) {
        currentStreak = -currentStreak
      }

      return {
        ...player,
        current_streak: currentStreak,
        longest_streak: longestStreak
      }
    })

    const scoreboard: GameScoreboard = {
      game_id: gameId,
      game_name: game.name,
      players: playersWithStreaks
    }

    return NextResponse.json(scoreboard)

  } catch (error) {
    console.error('Error fetching game scoreboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}