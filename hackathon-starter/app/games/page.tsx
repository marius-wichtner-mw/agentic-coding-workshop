'use client'

import { useState, useEffect } from 'react'
import GameForm from '@/src/modules/games/presentation/components/GameForm'
import GameList from '@/src/modules/games/presentation/components/GameList'
import { GameType } from '@/src/shared/types/common'

interface Game {
  id: number
  name: string
  type: GameType
  imageData?: string
  createdBy: number
  createdAt: string
}

interface User {
  id: number
  username: string
}

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch users for creator selection
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data: ApiResponse<User[]> = await response.json()
      
      if (data.success && data.data) {
        setUsers(data.data)
        if (data.data.length > 0 && !selectedUserId) {
          setSelectedUserId(data.data[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  // Fetch games
  const fetchGames = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/games')
      const data: ApiResponse<Game[]> = await response.json()
      
      if (data.success && data.data) {
        setGames(data.data)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch games' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch games' })
    } finally {
      setIsLoading(false)
    }
  }

  // Create game
  const createGame = async (name: string, type: GameType, imageData?: string) => {
    if (!selectedUserId) {
      setMessage({ type: 'error', text: 'Please select a user' })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          type, 
          createdBy: selectedUserId,
          imageData 
        }),
      })
      
      const data: ApiResponse<Game> = await response.json()
      
      if (data.success && data.data) {
        setGames(prev => [data.data!, ...prev])
        setMessage({ type: 'success', text: 'Game created successfully!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create game' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create game' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update game
  const updateGame = async (name: string, type: GameType, imageData?: string) => {
    if (!editingGame) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/games/${editingGame.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, imageData }),
      })
      
      const data: ApiResponse<Game> = await response.json()
      
      if (data.success && data.data) {
        setGames(prev => prev.map(game => 
          game.id === editingGame.id ? data.data! : game
        ))
        setEditingGame(null)
        setMessage({ type: 'success', text: 'Game updated successfully!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update game' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update game' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete game
  const deleteGame = async (gameId: number) => {
    if (!confirm('Are you sure you want to delete this game?')) return
    
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: 'DELETE',
      })
      
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setGames(prev => prev.filter(game => game.id !== gameId))
        setMessage({ type: 'success', text: 'Game deleted successfully!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete game' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete game' })
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchUsers()
    fetchGames()
  }, [])

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Game Management</h1>
          <p className="mt-2 text-gray-600">
            Create and manage games for the Game Results Tracking Platform
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Form */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {editingGame ? 'Edit Game' : 'Create New Game'}
              </h2>

              {/* User Selection */}
              {!editingGame && (
                <div className="mb-4">
                  <label htmlFor="creator" className="block text-sm font-medium text-gray-700">
                    Creator
                  </label>
                  <select
                    id="creator"
                    value={selectedUserId || ''}
                    onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <GameForm
                onSubmit={editingGame ? updateGame : createGame}
                initialName={editingGame?.name || ''}
                initialType={editingGame?.type || 'video_game'}
                initialImageData={editingGame?.imageData || ''}
                submitLabel={editingGame ? 'Update Game' : 'Create Game'}
                isLoading={isSubmitting}
              />
              
              {editingGame && (
                <button
                  onClick={() => setEditingGame(null)}
                  className="mt-4 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          {/* Games List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Games</h2>
                <button
                  onClick={fetchGames}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              
              <GameList
                games={games}
                onEdit={setEditingGame}
                onDelete={deleteGame}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}