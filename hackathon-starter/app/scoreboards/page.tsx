'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import ScoreboardTable from '@/components/ScoreboardTable'
import { PlayerStats, GameScoreboard } from '@/lib/db'

interface GlobalScoreboardData {
  players: PlayerStats[]
  summary: {
    total_players: number
    total_games_played: number
    games_available: Array<{
      id: number
      name: string
      type: string
      total_games: number
      unique_players: number
    }>
  }
}

export default function ScoreboardsPage() {
  const [globalData, setGlobalData] = useState<GlobalScoreboardData | null>(null)
  const [gameScoreboards, setGameScoreboards] = useState<GameScoreboard[]>([])
  const [selectedView, setSelectedView] = useState<'global' | 'games'>('global')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch global scoreboard
      const globalResponse = await fetch('/api/scoreboards')
      if (!globalResponse.ok) throw new Error('Failed to fetch global scoreboard')
      const globalData = await globalResponse.json()
      setGlobalData(globalData)

      // Fetch game-specific scoreboards for games that have results
      const gamePromises = globalData.summary.games_available
        .filter((game: { id: number; name: string; type: string; total_games: number }) => game.total_games > 0)
        .map(async (game: { id: number; name: string; type: string; total_games: number }) => {
          try {
            const response = await fetch(`/api/games/${game.id}/scoreboard`)
            if (response.ok) {
              return await response.json()
            }
          } catch (err) {
            console.error(`Failed to fetch scoreboard for game ${game.id}:`, err)
          }
          return null
        })

      const gameResults = await Promise.all(gamePromises)
      setGameScoreboards(gameResults.filter(Boolean))
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scoreboards')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-medium">Error loading scoreboards</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchData}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Scoreboards</h1>
          <p className="mt-1 text-sm text-gray-600">
            Player rankings and statistics across all games
          </p>
        </div>

        {/* View Toggle */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedView('global')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedView === 'global'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Global Leaderboard
              </button>
              <button
                onClick={() => setSelectedView('games')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedView === 'games'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Game-Specific Rankings
              </button>
            </nav>
          </div>
        </div>

        {/* Global View */}
        {selectedView === 'global' && globalData && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-blue-600">
                  {globalData.summary.total_players}
                </div>
                <div className="text-sm text-gray-500">Active Players</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-green-600">
                  {globalData.summary.total_games_played}
                </div>
                <div className="text-sm text-gray-500">Games Played</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-purple-600">
                  {globalData.summary.games_available.length}
                </div>
                <div className="text-sm text-gray-500">Available Games</div>
              </div>
            </div>

            <ScoreboardTable 
              players={globalData.players} 
              title="Global Leaderboard"
            />
          </>
        )}

        {/* Game-Specific View */}
        {selectedView === 'games' && (
          <div className="space-y-8">
            {gameScoreboards.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500">No game results found. Start playing to see rankings!</p>
              </div>
            ) : (
              gameScoreboards.map((scoreboard) => (
                <ScoreboardTable
                  key={scoreboard.game_id}
                  players={scoreboard.players}
                  title={`${scoreboard.game_name} Rankings`}
                  showGameContext={true}
                />
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}