import { NextResponse } from 'next/server'
import db, { PlayerStats } from '@/lib/db'

/**
 * @swagger
 * /api/scoreboards:
 *   get:
 *     summary: Get global player scoreboard
 *     description: Returns overall player rankings and statistics across all games
 *     tags: [Scoreboards]
 *     responses:
 *       200:
 *         description: Global scoreboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GlobalScoreboard'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export async function GET() {
  try {
    // Get overall player statistics across all games
    const playersQuery = `
      SELECT 
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
      GROUP BY u.id, u.username
      ORDER BY wins DESC, win_rate DESC, avg_score DESC
    `

    const players = db.prepare(playersQuery).all() as PlayerStats[]

    // Calculate streaks for each player across all games
    const playersWithStreaks: PlayerStats[] = players.map(player => {
      // Get recent results for streak calculation
      const recentResults = db.prepare(`
        SELECT winner_id, timestamp
        FROM game_results 
        WHERE player1_id = ? OR player2_id = ?
        ORDER BY timestamp DESC
        LIMIT 50
      `).all(player.player_id, player.player_id) as { winner_id: number; timestamp: string }[]

      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0
      let isWinning = true

      // Calculate current streak
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

      // Calculate longest winning streak
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

    // Get game breakdown for additional context
    const gameBreakdown = db.prepare(`
      SELECT 
        g.id,
        g.name,
        g.type,
        COUNT(*) as total_games,
        COUNT(DISTINCT CASE WHEN gr.player1_id IS NOT NULL THEN gr.player1_id END) +
        COUNT(DISTINCT CASE WHEN gr.player2_id IS NOT NULL THEN gr.player2_id END) as unique_players
      FROM games g
      LEFT JOIN game_results gr ON g.id = gr.game_id
      GROUP BY g.id, g.name, g.type
      ORDER BY total_games DESC
    `).all()

    const response = {
      players: playersWithStreaks,
      summary: {
        total_players: playersWithStreaks.length,
        total_games_played: playersWithStreaks.reduce((sum, p) => sum + p.games_played, 0),
        games_available: gameBreakdown
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching global scoreboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}