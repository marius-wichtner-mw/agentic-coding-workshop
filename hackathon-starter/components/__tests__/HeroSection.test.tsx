import { render, screen } from '@testing-library/react'
import HeroSection from '../HeroSection'

describe('HeroSection', () => {
  it('renders the hero section with title and description', () => {
    render(<HeroSection />)
    
    expect(screen.getByText('Hackathon Starter')).toBeInTheDocument()
    expect(screen.getByText(/A simple Next.js starter template/)).toBeInTheDocument()
  })

  it('renders call-to-action buttons', () => {
    render(<HeroSection />)
    
    expect(screen.getByText('Get Started')).toBeInTheDocument()
    expect(screen.getByText('View Docs')).toBeInTheDocument()
  })

  it('applies correct styling to the title', () => {
    render(<HeroSection />)
    const title = screen.getByText('Hackathon Starter')
    
    expect(title).toHaveClass('text-5xl', 'font-bold')
  })
})