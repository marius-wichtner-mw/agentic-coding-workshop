/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { GET as getGlobalScoreboard } from '../scoreboards/route'
import { GET as getGameScoreboard } from '../games/[id]/scoreboard/route'
import db, { PlayerStats } from '@/lib/db'

describe('/api/scoreboards', () => {
  beforeEach(() => {
    // Clean up and insert test data - respect foreign key constraints
    db.exec('PRAGMA foreign_keys = OFF')
    db.exec('DELETE FROM game_results')
    db.exec('DELETE FROM game_sessions')
    db.exec('DELETE FROM games')
    db.exec('DELETE FROM users')
    db.exec('PRAGMA foreign_keys = ON')
    
    // Insert test users
    db.exec(`
      INSERT INTO users (id, username, created_at) VALUES
      (1, 'alice', '2024-01-01'),
      (2, 'bob', '2024-01-02'),
      (3, 'charlie', '2024-01-03')
    `)
    
    // Insert test games
    db.exec(`
      INSERT INTO games (id, name, type, created_by, created_at) VALUES
      (1, 'Test Game 1', 'video', 1, '2024-01-01'),
      (2, 'Test Game 2', 'table', 2, '2024-01-02')
    `)
    
    // Insert test game sessions
    db.exec(`
      INSERT INTO game_sessions (id, game_id, started_by, status, player1_id, player2_id, created_at, completed_at) VALUES
      (1, 1, 1, 'completed', 1, 2, '2024-01-01', '2024-01-01'),
      (2, 1, 2, 'completed', 2, 3, '2024-01-02', '2024-01-02'),
      (3, 2, 3, 'completed', 3, 1, '2024-01-03', '2024-01-03')
    `)
    
    // Insert test game results
    db.exec(`
      INSERT INTO game_results (session_id, game_id, player1_id, player2_id, player1_score, player2_score, winner_id, timestamp) VALUES
      (1, 1, 1, 2, 100, 80, 1, '2024-01-01'),
      (2, 1, 2, 3, 90, 110, 3, '2024-01-02'),
      (3, 2, 3, 1, 50, 70, 1, '2024-01-03')
    `)
  })

  afterEach(() => {
    // Clean up test data - respect foreign key constraints
    db.exec('PRAGMA foreign_keys = OFF')
    db.exec('DELETE FROM game_results')
    db.exec('DELETE FROM game_sessions')
    db.exec('DELETE FROM games')
    db.exec('DELETE FROM users')
    db.exec('PRAGMA foreign_keys = ON')
  })

  describe('GET /api/scoreboards', () => {
    it('returns global player statistics across all games', async () => {
      const mockRequest = {} as NextRequest
      const response = await getGlobalScoreboard(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.players).toBeDefined()
      expect(data.summary).toBeDefined()
      
      // Alice should have 2 wins, 0 losses
      const alice = data.players.find((p: PlayerStats) => p.username === 'alice')
      expect(alice).toBeDefined()
      expect(alice.wins).toBe(2)
      expect(alice.losses).toBe(0)
      expect(alice.win_rate).toBe(100)
      
      // Bob should have 0 wins, 2 losses
      const bob = data.players.find((p: PlayerStats) => p.username === 'bob')
      expect(bob).toBeDefined()
      expect(bob.wins).toBe(0)
      expect(bob.losses).toBe(2)
      expect(bob.win_rate).toBe(0)
      
      // Charlie should have 1 win, 1 loss
      const charlie = data.players.find((p: PlayerStats) => p.username === 'charlie')
      expect(charlie).toBeDefined()
      expect(charlie.wins).toBe(1)
      expect(charlie.losses).toBe(1)
      expect(charlie.win_rate).toBe(50)
      
      // Check summary
      expect(data.summary.total_players).toBe(3)
      expect(data.summary.total_games_played).toBe(6) // 3 results * 2 players each
      expect(data.summary.games_available).toHaveLength(2)
    })

    it('handles empty database gracefully', async () => {
      // Clear all data
      db.exec('DELETE FROM game_results')
      
      const mockRequest = {} as NextRequest
      const response = await getGlobalScoreboard(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.players).toHaveLength(0)
      expect(data.summary.total_players).toBe(0)
      expect(data.summary.total_games_played).toBe(0)
    })
  })

  describe('GET /api/games/[id]/scoreboard', () => {
    it('returns game-specific player statistics', async () => {
      const mockRequest = {} as NextRequest
      const params = { id: '1' }
      const response = await getGameScoreboard(mockRequest, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.game_id).toBe(1)
      expect(data.game_name).toBe('Test Game 1')
      expect(data.players).toHaveLength(3)
      
      // Find Alice and verify her stats (she has 1 win, 0 losses in this game)
      const alice = data.players.find((p: PlayerStats) => p.username === 'alice')
      expect(alice).toBeDefined()
      expect(alice.wins).toBe(1)
      expect(alice.losses).toBe(0)
      expect(alice.win_rate).toBe(100)
    })

    it('returns 400 for invalid game ID', async () => {
      const mockRequest = {} as NextRequest
      const params = { id: 'invalid' }
      const response = await getGameScoreboard(mockRequest, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid game ID')
    })

    it('returns 404 for non-existent game', async () => {
      const mockRequest = {} as NextRequest
      const params = { id: '999' }
      const response = await getGameScoreboard(mockRequest, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Game not found')
    })

    it('calculates streaks correctly', async () => {
      // Add more results to test streak calculation
      db.exec(`
        INSERT INTO game_sessions (id, game_id, started_by, status, player1_id, player2_id, created_at, completed_at) VALUES
        (4, 1, 1, 'completed', 1, 2, '2024-01-04', '2024-01-04'),
        (5, 1, 1, 'completed', 1, 3, '2024-01-05', '2024-01-05')
      `)
      
      db.exec(`
        INSERT INTO game_results (session_id, game_id, player1_id, player2_id, player1_score, player2_score, winner_id, timestamp) VALUES
        (4, 1, 1, 2, 120, 80, 1, '2024-01-04'),
        (5, 1, 1, 3, 130, 90, 1, '2024-01-05')
      `)

      const mockRequest = {} as NextRequest
      const params = { id: '1' }
      const response = await getGameScoreboard(mockRequest, { params })
      const data = await response.json()

      const alice = data.players.find((p: PlayerStats) => p.username === 'alice')
      expect(alice.current_streak).toBeGreaterThan(0) // Should have positive streak
      expect(alice.longest_streak).toBeGreaterThan(0) // Should have longest streak recorded
    })
  })
})