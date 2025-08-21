'use client'

import { useState } from 'react'
import Link from 'next/link'
import Leaderboard from '../../src/modules/scoreboard/presentation/components/Leaderboard'
import PlayerProfile from '../../src/modules/scoreboard/presentation/components/PlayerProfile'

type ViewMode = 'leaderboard' | 'player'

export default function ScoreboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('leaderboard')
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null)

  const handlePlayerClick = (userId: number) => {
    setSelectedPlayerId(userId)
    setViewMode('player')
  }

  const handleBackToLeaderboard = () => {
    setViewMode('leaderboard')
    setSelectedPlayerId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {viewMode === 'leaderboard' ? 'Scoreboard' : 'Player Profile'}
              </h1>
              <p className="mt-2 text-gray-600">
                {viewMode === 'leaderboard' 
                  ? 'Track player rankings, game statistics, and recent activity'
                  : 'Detailed player statistics and game history'
                }
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
                    <button
                      onClick={viewMode === 'player' ? handleBackToLeaderboard : undefined}
                      className={`ml-4 text-sm font-medium ${
                        viewMode === 'leaderboard' 
                          ? 'text-gray-500' 
                          : 'text-gray-400 hover:text-gray-500 cursor-pointer'
                      }`}
                    >
                      Scoreboard
                    </button>
                  </div>
                </li>
                {viewMode === 'player' && (
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-sm font-medium text-gray-500">
                        Player Profile
                      </span>
                    </div>
                  </li>
                )}
              </ol>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {viewMode === 'leaderboard' && (
            <Leaderboard 
              onPlayerClick={handlePlayerClick}
              onGameClick={(gameId: number) => {
                // Could navigate to game details page in the future
                console.log('Game clicked:', gameId)
              }}
            />
          )}

          {viewMode === 'player' && selectedPlayerId && (
            <PlayerProfile 
              userId={selectedPlayerId}
              onBack={handleBackToLeaderboard}
            />
          )}
        </div>

        {/* Quick Stats Footer */}
        {viewMode === 'leaderboard' && (
          <div className="mt-12 bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Game Results Tracking Platform
              </h3>
              <p className="text-gray-600 mb-4">
                Track your gaming performance, compete with friends, and climb the leaderboards!
              </p>
              <div className="flex justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Real-time updates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Detailed statistics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>Player rankings</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}