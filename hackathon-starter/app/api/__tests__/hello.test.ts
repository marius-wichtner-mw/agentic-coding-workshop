/**
 * @jest-environment node
 */
import { GET, POST } from '../hello/route'

describe('/api/hello', () => {
  describe('GET', () => {
    it('returns a success response with message and timestamp', async () => {
      const response = await GET()
      const data = await response.json()
      
      expect(data.message).toBe('Hello from the API!')
      expect(data.status).toBe('success')
      expect(data.timestamp).toBeDefined()
    })
  })

  describe('POST', () => {
    it('echoes back the received data', async () => {
      const testData = { test: 'data', value: 123 }
      const request = {
        json: async () => testData
      } as Request
      
      const response = await POST(request)
      const data = await response.json()
      
      expect(data.message).toBe('Data received successfully')
      expect(data.received).toEqual(testData)
      expect(data.timestamp).toBeDefined()
    })
  })
})