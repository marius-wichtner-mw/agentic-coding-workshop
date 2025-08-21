'use client'

import { useState, useEffect } from 'react'
import GameCard from '@/components/GameCard'
import GameForm from '@/components/GameForm'
import PlayerSelection from '@/components/PlayerSelection'
import GameSession from '@/components/GameSession'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'

interface Game {
  id: number
  name: string
  type: 'video' | 'table' | 'card'
  image_url: string | null
  created_by: number
  created_at: string
  creator_username: string
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: number } | null>(null)
  const [showPlayerSelection, setShowPlayerSelection] = useState(false)
  const [selectedGameForSession, setSelectedGameForSession] = useState<Game | null>(null)
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null)

  useEffect(() => {
    loadGames()
    checkAuth()

    // Listen for auth changes to update current user
    const onAuthChanged = () => {
      console.log('Games page: Auth changed event received')
      checkAuth()
    }
    window.addEventListener('auth:changed', onAuthChanged as EventListener)

    return () => {
      window.removeEventListener('auth:changed', onAuthChanged as EventListener)
    }
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setCurrentUser(data.user)
      }
    } catch {
      // Handle silently
    }
  }

  const loadGames = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch('/api/games', {
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to fetch games')
      const data = await res.json()
      setGames(data.games)
    } catch (err) {
      setError('Failed to load games. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGame = async (formData: FormData) => {
    const imageFile = formData.get('image') as File
    let imageUrl = null

    if (imageFile.size > 0) {
      const uploadData = new FormData()
      uploadData.append('file', imageFile)
      
      const uploadRes = await fetch('/api/games/upload', {
        method: 'POST',
        credentials: 'include',
        body: uploadData
      })
      
      if (!uploadRes.ok) {
        throw new Error('Failed to upload image')
      }
      
      const { url } = await uploadRes.json()
      imageUrl = url
    }

    const gameData = {
      name: formData.get('name'),
      type: formData.get('type'),
      image_url: imageUrl
    }

          const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(gameData)
      })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to create game')
    }

    await loadGames()
    setShowCreateForm(false)
  }

  const handleUpdateGame = async (formData: FormData) => {
    if (!editingGame) return

    const imageFile = formData.get('image') as File
    let imageUrl = editingGame.image_url

    if (imageFile.size > 0) {
      const uploadData = new FormData()
      uploadData.append('file', imageFile)
      
      const uploadRes = await fetch('/api/games/upload', {
        method: 'POST',
        credentials: 'include',
        body: uploadData
      })
      
      if (!uploadRes.ok) {
        throw new Error('Failed to upload image')
      }
      
      const { url } = await uploadRes.json()
      imageUrl = url
    }

    const gameData = {
      name: formData.get('name'),
      type: formData.get('type'),
      image_url: imageUrl
    }

    const res = await fetch(`/api/games/${editingGame.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(gameData)
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to update game')
    }

    await loadGames()
    setEditingGame(null)
  }

  const handleDeleteGame = async (game: Game) => {
    try {
      const res = await fetch(`/api/games/${game.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (!res.ok) {
        throw new Error('Failed to delete game')
      }
      
      await loadGames()
    } catch (err) {
      setError('Failed to delete game. Please try again.')
    }
  }

  const handleStartGame = (game: Game) => {
    setSelectedGameForSession(game)
    setShowPlayerSelection(true)
  }

  const handlePlayerSelectionComplete = async (data: { player1_id: number; player2_id: number; total_rounds: number }) => {
    if (!selectedGameForSession) return

    try {
      const res = await fetch(`/api/games/${selectedGameForSession.id}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify({
          player1_id: Number(data.player1_id),
          player2_id: Number(data.player2_id),
          total_rounds: Number(data.total_rounds),
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create session')
      }

      const result = await res.json()
      setActiveSessionId(result.session.id)
      setShowPlayerSelection(false)
      setSelectedGameForSession(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game session')
    }
  }

  const handleCloseSession = () => {
    setActiveSessionId(null)
    loadGames() // Refresh in case anything changed
  }

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Loading games..." />
      </div>
    )
  }

  if (activeSessionId) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <GameSession sessionId={activeSessionId} onClose={handleCloseSession} />
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Games</h1>
            <p className="mt-2 text-gray-600">Browse and manage available games</p>
          </div>
          
          {currentUser && !showCreateForm && !editingGame && !showPlayerSelection && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add New Game
            </button>
          )}
        </div>

        {error && (
          <div className="mb-8">
            <ErrorMessage message={error} onRetry={loadGames} />
          </div>
        )}

        {showPlayerSelection && selectedGameForSession && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Start {selectedGameForSession.name}
            </h2>
            <PlayerSelection
              onComplete={handlePlayerSelectionComplete}
              onCancel={() => {
                setShowPlayerSelection(false)
                setSelectedGameForSession(null)
              }}
            />
          </div>
        )}

        {(showCreateForm || editingGame) && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              {editingGame ? 'Edit Game' : 'Add New Game'}
            </h2>
            <GameForm
              game={editingGame || undefined}
              onSubmit={editingGame ? handleUpdateGame : handleCreateGame}
              onCancel={() => {
                setShowCreateForm(false)
                setEditingGame(null)
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map(game => (
            <GameCard
              key={game.id}
              game={game}
              showActions={currentUser?.id === game.created_by}
              onEdit={setEditingGame}
              onDelete={handleDeleteGame}
              onStartGame={handleStartGame}
            />
          ))}
        </div>

        {games.length === 0 && !showCreateForm && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No games available yet.
              {currentUser && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="text-blue-600 hover:text-blue-800 ml-2"
                >
                  Add the first one!
                </button>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}