/**
 * @jest-environment node
 */
import { GET, POST } from '../users/route'

const prepareMock = jest.fn()

jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    prepare: (...args: unknown[]) => prepareMock(...args),
  },
}))

describe('/api/users', () => {
  beforeEach(() => {
    prepareMock.mockReset()
  })

  describe('GET', () => {
    it('returns a list of users', async () => {
      const allMock = jest.fn(() => [
        { id: 2, username: 'bob', created_at: '2024-01-02T00:00:00Z' },
        { id: 1, username: 'alice', created_at: '2024-01-01T00:00:00Z' },
      ])
      prepareMock.mockReturnValueOnce({ all: allMock })

      const res = await GET()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.users).toHaveLength(2)
      expect(body.total).toBe(2)
      expect(prepareMock).toHaveBeenCalledWith('SELECT * FROM users ORDER BY created_at DESC')
    })

    it('returns 500 on failure', async () => {
      prepareMock.mockImplementation(() => { throw new Error('db fail') })
      const res = await GET()
      expect(res.status).toBe(500)
      const body = await res.json()
      expect(body.error).toMatch(/Failed to fetch users/)
    })
  })

  describe('POST', () => {
    it('validates username presence', async () => {
      const request = { json: async () => ({}) } as unknown as Request
      const res = await POST(request)
      expect(res.status).toBe(400)
      expect((await res.json()).error).toMatch(/Username is required/)
    })

    it('validates username length', async () => {
      const request = { json: async () => ({ username: 'ab' }) } as unknown as Request
      const res = await POST(request)
      expect(res.status).toBe(400)
      expect((await res.json()).error).toMatch(/between 3 and 20/)
    })

    it('validates username characters', async () => {
      const request = { json: async () => ({ username: 'invalid name' }) } as unknown as Request
      const res = await POST(request)
      expect(res.status).toBe(400)
      expect((await res.json()).error).toMatch(/letters, numbers, underscores, and hyphens/)
    })

    it('creates a new user and returns 201', async () => {
      const runMock = jest.fn(() => ({ lastInsertRowid: 10 }))
      const getMock = jest.fn(() => ({ id: 10, username: 'new_user', created_at: '2024-01-10T00:00:00Z' }))

      // First prepare for INSERT, then SELECT by id
      prepareMock
        .mockReturnValueOnce({ run: runMock })
        .mockReturnValueOnce({ get: getMock })

      const request = { json: async () => ({ username: 'new_user' }) } as unknown as Request
      const res = await POST(request)
      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.user.id).toBe(10)
      expect(runMock).toHaveBeenCalledWith('new_user')
      expect(getMock).toHaveBeenCalled()
    })

    it('returns 409 on unique constraint violation', async () => {
      const error = { code: 'SQLITE_CONSTRAINT_UNIQUE' }
      const runMock = jest.fn(() => { throw error })
      prepareMock.mockReturnValueOnce({ run: runMock })

      const request = { json: async () => ({ username: 'duplicate' }) } as unknown as Request
      const res = await POST(request)
      expect(res.status).toBe(409)
      const body = await res.json()
      expect(body.error).toMatch(/Username already exists/)
    })

    it('returns 500 on unexpected error', async () => {
      const runMock = jest.fn(() => { throw new Error('db fail') })
      prepareMock.mockReturnValueOnce({ run: runMock })
      const request = { json: async () => ({ username: 'someone' }) } as unknown as Request
      const res = await POST(request)
      expect(res.status).toBe(500)
      const body = await res.json()
      expect(body.error).toMatch(/Failed to create user/)
    })
  })
})

