'use client'

import { useState, useEffect } from 'react'

interface PlayerStats {
  userId: number
  username: string
  gamesPlayed: number
  wins: number
  losses: number
  totalScore: number
  averageScore: number
  winRate: number
  rank: number
}

interface GameStats {
  gameId: number
  gameName: string
  totalPlays: number
  uniquePlayers: number
  averageScore: number
  highestScore: number
  lowestScore: number
  lastPlayed: string
}

interface RecentActivity {
  id: number
  type: 'game_result'
  gameId: number
  gameName: string
  playerCount: number
  winners: string[]
  playedAt: string
}

interface PlayerProfileData {
  player: PlayerStats
  gameBreakdown: GameStats[]
  recentGames: RecentActivity[]
}

interface PlayerProfileProps {
  userId: number
  onBack?: () => void
}

export default function PlayerProfile({ userId, onBack }: PlayerProfileProps) {
  const [data, setData] = useState<PlayerProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlayerProfile()
  }, [userId])

  const fetchPlayerProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/scoreboard?type=player&userId=${userId}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch player profile')
      }
    } catch (err) {
      setError('Failed to fetch player profile')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getPerformanceColor = (winRate: number) => {
    if (winRate >= 70) return 'text-green-600 bg-green-100'
    if (winRate >= 50) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getRankBadge = (rank: number) => {
    if (rank <= 3) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
    if (rank <= 10) return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
    return 'bg-gray-100 text-gray-700'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6 animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
        <div className="mt-4 space-x-2">
          <button
            onClick={fetchPlayerProfile}
            className="text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 underline"
            >
              Go back
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">👤</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Player not found</h3>
        <p className="text-gray-500">This player doesn&apos;t exist or hasn&apos;t played any games yet.</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 text-blue-600 hover:text-blue-800 underline"
          >
            Go back
          </button>
        )}
      </div>
    )
  }

  const { player, gameBreakdown, recentGames } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {player.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{player.username}</h1>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRankBadge(player.rank)}`}>
                  Rank #{player.rank}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(player.winRate)}`}>
                  {player.winRate.toFixed(1)}% Win Rate
                </span>
              </div>
            </div>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{player.gamesPlayed}</div>
            <div className="text-sm text-gray-500">Games Played</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{player.wins}</div>
            <div className="text-sm text-gray-500">Wins</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{player.losses}</div>
            <div className="text-sm text-gray-500">Losses</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{player.averageScore.toFixed(1)}</div>
            <div className="text-sm text-gray-500">Avg Score</div>
          </div>
        </div>
      </div>

      {/* Game Breakdown */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Game Performance</h2>
        {gameBreakdown.length > 0 ? (
          <div className="space-y-3">
            {gameBreakdown.map((game) => (
              <div key={game.gameId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{game.gameName}</div>
                  <div className="text-sm text-gray-500">
                    {game.totalPlays} plays • Last played {formatDate(game.lastPlayed)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    Avg: {game.averageScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Best: {game.highestScore} • Worst: {game.lowestScore}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No game data available
          </div>
        )}
      </div>

      {/* Recent Games */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Games</h2>
        {recentGames.length > 0 ? (
          <div className="space-y-3">
            {recentGames.map((game) => (
              <div key={game.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-sm">🎮</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{game.gameName}</div>
                    <div className="text-sm text-gray-500">
                      {game.playerCount} players
                      {game.winners.includes(player.username) && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                          Winner
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(game.playedAt)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent games
          </div>
        )}
      </div>
    </div>
  )
}