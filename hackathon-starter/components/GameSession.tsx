'use client'

import { useState, useEffect } from 'react'

interface GameSessionData {
  id: number
  game_id: number
  started_by: number
  status: 'setup' | 'in_progress' | 'completed' | 'cancelled'
  total_rounds: number
  current_round: number
  player1_id: number
  player2_id: number
  created_at: string
  completed_at: string | null
  game_name: string
  game_type: string
  game_image_url: string | null
  player1_username: string
  player2_username: string
  started_by_username: string
}

interface GameResult {
  id: number
  session_id: number
  player1_score: number
  player2_score: number
  winner_username: string
  timestamp: string
  notes: string | null
}

interface GameSessionProps {
  sessionId: number
  onClose: () => void
}

export default function GameSession({ sessionId, onClose }: GameSessionProps) {
  const [session, setSession] = useState<GameSessionData | null>(null)
  const [results, setResults] = useState<GameResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  // Result form state
  const [player1Score, setPlayer1Score] = useState('')
  const [player2Score, setPlayer2Score] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadSession()
  }, [sessionId])

  const loadSession = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/sessions/${sessionId}`, {
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to load session')
      const data = await res.json()
      setSession(data.session)
      setResults(data.results || [])
    } catch (err) {
      setError('Failed to load session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const startSession = async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'in_progress' })
      })
      
      if (!res.ok) throw new Error('Failed to start session')
      await loadSession()
    } catch (err) {
      setError('Failed to start session. Please try again.')
    }
  }

  const submitResult = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!player1Score || !player2Score) {
      setError('Please enter scores for both players')
      return
    }

    const p1Score = parseInt(player1Score)
    const p2Score = parseInt(player2Score)
    
    if (isNaN(p1Score) || isNaN(p2Score) || p1Score < 0 || p2Score < 0) {
      setError('Scores must be valid non-negative numbers')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      
      const res = await fetch(`/api/sessions/${sessionId}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          player1_score: p1Score,
          player2_score: p2Score,
          notes: notes.trim() || null
        })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to submit result')
      }
      
      // Reset form
      setPlayer1Score('')
      setPlayer2Score('')
      setNotes('')
      
      // Reload session data
      await loadSession()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit result')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-600">Loading session...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Session not found</p>
        <button onClick={onClose} className="mt-2 text-blue-600 hover:text-blue-800">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{session.game_name}</h2>
              <p className="text-sm text-gray-600">
                {session.player1_username} vs {session.player2_username}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Status and Progress */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              session.status === 'completed' ? 'bg-green-100 text-green-800' :
              session.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {session.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className="text-sm text-gray-600">
              {session.status === 'setup' ? `Round 1 of ${session.total_rounds}` : `Round ${session.current_round} of ${session.total_rounds}`}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${session.status === 'completed' ? 100 : (session.current_round / session.total_rounds) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {session.status === 'setup' && (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Ready to start the game?</p>
              <button
                onClick={startSession}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Start Game
              </button>
            </div>
          )}

          {session.status === 'in_progress' && session.current_round <= session.total_rounds && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Submit Round {session.current_round} Results
              </h3>
              
              <form onSubmit={submitResult} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">
                      {session.player1_username} Score
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={player1Score}
                      onChange={(e) => setPlayer1Score(e.target.value)}
                      className="form-input"
                      placeholder="0"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      {session.player2_username} Score
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={player2Score}
                      onChange={(e) => setPlayer2Score(e.target.value)}
                      className="form-input"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-input"
                    rows={2}
                    placeholder="Any notes about this round..."
                  />
                </div>

                {error && (
                  <div className="form-error">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Round Result'}
                </button>
              </form>
            </div>
          )}

          {(session.status === 'completed' || results.length > 0) && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Results History</h3>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={result.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        Round {index + 1}
                      </span>
                      <span className="text-sm text-gray-500">
                        Winner: {result.winner_username}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="text-sm">
                        {session.player1_username}: {result.player1_score}
                      </span>
                      <span className="text-sm">
                        {session.player2_username}: {result.player2_score}
                      </span>
                    </div>
                    {result.notes && (
                      <p className="mt-2 text-sm text-gray-600">
                        Notes: {result.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              
              {session.status === 'completed' && (
                <div className="mt-6 text-center">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-green-900">Game Completed!</h4>
                    <p className="text-green-700">
                      Thanks for playing {session.game_name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}