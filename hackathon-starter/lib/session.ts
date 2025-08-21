import { cookies } from 'next/headers'
import db, { User } from './db'

const SESSION_COOKIE_NAME = 'game-tracker-session'
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function createSession(userId: number): Promise<string> {
  const sessionId = generateSessionId()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)
  
  // Store session in database
  db.prepare(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `).run()
  
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .run(sessionId, userId, expiresAt.toISOString())
  
  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/'
  })
  
  return sessionId
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (!sessionId) {
    return null
  }
  
  try {
    const session = db.prepare(`
      SELECT s.*, u.* FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ? AND s.expires_at > datetime('now')
    `).get(sessionId) as { user_id: number; username: string; created_at: string } | undefined
    
    if (!session) {
      return null
    }
    
    return {
      id: session.user_id,
      username: session.username,
      created_at: session.created_at
    }
  } catch {
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (sessionId) {
    // Remove from database
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId)
  }
  
  // Clear cookie
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function cleanupExpiredSessions(): Promise<void> {
  db.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')").run()
}

function generateSessionId(): string {
  return Array.from({ length: 32 }, () => 
    Math.random().toString(36).charAt(2)
  ).join('')
}