'use client'

import Image from 'next/image'
import { useState } from 'react'

interface Game {
  id: number
  name: string
  type: 'video' | 'table' | 'card'
  image_url: string | null
  created_by: number
  created_at: string
  creator_username: string
}

interface GameCardProps {
  game: Game
  onEdit?: (game: Game) => void
  onDelete?: (game: Game) => void
  onStartGame?: (game: Game) => void
  showActions?: boolean
}

export default function GameCard({ game, onEdit, onDelete, onStartGame, showActions = false }: GameCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleDelete = async () => {
    if (!onDelete || isDeleting) return
    
    const confirmed = window.confirm('Are you sure you want to delete this game?')
    if (!confirmed) return
    
    setIsDeleting(true)
    try {
      await onDelete(game)
    } finally {
      setIsDeleting(false)
    }
  }

  const typeIcons = {
    video: '🎮',
    table: '🎲',
    card: '🃏'
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 bg-gray-200">
        {game.image_url ? (
          <Image
            src={game.image_url}
            alt={game.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-4xl">
            {typeIcons[game.type]}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{game.name}</h3>
            <p className="text-sm text-gray-600">
              Added by {game.creator_username}
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {game.type}
          </span>
        </div>

        {showActions && (
          <div className="mt-4 space-y-2">
            {onStartGame && (
              <button
                onClick={() => onStartGame(game)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium"
              >
                Start Game
              </button>
            )}
            <div className="flex justify-end space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(game)}
                  className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}