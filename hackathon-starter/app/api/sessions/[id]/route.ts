import { NextResponse } from 'next/server'
import db, { GameSession } from '@/lib/db'
import { getSession } from '@/lib/session'

interface RouteParams {
  params: { id: string }
}

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Get session details
 *     description: Get details of a specific game session
 *     tags:
 *       - Game Sessions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session details retrieved successfully
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = db.prepare(`
      SELECT 
        gs.*,
        g.name as game_name,
        g.type as game_type,
        g.image_url as game_image_url,
        p1.username as player1_username,
        p2.username as player2_username,
        u.username as started_by_username
      FROM game_sessions gs
      JOIN games g ON gs.game_id = g.id
      JOIN users p1 ON gs.player1_id = p1.id
      JOIN users p2 ON gs.player2_id = p2.id
      JOIN users u ON gs.started_by = u.id
      WHERE gs.id = ?
    `).get(id)

    if (!session) {
      return NextResponse.json({
        error: 'Session not found'
      }, { status: 404 })
    }

    // Get session results if any
    const results = db.prepare(`
      SELECT 
        gr.*,
        p1.username as player1_username,
        p2.username as player2_username,
        w.username as winner_username
      FROM game_results gr
      JOIN users p1 ON gr.player1_id = p1.id
      JOIN users p2 ON gr.player2_id = p2.id
      JOIN users w ON gr.winner_id = w.id
      WHERE gr.session_id = ?
      ORDER BY gr.timestamp ASC
    `).all(params.id)

    return NextResponse.json({
      session,
      results
    })
  } catch (error) {
    console.error('Failed to fetch session:', error)
    return NextResponse.json({
      error: 'Failed to fetch session'
    }, { status: 500 })
  }
}

/**
 * @swagger
 * /api/sessions/{id}:
 *   put:
 *     summary: Update session status
 *     description: Update session status (start, complete, cancel)
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
 *               status:
 *                 type: string
 *                 enum: [in_progress, completed, cancelled]
 *                 description: New session status
 *               current_round:
 *                 type: integer
 *                 description: Current round number (optional)
 *     responses:
 *       200:
 *         description: Session updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this session
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated'
      }, { status: 401 })
    }

    const { id } = await params
    // Get session and verify authorization
    const session = db.prepare('SELECT * FROM game_sessions WHERE id = ?').get(id) as GameSession | undefined
    
    if (!session) {
      return NextResponse.json({
        error: 'Session not found'
      }, { status: 404 })
    }

    if (session.started_by !== user.id) {
      return NextResponse.json({
        error: 'Only the session creator can update it'
      }, { status: 403 })
    }

    const { status, current_round } = await request.json()

    if (!status) {
      return NextResponse.json({
        error: 'Status is required'
      }, { status: 400 })
    }

    if (!['in_progress', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({
        error: 'Invalid status'
      }, { status: 400 })
    }

    // Update session
    const updateData: Record<string, unknown> = { status }
    
    if (current_round !== undefined) {
      updateData.current_round = current_round
    }
    
    // When starting a session, ensure current_round is set to 1
    if (status === 'in_progress' && current_round === undefined) {
      updateData.current_round = 1
    }

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ')
    const updateValues = Object.values(updateData)

    db.prepare(`UPDATE game_sessions SET ${updateFields} WHERE id = ?`)
      .run(...updateValues, id)

    // Get updated session
    const updatedSession = db.prepare(`
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
    `).get(id)

    return NextResponse.json({
      message: 'Session updated successfully',
      session: updatedSession
    })
  } catch (error) {
    console.error('Failed to update session:', error)
    return NextResponse.json({
      error: 'Failed to update session'
    }, { status: 500 })
  }
}