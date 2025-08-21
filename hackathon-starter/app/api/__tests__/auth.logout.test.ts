/**
 * @jest-environment node
 */
import { POST } from '../auth/logout/route'

const destroySessionMock = jest.fn()
jest.mock('@/lib/session', () => ({
  __esModule: true,
  destroySession: (...args: unknown[]) => destroySessionMock(...args),
}))

describe('/api/auth/logout', () => {
  beforeEach(() => {
    destroySessionMock.mockReset()
  })

  it('destroys the session and returns success', async () => {
    destroySessionMock.mockResolvedValue(undefined)
    const response = await POST()
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.message).toMatch(/Logout successful/)
    expect(destroySessionMock).toHaveBeenCalled()
  })

  it('returns 500 if destroy fails', async () => {
    destroySessionMock.mockRejectedValue(new Error('fail'))
    const response = await POST()
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.error).toMatch(/Logout failed/)
  })
})

