export default function HeroSection() {
  return (
    <section className="text-center py-20">
      <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Hackathon Starter
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        A simple Next.js starter template to kickstart your hackathon project. 
        Focus on building, not setup.
      </p>
      <div className="mt-8 flex gap-4 justify-center">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Get Started
        </button>
        <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          View Docs
        </button>
      </div>
    </section>
  )
}