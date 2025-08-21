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

interface LeaderboardData {
  topPlayersByWinRate: PlayerStats[]
  topPlayersByWins: PlayerStats[]
  mostPlayedGames: GameStats[]
  recentActivity: RecentActivity[]
}

interface LeaderboardProps {
  onPlayerClick?: (userId: number) => void
  onGameClick?: (gameId: number) => void
}

export default function Leaderboard({ onPlayerClick, onGameClick }: LeaderboardProps) {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'winRate' | 'wins' | 'games' | 'activity'>('winRate')

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/scoreboard?type=leaderboard')
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch leaderboard')
      }
    } catch (err) {
      setError('Failed to fetch leaderboard')
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white shadow rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
        <button
          onClick={fetchLeaderboard}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🏆</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
        <p className="text-gray-500">Play some games to see the leaderboard!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('winRate')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'winRate'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Top by Win Rate
          </button>
          <button
            onClick={() => setActiveTab('wins')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'wins'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Top by Wins
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'games'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Popular Games
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recent Activity
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'winRate' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Players by Win Rate</h3>
            <div className="space-y-3">
              {data.topPlayersByWinRate.map((player, index) => (
                <div
                  key={player.userId}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    onPlayerClick ? 'hover:bg-gray-50' : ''
                  } ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100' : 'bg-gray-50'}`}
                  onClick={() => onPlayerClick?.(player.userId)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-300 text-orange-900' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{player.username}</div>
                      <div className="text-sm text-gray-500">
                        {player.gamesPlayed} games • {player.wins}W-{player.losses}L
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{player.winRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-500">Avg: {player.averageScore.toFixed(1)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'wins' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Players by Total Wins</h3>
            <div className="space-y-3">
              {data.topPlayersByWins.map((player, index) => (
                <div
                  key={player.userId}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    onPlayerClick ? 'hover:bg-gray-50' : ''
                  } ${index < 3 ? 'bg-gradient-to-r from-green-50 to-green-100' : 'bg-gray-50'}`}
                  onClick={() => onPlayerClick?.(player.userId)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-green-400 text-green-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-300 text-orange-900' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{player.username}</div>
                      <div className="text-sm text-gray-500">
                        {player.gamesPlayed} games • {player.winRate.toFixed(1)}% win rate
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{player.wins} wins</div>
                    <div className="text-sm text-gray-500">Avg: {player.averageScore.toFixed(1)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'games' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Most Played Games</h3>
            <div className="space-y-3">
              {data.mostPlayedGames.map((game, index) => (
                <div
                  key={game.gameId}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    onGameClick ? 'hover:bg-gray-50' : ''
                  } ${index < 3 ? 'bg-gradient-to-r from-purple-50 to-purple-100' : 'bg-gray-50'}`}
                  onClick={() => onGameClick?.(game.gameId)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-purple-400 text-purple-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-300 text-orange-900' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{game.gameName}</div>
                      <div className="text-sm text-gray-500">
                        {game.uniquePlayers} players • Last played {formatDate(game.lastPlayed)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{game.totalPlays} plays</div>
                    <div className="text-sm text-gray-500">Avg: {game.averageScore.toFixed(1)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-sm">🎮</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{activity.gameName}</div>
                      <div className="text-sm text-gray-500">
                        {activity.playerCount} players • Winners: {activity.winners.join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(activity.playedAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}