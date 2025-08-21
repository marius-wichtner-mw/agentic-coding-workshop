import HeroSection from '@/components/HeroSection'
import FeatureCard from '@/components/FeatureCard'

export default function Home() {
  const features = [
    {
      title: "Fast Setup",
      description: "Get started quickly with pre-configured tools",
      icon: "⚡"
    },
    {
      title: "TypeScript Ready",
      description: "Full TypeScript support out of the box",
      icon: "📘"
    },
    {
      title: "Testing Included",
      description: "Jest and React Testing Library pre-configured",
      icon: "✅"
    }
  ]

  return (
    <main className="min-h-screen p-8">
      <HeroSection />
      
      <section className="max-w-6xl mx-auto mt-16">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>
    </main>
  )
}
