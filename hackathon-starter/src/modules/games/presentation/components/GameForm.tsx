'use client'

import { useState } from 'react'
import { GameType } from '@/src/shared/types/common'

interface GameFormProps {
  onSubmit: (name: string, type: GameType, imageData?: string) => void
  initialName?: string
  initialType?: GameType
  initialImageData?: string
  submitLabel?: string
  isLoading?: boolean
}

export default function GameForm({ 
  onSubmit, 
  initialName = '', 
  initialType = 'video_game',
  initialImageData = '',
  submitLabel = 'Create Game',
  isLoading = false 
}: GameFormProps) {
  const [name, setName] = useState(initialName)
  const [type, setType] = useState<GameType>(initialType)
  const [imageData, setImageData] = useState(initialImageData)
  const [errors, setErrors] = useState<string[]>([])

  const gameTypes: { value: GameType; label: string }[] = [
    { value: 'video_game', label: 'Video Game' },
    { value: 'table_game', label: 'Table Game' },
    { value: 'card_game', label: 'Card Game' },
  ]

  const validateForm = (): string[] => {
    const errors: string[] = []
    
    if (!name || name.trim().length === 0) {
      errors.push('Game name is required')
    }
    
    if (name.length < 2) {
      errors.push('Game name must be at least 2 characters long')
    }
    
    if (name.length > 100) {
      errors.push('Game name must be less than 100 characters')
    }
    
    if (!type) {
      errors.push('Game type is required')
    }
    
    return errors
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(['Image size must be less than 5MB'])
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setErrors(['Please select a valid image file'])
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImageData(result)
        setErrors([])
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    setErrors(validationErrors)
    
    if (validationErrors.length === 0) {
      onSubmit(name, type, imageData || undefined)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Game Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter game name"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Game Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as GameType)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        >
          {gameTypes.map((gameType) => (
            <option key={gameType.value} value={gameType.value}>
              {gameType.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Game Image (Optional)
        </label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
        {imageData && (
          <div className="mt-2">
            <img
              src={imageData}
              alt="Game preview"
              className="w-20 h-20 object-cover rounded-md border"
            />
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div className="mt-2">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}
      
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