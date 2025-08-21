import { NextResponse } from 'next/server'
import db, { User } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)
    
    if (isNaN(userId)) {
      return NextResponse.json({
        error: 'Invalid user ID'
      }, { status: 400 })
    }
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User
    
    if (!user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({
      error: 'Failed to fetch user'
    }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)
    
    if (isNaN(userId)) {
      return NextResponse.json({
        error: 'Invalid user ID'
      }, { status: 400 })
    }
    
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
    
    // Check if user exists
    const existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User
    if (!existingUser) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }
    
    try {
      const stmt = db.prepare('UPDATE users SET username = ? WHERE id = ?')
      stmt.run(trimmedUsername, userId)
      
      const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User
      
      return NextResponse.json({
        message: 'Username updated successfully',
        user: updatedUser
      })
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
      error: 'Failed to update username'
    }, { status: 500 })
  }
}