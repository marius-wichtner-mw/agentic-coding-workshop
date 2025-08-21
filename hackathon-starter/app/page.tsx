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
            Built with Next.js, TypeScript, Prisma, and following clean architecture principles.
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
            <button 
              disabled
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Result Tracking</h3>
            <p className="text-gray-600 mb-4">Submit game results with multiple players, scores, and automatic winner detection.</p>
            <button 
              disabled
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Scoreboards</h3>
            <p className="text-gray-600 mb-4">View rankings and statistics with automatic scoreboard updates.</p>
            <button 
              disabled
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Architecture Info */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Architecture & Implementation</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Clean Architecture</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• <strong>Domain Layer:</strong> Business entities and rules</li>
                <li>• <strong>Application Layer:</strong> Use cases and services</li>
                <li>• <strong>Infrastructure Layer:</strong> Database and external services</li>
                <li>• <strong>Presentation Layer:</strong> UI components and API routes</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Development Practices</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• <strong>TDD:</strong> Test-driven development approach</li>
                <li>• <strong>SOLID:</strong> Following SOLID principles</li>
                <li>• <strong>Feature-based:</strong> Modular architecture by domain</li>
                <li>• <strong>Type Safety:</strong> Full TypeScript implementation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚀 Phase 1 & 2 Complete!</h3>
          <p className="text-blue-800">
            The foundation and Users module have been implemented following clean architecture principles with comprehensive testing. 
            The user management system is fully functional with CRUD operations, validation, and a clean UI.
          </p>
        </div>
      </div>
    </main>
  )
}
