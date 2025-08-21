import { NextResponse } from 'next/server'
import db, { GameSession } from '@/lib/db'
import { getSession } from '@/lib/session'

interface RouteParams {
  params: { id: string }
}

/**
 * @swagger
 * /api/sessions/{id}/results:
 *   post:
 *     summary: Submit game results
 *     description: Submit results for a game session
 *     tags:
 *       - Game Sessions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               player1_score:
 *                 type: integer
 *                 minimum: 0
 *                 description: Player 1 score
 *               player2_score:
 *                 type: integer
 *                 minimum: 0
 *                 description: Player 2 score
 *               notes:
 *                 type: string
 *                 description: Optional notes about the game
 *             required:
 *               - player1_score
 *               - player2_score
 *     responses:
 *       201:
 *         description: Results submitted successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to submit results
 *       404:
 *         description: Session not found
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

    // Get session and verify authorization
    const { id } = await params
    const sessionId = Number(id)
    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      return NextResponse.json({ error: 'Invalid session id' }, { status: 400 })
    }
    const session = db.prepare('SELECT * FROM game_sessions WHERE id = ?').get(sessionId) as GameSession | undefined
    
    if (!session) {
      return NextResponse.json({
        error: 'Session not found'
      }, { status: 404 })
    }

    if (session.started_by !== user.id) {
      return NextResponse.json({
        error: 'Only the session creator can submit results'
      }, { status: 403 })
    }

    if (session.status !== 'in_progress') {
      return NextResponse.json({
        error: 'Can only submit results for active sessions'
      }, { status: 400 })
    }

    const body = await request.json()
    const player1_score = Number(body.player1_score)
    const player2_score = Number(body.player2_score)
    const notes = body.notes

    // Validate scores
    if (typeof player1_score !== 'number' || typeof player2_score !== 'number') {
      return NextResponse.json({
        error: 'Scores must be numbers'
      }, { status: 400 })
    }

    if (player1_score < 0 || player2_score < 0) {
      return NextResponse.json({
        error: 'Scores cannot be negative'
      }, { status: 400 })
    }

    // Determine winner
    let winner_id: number
    if (player1_score > player2_score) {
      winner_id = session.player1_id
    } else if (player2_score > player1_score) {
      winner_id = session.player2_id
    } else {
      // It's a tie - for now, we'll set player1 as winner (or you could handle ties differently)
      winner_id = session.player1_id
    }

    // Insert result
    const stmt = db.prepare(`
      INSERT INTO game_results (
        session_id, game_id, player1_id, player2_id, 
        player1_score, player2_score, winner_id, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      session.id,
      session.game_id,
      session.player1_id,
      session.player2_id,
      player1_score,
      player2_score,
      winner_id,
      notes || null
    )

    // Update session round count
    const newCurrentRound = session.current_round + 1
    const newStatus = newCurrentRound >= session.total_rounds ? 'completed' : 'in_progress'
    
    db.prepare(`
      UPDATE game_sessions 
      SET current_round = ?, status = ?, completed_at = ?
      WHERE id = ?
    `).run(
      newCurrentRound,
      newStatus,
      newStatus === 'completed' ? new Date().toISOString() : null,
      session.id
    )

    // Get created result with details
    const createdResult = db.prepare(`
      SELECT 
        gr.*,
        p1.username as player1_username,
        p2.username as player2_username,
        w.username as winner_username
      FROM game_results gr
      JOIN users p1 ON gr.player1_id = p1.id
      JOIN users p2 ON gr.player2_id = p2.id
      JOIN users w ON gr.winner_id = w.id
      WHERE gr.id = ?
    `).get(result.lastInsertRowid)

    return NextResponse.json({
      message: 'Results submitted successfully',
      result: createdResult,
      session_completed: newStatus === 'completed'
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to submit results:', error)
    return NextResponse.json({
      error: 'Failed to submit results'
    }, { status: 500 })
  }
}