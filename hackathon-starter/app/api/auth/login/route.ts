import { NextResponse } from 'next/server'
import db, { User } from '@/lib/db'
import { createSession } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const { username } = await request.json()
    
    if (!username || typeof username !== 'string') {
      return NextResponse.json({
        error: 'Username is required'
      }, { status: 400 })
    }
    
    // Find user by username
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User
    
    if (!user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }
    
    // Create session
    await createSession(user.id)
    
    return NextResponse.json({
      message: 'Login successful',
      user
    })
  } catch {
    return NextResponse.json({
      error: 'Login failed'
    }, { status: 500 })
  }
}