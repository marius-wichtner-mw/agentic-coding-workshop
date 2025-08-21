import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const user = await getSession()
    
    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated'
      }, { status: 401 })
    }
    
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({
      error: 'Failed to get user session'
    }, { status: 500 })
  }
}