/**
 * @jest-environment node
 */
import { GET } from '../auth/me/route'

const getSessionMock = jest.fn()
jest.mock('@/lib/session', () => ({
  __esModule: true,
  getSession: (...args: unknown[]) => getSessionMock(...args),
}))

describe('/api/auth/me', () => {
  beforeEach(() => {
    getSessionMock.mockReset()
  })

  it('returns 401 when not authenticated', async () => {
    getSessionMock.mockResolvedValue(null)
    const response = await GET()
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toMatch(/Not authenticated/)
  })

  it('returns user when session exists', async () => {
    const user = { id: 1, username: 'alice', created_at: '2024-01-01T00:00:00Z' }
    getSessionMock.mockResolvedValue(user)
    const response = await GET()
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.user).toEqual(user)
  })

  it('returns 500 on unexpected error', async () => {
    getSessionMock.mockRejectedValue(new Error('oops'))
    const response = await GET()
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.error).toMatch(/Failed to get user session/)
  })
})

