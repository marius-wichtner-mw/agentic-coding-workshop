import { NextResponse } from 'next/server'
import db, { User } from '@/lib/db'

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