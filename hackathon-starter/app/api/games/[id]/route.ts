import { NextResponse } from 'next/server'
import db, { Game } from '@/lib/db'
import { getSession } from '@/lib/session'

interface RouteParams {
  params: { id: string }
}

/**
 * @swagger
 * /api/games/{id}:
 *   get:
 *     summary: Get game by ID
 *     description: Retrieve details of a specific game
 *     tags:
 *       - Games
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Game details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       404:
 *         description: Game not found
 *       500:
 *         description: Server error
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const game = db.prepare(`
      SELECT g.*, u.username as creator_username
      FROM games g
      JOIN users u ON g.created_by = u.id
      WHERE g.id = ?
    `).get(id) as (Game & { creator_username: string }) | undefined
    
    if (!game) {
      return NextResponse.json({
        error: 'Game not found'
      }, { status: 404 })
    }
    
    return NextResponse.json(game)
  } catch (error) {
    console.error('Failed to fetch game:', error)
    return NextResponse.json({
      error: 'Failed to fetch game'
    }, { status: 500 })
  }
}

/**
 * @swagger
 * /api/games/{id}:
 *   put:
 *     summary: Update game
 *     description: Update an existing game's details
 *     tags:
 *       - Games
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
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               type:
 *                 type: string
 *                 enum: [video, table, card]
 *               image_url:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Game updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this game
 *       404:
 *         description: Game not found
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
    // Check if game exists and user is creator
    const existingGame = db.prepare('SELECT * FROM games WHERE id = ?')
      .get(id) as Game | undefined
    
    if (!existingGame) {
      return NextResponse.json({
        error: 'Game not found'
      }, { status: 404 })
    }
    
    if (existingGame.created_by !== user.id) {
      return NextResponse.json({
        error: 'Not authorized to update this game'
      }, { status: 403 })
    }

    const { name, type, image_url } = await request.json()
    
    // Validate fields
    if (name && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json({
        error: 'Invalid game name'
      }, { status: 400 })
    }
    
    if (type && !['video', 'table', 'card'].includes(type)) {
      return NextResponse.json({
        error: 'Invalid game type'
      }, { status: 400 })
    }

    // Update game
    const stmt = db.prepare(`
      UPDATE games 
      SET 
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        image_url = COALESCE(?, image_url)
      WHERE id = ?
    `)
    
    stmt.run(
      name?.trim() || null,
      type || null,
      image_url || null,
      id
    )
    
    // Get updated game
    const updatedGame = db.prepare(`
      SELECT g.*, u.username as creator_username
      FROM games g
      JOIN users u ON g.created_by = u.id
      WHERE g.id = ?
    `).get(id) as Game & { creator_username: string }
    
    return NextResponse.json({
      message: 'Game updated successfully',
      game: updatedGame
    })
  } catch (error) {
    console.error('Failed to update game:', error)
    return NextResponse.json({
      error: 'Failed to update game'
    }, { status: 500 })
  }
}

/**
 * @swagger
 * /api/games/{id}:
 *   delete:
 *     summary: Delete game
 *     description: Delete an existing game (creator only)
 *     tags:
 *       - Games
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Game deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this game
 *       404:
 *         description: Game not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated'
      }, { status: 401 })
    }

    const { id } = await params
    // Check if game exists and user is creator
    const game = db.prepare('SELECT * FROM games WHERE id = ?')
      .get(id) as Game | undefined
    
    if (!game) {
      return NextResponse.json({
        error: 'Game not found'
      }, { status: 404 })
    }
    
    if (game.created_by !== user.id) {
      return NextResponse.json({
        error: 'Not authorized to delete this game'
      }, { status: 403 })
    }

    // Delete game
    db.prepare('DELETE FROM games WHERE id = ?').run(id)
    
    return NextResponse.json({
      message: 'Game deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete game:', error)
    return NextResponse.json({
      error: 'Failed to delete game'
    }, { status: 500 })
  }
}