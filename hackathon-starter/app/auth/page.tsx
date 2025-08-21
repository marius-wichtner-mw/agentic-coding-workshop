'use client'

import { useState } from 'react'
import UserRegistration from '@/components/UserRegistration'
import UserProfile from '@/components/UserProfile'

interface User {
  id: number
  username: string
  created_at: string
}

export default function AuthPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const handleRegistrationSuccess = (user: User) => {
    setCurrentUser(user)
  }

  const handleProfileUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser)
  }

  const handleLogout = () => {
    setCurrentUser(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Game Tracker</h1>
          <p className="mt-2 text-gray-600">Track your game results and compete with friends</p>
        </div>

        {currentUser ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700">Welcome back, <span className="font-semibold">{currentUser.username}</span>!</p>
              <button
                onClick={handleLogout}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Switch User
              </button>
            </div>
            
            <UserProfile 
              user={currentUser} 
              onUpdate={handleProfileUpdate}
            />
          </div>
        ) : (
          <UserRegistration onSuccess={handleRegistrationSuccess} />
        )}
      </div>
    </div>
  )
}