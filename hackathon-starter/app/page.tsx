import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Game Results Tracking Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track game results across different types of games with scoreboards and player rankings.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
            <p className="text-gray-600 mb-4">Create and manage user accounts with simple username-based authentication.</p>
            <Link 
              href="/users"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Manage Users
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-4">🎮</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Game Management</h3>
            <p className="text-gray-600 mb-4">Create games with images and categorize them by type (video, table, card games).</p>
            <Link
              href="/games"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Manage Games
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Result Tracking</h3>
            <p className="text-gray-600 mb-4">Submit game results with multiple players, scores, and automatic winner detection.</p>
            <Link
              href="/results"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Manage Results
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Scoreboards</h3>
            <p className="text-gray-600 mb-4">View rankings and statistics with automatic scoreboard updates.</p>
            <Link
              href="/scoreboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Scoreboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
