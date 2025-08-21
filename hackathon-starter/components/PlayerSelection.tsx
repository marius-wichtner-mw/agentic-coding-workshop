'use client'

import { useState, useEffect } from 'react'

interface User {
  id: number
  username: string
  created_at: string
}

interface PlayerSelectionProps {
  onComplete: (data: { player1_id: number; player2_id: number; total_rounds: number }) => void
  onCancel: () => void
}

export default function PlayerSelection({ onComplete, onCancel }: PlayerSelectionProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [player1Id, setPlayer1Id] = useState('')
  const [player2Id, setPlayer2Id] = useState('')
  const [totalRounds, setTotalRounds] = useState(1)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to load users')
      const data = await res.json()
      setUsers(data.users)
    } catch (err) {
      setError('Failed to load users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!player1Id || !player2Id) {
      setError('Please select both players')
      return
    }

    if (player1Id === player2Id) {
      setError('Please select different players')
      return
    }

    onComplete({
      player1_id: Number(player1Id),
      player2_id: Number(player2Id),
      total_rounds: Number(totalRounds)
    })
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-600">Loading players...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Setup Game Session</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-group">
          <label htmlFor="player1" className="form-label">
            Player 1
          </label>
          <select
            id="player1"
            value={player1Id}
            onChange={(e) => setPlayer1Id(e.target.value)}
            className="form-select"
            required
          >
            <option value="">Select Player 1</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="player2" className="form-label">
            Player 2
          </label>
          <select
            id="player2"
            value={player2Id}
            onChange={(e) => setPlayer2Id(e.target.value)}
            className="form-select"
            required
          >
            <option value="">Select Player 2</option>
            {users.map(user => (
              <option key={user.id} value={user.id} disabled={user.id.toString() === player1Id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="rounds" className="form-label">
            Number of Rounds
          </label>
          <select
            id="rounds"
            value={totalRounds}
            onChange={(e) => setTotalRounds(parseInt(e.target.value))}
            className="form-select"
            required
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <option key={num} value={num}>
                {num} Round{num > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Start Game
          </button>
        </div>
      </form>
    </div>
  )
}