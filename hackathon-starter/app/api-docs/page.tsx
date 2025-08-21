'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchApiSpec = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/swagger')
      if (!response.ok) {
        throw new Error('Failed to load API documentation')
      }
      const data = await response.json()
      setSpec(data)
    } catch (err) {
      setError('Failed to load API documentation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApiSpec()
  }, [])

  if (loading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
            <p className="text-gray-600 mt-2">Interactive API documentation for Game Tracker</p>
          </div>
          <LoadingSpinner size="lg" text="Loading API documentation..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
            <p className="text-gray-600 mt-2">Interactive API documentation for Game Tracker</p>
          </div>
          <ErrorMessage message={error} onRetry={fetchApiSpec} />
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
          <p className="text-gray-600 mt-2">
            Interactive API documentation for the Game Tracker application
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <SwaggerUI spec={spec} />
        </div>
      </div>
    </div>
  )
}