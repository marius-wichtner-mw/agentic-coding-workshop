import { NextResponse } from 'next/server'

// Mock data - replace with real database in production
const mockUsers = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'user' }
]

export async function GET() {
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return NextResponse.json({
    users: mockUsers,
    total: mockUsers.length
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  
  const newUser = {
    id: mockUsers.length + 1,
    ...body,
    role: body.role || 'user'
  }
  
  return NextResponse.json({
    message: 'User created successfully',
    user: newUser
  }, { status: 201 })
}