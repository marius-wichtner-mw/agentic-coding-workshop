import { NextResponse } from 'next/server'
import { destroySession } from '@/lib/session'

export async function POST() {
  try {
    await destroySession()
    
    return NextResponse.json({
      message: 'Logout successful'
    })
  } catch {
    return NextResponse.json({
      error: 'Logout failed'
    }, { status: 500 })
  }
}