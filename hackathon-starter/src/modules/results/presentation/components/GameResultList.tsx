'use client'

interface GameResultListItem {
  id: number
  gameId: number
  gameName?: string
  playerCount: number
  winners: string[]
  playedAt: string
  notes?: string
}

interface GameResultListProps {
  results: GameResultListItem[]
  onEdit?: (result: GameResultListItem) => void
  onDelete?: (id: number) => void
  onView?: (id: number) => void
  isLoading?: boolean
}

export default function GameResultList({
  results,
  onEdit,
  onDelete,
  onView,
  isLoading = false
}: GameResultListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white shadow rounded-lg p-6 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🎮</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No game results found</h3>
        <p className="text-gray-500">Start by creating your first game result!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <div key={result.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {result.gameName || `Game ${result.gameId}`}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {result.playerCount} players
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Winners:</span>{' '}
                {result.winners.length > 0 ? result.winners.join(', ') : 'No winners recorded'}
              </div>
              
              <div className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Played:</span> {formatDate(result.playedAt)}
              </div>
              
              {result.notes && (
                <div className="text-sm text-gray-600 bg-gray-50 rounded p-2 mt-2">
                  <span className="font-medium">Notes:</span> {result.notes}
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 ml-4">
              {onView && (
                <button
                  onClick={() => onView(result.id)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View
                </button>
              )}
              
              {onEdit && (
                <button
                  onClick={() => onEdit(result)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this game result?')) {
                      onDelete(result.id)
                    }
                  }}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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