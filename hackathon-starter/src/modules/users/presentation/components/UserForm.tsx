'use client'

import { useState } from 'react'

interface UserFormProps {
  onSubmit: (username: string) => void
  initialUsername?: string
  submitLabel?: string
  isLoading?: boolean
}

export default function UserForm({ 
  onSubmit, 
  initialUsername = '', 
  submitLabel = 'Create User',
  isLoading = false 
}: UserFormProps) {
  const [username, setUsername] = useState(initialUsername)
  const [errors, setErrors] = useState<string[]>([])

  const validateUsername = (username: string): string[] => {
    const errors: string[] = []
    
    if (!username || username.trim().length === 0) {
      errors.push('Username is required')
    }
    
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long')
    }
    
    if (username.length > 50) {
      errors.push('Username must be less than 50 characters')
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens')
    }
    
    return errors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateUsername(username)
    setErrors(validationErrors)
    
    if (validationErrors.length === 0) {
      onSubmit(username)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter username"
          disabled={isLoading}
        />
        {errors.length > 0 && (
          <div className="mt-2">
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-red-600">
                {error}
              </p>
            ))}
          </div>
        )}
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Loading...' : submitLabel}
      </button>
    </form>
  )
}