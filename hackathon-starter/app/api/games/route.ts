import { NextResponse } from 'next/server'
import db, { Game } from '@/lib/db'
import { getSession } from '@/lib/session'

/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: Get all games
 *     description: Retrieve a list of all registered games
 *     tags:
 *       - Games
 *     responses:
 *       200:
 *         description: List of games retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 games:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Game'
 *                 total:
 *                   type: integer
 *                   description: Total number of games
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET() {
  try {
    const games = db.prepare(`
      SELECT g.*, u.username as creator_username 
      FROM games g 
      JOIN users u ON g.created_by = u.id 
      ORDER BY g.created_at DESC
    `).all() as (Game & { creator_username: string })[]
    
    return NextResponse.json({
      games,
      total: games.length
    })
  } catch (error) {
    console.error('Failed to fetch games:', error)
    return NextResponse.json({
      error: 'Failed to fetch games'
    }, { status: 500 })
  }
}

/**
 * @swagger
 * /api/games:
 *   post:
 *     summary: Create a new game
 *     description: Register a new game with name, type, and optional image
 *     tags:
 *       - Games
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
 *                 description: Game name
 *               type:
 *                 type: string
 *                 enum: [video, table, card]
 *                 description: Type of game
 *               image_url:
 *                 type: string
 *                 nullable: true
 *                 description: URL to game image (optional)
 *             required:
 *               - name
 *               - type
 *     responses:
 *       201:
 *         description: Game created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 game:
 *                   $ref: '#/components/schemas/Game'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
export async function POST(request: Request) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated'
      }, { status: 401 })
    }

    const { name, type, image_url } = await request.json()
    
    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({
        error: 'Game name is required'
      }, { status: 400 })
    }
    
    if (!type || !['video', 'table', 'card'].includes(type)) {
      return NextResponse.json({
        error: 'Valid game type (video, table, card) is required'
      }, { status: 400 })
    }

    // Create game
    const stmt = db.prepare(`
      INSERT INTO games (name, type, image_url, created_by)
      VALUES (?, ?, ?, ?)
    `)
    
    const result = stmt.run(
      name.trim(),
      type,
      image_url || null,
      user.id
    )
    
    // Get created game
    const game = db.prepare(`
      SELECT g.*, u.username as creator_username
      FROM games g
      JOIN users u ON g.created_by = u.id
      WHERE g.id = ?
    `).get(result.lastInsertRowid) as Game & { creator_username: string }
    
    return NextResponse.json({
      message: 'Game created successfully',
      game
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create game:', error)
    return NextResponse.json({
      error: 'Failed to create game'
    }, { status: 500 })
  }
}