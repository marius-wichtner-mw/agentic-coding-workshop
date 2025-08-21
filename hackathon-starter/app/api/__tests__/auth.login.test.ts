/**
 * @jest-environment node
 */
import { POST } from '../auth/login/route'

jest.mock('@/lib/db', () => {
  return {
    __esModule: true,
    default: {
      prepare: jest.fn(() => ({
        get: jest.fn((username: string) => {
          if (username === 'alice') {
            return { id: 1, username: 'alice', created_at: '2024-01-01T00:00:00Z' }
          }
          return undefined
        }),
      })),
    },
  }
})

const createSessionMock = jest.fn()
jest.mock('@/lib/session', () => ({
  __esModule: true,
  createSession: (...args: unknown[]) => createSessionMock(...args),
}))

describe('/api/auth/login', () => {
  beforeEach(() => {
    createSessionMock.mockReset()
  })

  it('returns 400 when username is missing', async () => {
    const request = { json: async () => ({}) } as unknown as Request
    const response = await POST(request)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toMatch(/Username is required/)
  })

  it('returns 404 when user not found', async () => {
    const request = { json: async () => ({ username: 'unknown' }) } as unknown as Request
    const response = await POST(request)
    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toMatch(/User not found/)
  })

  it('creates a session and returns the user on success', async () => {
    createSessionMock.mockResolvedValue('session123')
    const request = { json: async () => ({ username: 'alice' }) } as unknown as Request
    const response = await POST(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(createSessionMock).toHaveBeenCalledWith(1)
    expect(body.user).toEqual({ id: 1, username: 'alice', created_at: '2024-01-01T00:00:00Z' })
  })

  it('returns 500 on unexpected error', async () => {
    const badRequest = { json: async () => { throw new Error('boom') } } as unknown as Request
    const response = await POST(badRequest)
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.error).toMatch(/Login failed/)
  })
})

