import { NextResponse } from 'next/server'
import db, { GameSession } from '@/lib/db'
import { getSession } from '@/lib/session'

interface RouteParams {
  params: { id: string }
}

/**
 * @swagger
 * /api/games/{id}/sessions:
 *   post:
 *     summary: Start a new game session
 *     description: Create a new game session for the specified game
 *     tags:
 *       - Game Sessions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               player1_id:
 *                 type: integer
 *                 description: First player ID
 *               player2_id:
 *                 type: integer
 *                 description: Second player ID
 *               total_rounds:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Number of rounds to play
 *             required:
 *               - player1_id
 *               - player2_id
 *               - total_rounds
 *     responses:
 *       201:
 *         description: Game session created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to start this game
 *       404:
 *         description: Game not found
 *       500:
 *         description: Server error
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated'
      }, { status: 401 })
    }

    // Normalize and validate game id
    const { id } = await params
    const gameId = Number(id)
    if (!Number.isInteger(gameId) || gameId <= 0) {
      return NextResponse.json({ error: 'Invalid game id' }, { status: 400 })
    }

    // Check if game exists and user is creator
    const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId)
    if (!game) {
      return NextResponse.json({
        error: 'Game not found'
      }, { status: 404 })
    }

    if (game.created_by !== user.id) {
      return NextResponse.json({
        error: 'Only the game creator can start sessions'
      }, { status: 403 })
    }

    const body = await request.json()
    const player1_id = Number(body.player1_id)
    const player2_id = Number(body.player2_id)
    const total_rounds = Number(body.total_rounds)

    // Validate input
    if (!player1_id || !player2_id || !total_rounds) {
      return NextResponse.json({
        error: 'Player IDs and total rounds are required'
      }, { status: 400 })
    }

    if (player1_id === player2_id) {
      return NextResponse.json({
        error: 'Players must be different'
      }, { status: 400 })
    }

    if (total_rounds < 1 || total_rounds > 10) {
      return NextResponse.json({
        error: 'Total rounds must be between 1 and 10'
      }, { status: 400 })
    }

    // Verify players exist
    const player1 = db.prepare('SELECT id, username FROM users WHERE id = ?').get(player1_id)
    const player2 = db.prepare('SELECT id, username FROM users WHERE id = ?').get(player2_id)

    if (!player1 || !player2) {
      return NextResponse.json({
        error: 'One or both players not found'
      }, { status: 400 })
    }

    // Create game session
    const stmt = db.prepare(`
      INSERT INTO game_sessions (game_id, started_by, player1_id, player2_id, total_rounds, status)
      VALUES (?, ?, ?, ?, ?, 'setup')
    `)

    const result = stmt.run(gameId, user.id, player1_id, player2_id, total_rounds)

    // Get created session with details
    const session = db.prepare(`
      SELECT 
        gs.*,
        g.name as game_name,
        g.type as game_type,
        p1.username as player1_username,
        p2.username as player2_username
      FROM game_sessions gs
      JOIN games g ON gs.game_id = g.id
      JOIN users p1 ON gs.player1_id = p1.id
      JOIN users p2 ON gs.player2_id = p2.id
      WHERE gs.id = ?
    `).get(result.lastInsertRowid)

    return NextResponse.json({
      message: 'Game session created successfully',
      session
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create game session:', error)
    return NextResponse.json({
      error: 'Failed to create game session'
    }, { status: 500 })
  }
}

/**
 * @swagger
 * /api/games/{id}/sessions:
 *   get:
 *     summary: Get game sessions
 *     description: Get all sessions for a specific game
 *     tags:
 *       - Game Sessions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Game sessions retrieved successfully
 *       404:
 *         description: Game not found
 *       500:
 *         description: Server error
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const gameId = Number(id)
    if (!Number.isInteger(gameId) || gameId <= 0) {
      return NextResponse.json({ error: 'Invalid game id' }, { status: 400 })
    }
    const sessions = db.prepare(`
      SELECT 
        gs.*,
        g.name as game_name,
        g.type as game_type,
        p1.username as player1_username,
        p2.username as player2_username,
        u.username as started_by_username
      FROM game_sessions gs
      JOIN games g ON gs.game_id = g.id
      JOIN users p1 ON gs.player1_id = p1.id
      JOIN users p2 ON gs.player2_id = p2.id
      JOIN users u ON gs.started_by = u.id
      WHERE gs.game_id = ?
      ORDER BY gs.created_at DESC
    `).all(gameId)

    return NextResponse.json({
      sessions
    })
  } catch (error) {
    console.error('Failed to fetch game sessions:', error)
    return NextResponse.json({
      error: 'Failed to fetch game sessions'
    }, { status: 500 })
  }
}