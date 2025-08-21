'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import GameResultForm from '@/src/modules/results/presentation/components/GameResultForm'
import GameResultList from '@/src/modules/results/presentation/components/GameResultList'
import { PlayerResult } from '@/src/modules/results/domain/entities/GameResult'

interface Game {
  id: number
  name: string
  type: string
}

interface User {
  id: number
  username: string
}

interface GameResultListItem {
  id: number
  gameId: number
  gameName?: string
  playerCount: number
  winners: string[]
  playedAt: string
  notes?: string
}

interface GameResultDetail {
  id: number
  gameId: number
  gameName?: string
  players: {
    userId: number
    username?: string
    score: number
    isWinner: boolean
  }[]
  playedAt: string
  notes?: string
}

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export default function ResultsPage() {
  const [results, setResults] = useState<GameResultListItem[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingResult, setEditingResult] = useState<GameResultDetail | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('list')

  // Fetch initial data
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [gamesRes, usersRes, resultsRes] = await Promise.all([
        fetch('/api/games'),
        fetch('/api/users'),
        fetch('/api/results')
      ])

      const [gamesData, usersData, resultsData] = await Promise.all([
        gamesRes.json() as Promise<ApiResponse<Game[]>>,
        usersRes.json() as Promise<ApiResponse<User[]>>,
        resultsRes.json() as Promise<ApiResponse<GameResultListItem[]>>
      ])

      if (gamesData.success && gamesData.data) {
        setGames(gamesData.data)
      }

      if (usersData.success && usersData.data) {
        setUsers(usersData.data)
      }

      if (resultsData.success && resultsData.data) {
        setResults(resultsData.data)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load data' })
    } finally {
      setIsLoading(false)
    }
  }

  // Create game result
  const createGameResult = async (
    gameId: number,
    players: PlayerResult[],
    playedAt: Date,
    notes?: string
  ) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          players,
          playedAt: playedAt.toISOString(),
          notes
        }),
      })

      const data: ApiResponse<GameResultDetail> = await response.json()

      if (data.success && data.data) {
        // Convert to list item format
        const newResult: GameResultListItem = {
          id: data.data.id,
          gameId: data.data.gameId,
          gameName: data.data.gameName,
          playerCount: data.data.players.length,
          winners: data.data.players
            .filter(p => p.isWinner)
            .map(p => p.username || `User ${p.userId}`),
          playedAt: data.data.playedAt,
          notes: data.data.notes
        }

        setResults(prev => [newResult, ...prev])
        setMessage({ type: 'success', text: 'Game result created successfully!' })
        setActiveTab('list')
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create game result' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create game result' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update game result
  const updateGameResult = async (
    gameId: number,
    players: PlayerResult[],
    playedAt: Date,
    notes?: string
  ) => {
    if (!editingResult) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/results/${editingResult.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          players,
          playedAt: playedAt.toISOString(),
          notes
        }),
      })

      const data: ApiResponse<GameResultDetail> = await response.json()

      if (data.success && data.data) {
        // Update the list
        const updatedResult: GameResultListItem = {
          id: data.data.id,
          gameId: data.data.gameId,
          gameName: data.data.gameName,
          playerCount: data.data.players.length,
          winners: data.data.players
            .filter(p => p.isWinner)
            .map(p => p.username || `User ${p.userId}`),
          playedAt: data.data.playedAt,
          notes: data.data.notes
        }

        setResults(prev => prev.map(result => 
          result.id === editingResult.id ? updatedResult : result
        ))
        setEditingResult(null)
        setMessage({ type: 'success', text: 'Game result updated successfully!' })
        setActiveTab('list')
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update game result' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update game result' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete game result
  const deleteGameResult = async (id: number) => {
    try {
      const response = await fetch(`/api/results/${id}`, {
        method: 'DELETE',
      })

      const data: ApiResponse = await response.json()

      if (data.success) {
        setResults(prev => prev.filter(result => result.id !== id))
        setMessage({ type: 'success', text: 'Game result deleted successfully!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete game result' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete game result' })
    }
  }

  // Edit game result
  const editGameResult = async (result: GameResultListItem) => {
    try {
      const response = await fetch(`/api/results/${result.id}`)
      const data: ApiResponse<GameResultDetail> = await response.json()

      if (data.success && data.data) {
        setEditingResult(data.data)
        setActiveTab('create')
      } else {
        setMessage({ type: 'error', text: 'Failed to load game result details' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load game result details' })
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchData()
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Game Results</h1>
              <p className="mt-2 text-gray-600">
                Track and manage game results with player scores and winners
              </p>
            </div>
            
            {/* Navigation breadcrumb */}
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <div>
                    <Link href="/" className="text-gray-400 hover:text-gray-500">
                      Home
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-4 text-sm font-medium text-gray-500">
                      Results
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
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

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => {
                setActiveTab('list')
                setEditingResult(null)
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Results List
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {editingResult ? 'Edit Result' : 'Create Result'}
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'create' ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                {editingResult ? 'Edit Game Result' : 'Create New Game Result'}
              </h2>

              <GameResultForm
                onSubmit={editingResult ? updateGameResult : createGameResult}
                games={games}
                users={users}
                initialGameId={editingResult?.gameId}
                initialPlayers={editingResult?.players.map(p => ({
                  userId: p.userId,
                  score: p.score,
                  isWinner: p.isWinner
                }))}
                initialPlayedAt={editingResult?.playedAt ? 
                  new Date(editingResult.playedAt).toISOString().slice(0, 16) : 
                  undefined
                }
                initialNotes={editingResult?.notes || ''}
                submitLabel={editingResult ? 'Update Result' : 'Create Result'}
                isLoading={isSubmitting}
              />

              {editingResult && (
                <button
                  onClick={() => {
                    setEditingResult(null)
                    setActiveTab('list')
                  }}
                  className="mt-4 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">All Results</h2>
              <button
                onClick={fetchData}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            <GameResultList
              results={results}
              onEdit={editGameResult}
              onDelete={deleteGameResult}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  )
}