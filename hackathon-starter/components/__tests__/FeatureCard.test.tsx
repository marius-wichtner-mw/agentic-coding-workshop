import { render, screen } from '@testing-library/react'
import FeatureCard from '../FeatureCard'

describe('FeatureCard', () => {
  const mockProps = {
    title: 'Test Feature',
    description: 'This is a test description',
    icon: '🧪'
  }

  it('renders the feature card with all props', () => {
    render(<FeatureCard {...mockProps} />)
    
    expect(screen.getByText(mockProps.title)).toBeInTheDocument()
    expect(screen.getByText(mockProps.description)).toBeInTheDocument()
    expect(screen.getByText(mockProps.icon)).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    const { container } = render(<FeatureCard {...mockProps} />)
    const card = container.firstChild
    
    expect(card).toHaveClass('p-6', 'border', 'rounded-lg')
  })
})