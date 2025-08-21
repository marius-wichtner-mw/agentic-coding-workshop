import { NextResponse } from 'next/server'
import db, { User } from '@/lib/db'

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all registered users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *                   description: Total number of users
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET() {
  try {
    const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as User[]
    
    return NextResponse.json({
      users,
      total: users.length
    })
  } catch {
    return NextResponse.json({
      error: 'Failed to fetch users'
    }, { status: 500 })
  }
}

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Register a new user with a unique username
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 20
 *                 pattern: '^[a-zA-Z0-9_-]+$'
 *                 description: Username (3-20 characters, alphanumeric, underscores, hyphens)
 *             required:
 *               - username
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Username already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: Request) {
  try {
    const { username } = await request.json()
    
    // Validate username
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json({
        error: 'Username is required'
      }, { status: 400 })
    }
    
    const trimmedUsername = username.trim()
    
    // Additional username validation
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return NextResponse.json({
        error: 'Username must be between 3 and 20 characters'
      }, { status: 400 })
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      return NextResponse.json({
        error: 'Username can only contain letters, numbers, underscores, and hyphens'
      }, { status: 400 })
    }
    
    try {
      const stmt = db.prepare('INSERT INTO users (username) VALUES (?)')
      const result = stmt.run(trimmedUsername)
      
      const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as User
      
      return NextResponse.json({
        message: 'User created successfully',
        user: newUser
      }, { status: 201 })
    } catch (dbError: unknown) {
      if (dbError && typeof dbError === 'object' && 'code' in dbError && dbError.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return NextResponse.json({
          error: 'Username already exists'
        }, { status: 409 })
      }
      throw dbError
    }
  } catch {
    return NextResponse.json({
      error: 'Failed to create user'
    }, { status: 500 })
  }
}