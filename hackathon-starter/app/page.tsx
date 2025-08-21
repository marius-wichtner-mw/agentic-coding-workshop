import Link from 'next/link'
import FeatureCard from '@/components/FeatureCard'

export default function Home() {
  const features = [
    {
      title: "User Management",
      description: "Create accounts and manage player profiles with ease",
      icon: "👤"
    },
    {
      title: "Game Tracking",
      description: "Track results across video games, table games, and card games",
      icon: "🎮"
    },
    {
      title: "Scoreboards",
      description: "View rankings and compete with friends on leaderboards",
      icon: "🏆"
    },
    {
      title: "RESTful API",
      description: "Complete API with interactive Swagger documentation",
      icon: "🔌"
    },
    {
      title: "Real-time Results",
      description: "Submit and view game results instantly",
      icon: "⚡"
    },
    {
      title: "Data Persistence",
      description: "SQLite database ensures your data is always saved",
      icon: "💾"
    }
  ]

  return (
    <main className="py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center mb-16">
        <div className="mb-8">
          <span className="text-6xl mb-4 block">🎮</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Game Tracker
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The ultimate platform for tracking game results, managing tournaments, 
            and competing with friends across all types of games.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/auth"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Get Started
          </Link>
          <Link 
            href="/api-docs"
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            View API Docs
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Game Tracker?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to organize gaming competitions and track player performance
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto text-center mt-16 py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Tracking?</h2>
        <p className="text-lg text-gray-600 mb-8">
          Join thousands of gamers already using Game Tracker to organize their competitions
        </p>
        <Link 
          href="/auth"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
        >
          Create Your Account
        </Link>
      </section>
    </main>
  )
}
