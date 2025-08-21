'use client'

import { useState, useEffect } from 'react'
import { PlayerResult } from '../../domain/entities/GameResult'

interface Game {
  id: number
  name: string
}

interface User {
  id: number
  username: string
}

interface GameResultFormProps {
  onSubmit: (gameId: number, players: PlayerResult[], playedAt: Date, notes?: string) => Promise<void>
  games: Game[]
  users: User[]
  initialGameId?: number
  initialPlayers?: PlayerResult[]
  initialPlayedAt?: string
  initialNotes?: string
  submitLabel?: string
  isLoading?: boolean
}

export default function GameResultForm({
  onSubmit,
  games,
  users,
  initialGameId,
  initialPlayers = [],
  initialPlayedAt,
  initialNotes = '',
  submitLabel = 'Submit Result',
  isLoading = false
}: GameResultFormProps) {
  const [gameId, setGameId] = useState<number>(initialGameId || 0)
  const [players, setPlayers] = useState<PlayerResult[]>(
    initialPlayers.length > 0 ? initialPlayers : [
      { userId: 0, score: 0, isWinner: false },
      { userId: 0, score: 0, isWinner: false }
    ]
  )
  const [playedAt, setPlayedAt] = useState<string>(
    initialPlayedAt || new Date().toISOString().slice(0, 16)
  )
  const [notes, setNotes] = useState<string>(initialNotes)
  const [errors, setErrors] = useState<string[]>([])

  // Reset form when initial values change
  useEffect(() => {
    if (initialGameId) setGameId(initialGameId)
    if (initialPlayers.length > 0) setPlayers(initialPlayers)
    if (initialPlayedAt) setPlayedAt(initialPlayedAt)
    setNotes(initialNotes)
  }, [initialGameId, initialPlayers, initialPlayedAt, initialNotes])

  const addPlayer = () => {
    if (players.length < 10) {
      setPlayers([...players, { userId: 0, score: 0, isWinner: false }])
    }
  }

  const removePlayer = (index: number) => {
    if (players.length > 2) {
      setPlayers(players.filter((_, i) => i !== index))
    }
  }

  const updatePlayer = (index: number, field: keyof PlayerResult, value: number | boolean) => {
    const updatedPlayers = [...players]
    updatedPlayers[index] = { ...updatedPlayers[index], [field]: value }
    setPlayers(updatedPlayers)
  }

  const validateForm = (): string[] => {
    const validationErrors: string[] = []

    if (!gameId) {
      validationErrors.push('Please select a game')
    }

    if (players.length < 2) {
      validationErrors.push('At least 2 players are required')
    }

    const selectedUserIds = new Set<number>()
    let hasWinner = false

    for (let i = 0; i < players.length; i++) {
      const player = players[i]
      
      if (!player.userId) {
        validationErrors.push(`Player ${i + 1}: Please select a user`)
        continue
      }

      if (selectedUserIds.has(player.userId)) {
        validationErrors.push(`Player ${i + 1}: User already selected`)
        continue
      }
      selectedUserIds.add(player.userId)

      if (typeof player.score !== 'number') {
        validationErrors.push(`Player ${i + 1}: Score must be a number`)
      }

      if (player.isWinner) {
        hasWinner = true
      }
    }

    if (!hasWinner) {
      validationErrors.push('At least one player must be marked as winner')
    }

    if (!playedAt) {
      validationErrors.push('Please select when the game was played')
    }

    return validationErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors([])
    
    try {
      await onSubmit(
        gameId,
        players,
        new Date(playedAt),
        notes || undefined
      )
    } catch (error) {
      setErrors(['Failed to submit game result'])
    }
  }

  const availableUsers = (currentIndex: number) => {
    const selectedUserIds = new Set(
      players
        .map((p, i) => i !== currentIndex ? p.userId : null)
        .filter(id => id !== null && id !== 0)
    )
    return users.filter(user => !selectedUserIds.has(user.id))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Game Selection */}
      <div>
        <label htmlFor="game" className="block text-sm font-medium text-gray-700">
          Game *
        </label>
        <select
          id="game"
          value={gameId}
          onChange={(e) => setGameId(parseInt(e.target.value))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        >
          <option value={0}>Select a game</option>
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name}
            </option>
          ))}
        </select>
      </div>

      {/* Players */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Players * (minimum 2, maximum 10)
          </label>
          <button
            type="button"
            onClick={addPlayer}
            disabled={players.length >= 10 || isLoading}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Add Player
          </button>
        </div>

        <div className="space-y-3">
          {players.map((player, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
              <div className="flex-1">
                <select
                  value={player.userId}
                  onChange={(e) => updatePlayer(index, 'userId', parseInt(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={isLoading}
                >
                  <option value={0}>Select player</option>
                  {availableUsers(index).map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-24">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Score"
                  value={player.score}
                  onChange={(e) => updatePlayer(index, 'score', parseFloat(e.target.value) || 0)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={player.isWinner}
                  onChange={(e) => updatePlayer(index, 'isWinner', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label className="ml-2 text-sm text-gray-700">Winner</label>
              </div>
              
              {players.length > 2 && (
                <button
                  type="button"
                  onClick={() => removePlayer(index)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Played At */}
      <div>
        <label htmlFor="playedAt" className="block text-sm font-medium text-gray-700">
          Played At *
        </label>
        <input
          type="datetime-local"
          id="playedAt"
          value={playedAt}
          onChange={(e) => setPlayedAt(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes about the game..."
          maxLength={500}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
        <p className="mt-1 text-sm text-gray-500">{notes.length}/500 characters</p>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-800">
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isLoading ? 'Submitting...' : submitLabel}
      </button>
    </form>
  )
}