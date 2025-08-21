'use client'

import { GameType } from '@/src/shared/types/common'

interface Game {
  id: number
  name: string
  type: GameType
  imageData?: string
  createdBy: number
  createdAt: string
}

interface GameListProps {
  games: Game[]
  onEdit?: (game: Game) => void
  onDelete?: (gameId: number) => void
  isLoading?: boolean
}

const getGameTypeLabel = (type: GameType): string => {
  switch (type) {
    case 'video_game':
      return 'Video Game'
    case 'table_game':
      return 'Table Game'
    case 'card_game':
      return 'Card Game'
    default:
      return type
  }
}

const getGameTypeIcon = (type: GameType): string => {
  switch (type) {
    case 'video_game':
      return '🎮'
    case 'table_game':
      return '🎲'
    case 'card_game':
      return '🃏'
    default:
      return '🎯'
  }
}

export default function GameList({ games, onEdit, onDelete, isLoading = false }: GameListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No games found. Create your first game!
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game) => (
        <div key={game.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Game Image */}
          <div className="h-48 bg-gray-200 flex items-center justify-center">
            {game.imageData ? (
              <img
                src={game.imageData}
                alt={game.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-6xl">
                {getGameTypeIcon(game.type)}
              </div>
            )}
          </div>

          {/* Game Info */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {game.name}
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getGameTypeLabel(game.type)}
              </span>
            </div>

            <div className="text-sm text-gray-500 mb-4">
              Created: {new Date(game.createdAt).toLocaleDateString()}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(game)}
                  className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(game.id)}
                  className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}