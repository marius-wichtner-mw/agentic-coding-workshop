import { NextResponse } from 'next/server'
import { UserModel } from '../../../lib/db/models/user.model'
import { connect, disconnect } from '../../../lib/db/utils/connection'

export async function GET() {
  try {
    await connect()

    const users = await UserModel.find({}).sort({ createdAt: -1 })

    return NextResponse.json({
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
      total: users.length
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  } finally {
    await disconnect()
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username } = body

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json(
        { error: 'Username is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    await connect()

    // Check if username already exists
    const existingUser = await UserModel.findOne({ username: username.trim() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }

    const newUser = await UserModel.create({
      username: username.trim()
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  } finally {
    await disconnect()
  }
}