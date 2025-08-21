'use client'

import { PlayerStats } from '@/lib/db'

interface ScoreboardTableProps {
  players: PlayerStats[]
  title?: string
  showGameContext?: boolean
}

export default function ScoreboardTable({ players, title = "Leaderboard" }: ScoreboardTableProps) {
  const formatStreak = (streak: number) => {
    if (streak === 0) return '-'
    if (streak > 0) return `W${streak}`
    return `L${Math.abs(streak)}`
  }

  const getStreakColor = (streak: number) => {
    if (streak > 0) return 'text-green-600 bg-green-50'
    if (streak < 0) return 'text-red-600 bg-red-50'
    return 'text-gray-500 bg-gray-50'
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇'
      case 1: return '🥈'
      case 2: return '🥉'
      default: return `#${index + 1}`
    }
  }

  const getRankBackground = (index: number) => {
    switch (index) {
      case 0: return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400'
      case 1: return 'bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-400'
      case 2: return 'bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400'
      default: return 'hover:bg-gray-50'
    }
  }

  if (players.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
        <div className="text-center py-8 text-gray-500">
          No game results found. Start playing to see rankings!
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Games
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wins
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Win Rate
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Score
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Streak
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Best Streak
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player, index) => (
              <tr key={player.player_id} className={getRankBackground(index)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-lg">{getRankIcon(index)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`${index < 3 ? 'text-black font-bold text-base' : 'text-gray-900 font-medium text-sm'}`}>
                    {player.username}
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-center text-sm ${index < 3 ? 'text-black font-semibold' : 'text-gray-900'}`}>
                  {player.games_played}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-center text-sm ${index < 3 ? 'text-black' : 'text-gray-900'}`}>
                  <span className={`font-medium text-green-700 ${index < 3 ? 'font-bold' : ''}`}>{player.wins}</span>
                  <span className={`ml-1 ${index < 3 ? 'text-black font-medium' : 'text-gray-400'}`}>/ {player.losses}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    player.win_rate >= 70 ? 'bg-green-100 text-green-800' :
                    player.win_rate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {player.win_rate}%
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-center text-sm ${index < 3 ? 'text-black font-semibold' : 'text-gray-900'}`}>
                  {player.avg_score}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStreakColor(player.current_streak)}`}>
                    {formatStreak(player.current_streak)}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-center text-sm ${index < 3 ? 'text-black' : 'text-gray-900'}`}>
                  <span className={`font-medium text-blue-700 ${index < 3 ? 'font-bold' : ''}`}>
                    {player.longest_streak > 0 ? `W${player.longest_streak}` : '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}