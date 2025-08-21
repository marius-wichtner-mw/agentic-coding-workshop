'use client'

import { PlayerStats as PlayerStatsType } from '@/lib/db'

interface PlayerStatsProps {
  player: PlayerStatsType
  rank?: number
}

export default function PlayerStats({ player, rank }: PlayerStatsProps) {
  const formatStreak = (streak: number) => {
    if (streak === 0) return 'No streak'
    if (streak > 0) return `${streak} wins in a row`
    return `${Math.abs(streak)} losses in a row`
  }

  const getStreakColor = (streak: number) => {
    if (streak > 0) return 'text-green-600'
    if (streak < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  const getRankDisplay = () => {
    if (rank === undefined) return null
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{player.username}</h3>
          {rank && (
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-500 mr-2">Rank:</span>
              <span className="text-lg">{getRankDisplay()}</span>
            </div>
          )}
        </div>
        <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
          player.win_rate >= 70 ? 'bg-green-100 text-green-800' :
          player.win_rate >= 50 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {player.win_rate}% Win Rate
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{player.games_played}</div>
          <div className="text-sm text-gray-500">Games Played</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{player.wins}</div>
          <div className="text-sm text-gray-500">Wins</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{player.losses}</div>
          <div className="text-sm text-gray-500">Losses</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{player.avg_score}</div>
          <div className="text-sm text-gray-500">Avg Score</div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Current Streak</div>
            <div className={`text-lg font-semibold ${getStreakColor(player.current_streak)}`}>
              {formatStreak(player.current_streak)}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">Best Winning Streak</div>
            <div className="text-lg font-semibold text-blue-600">
              {player.longest_streak > 0 ? `${player.longest_streak} wins` : 'None'}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Score</span>
          <span className="text-lg font-bold text-gray-900">{player.total_score}</span>
        </div>
      </div>
    </div>
  )
}