'use client'

import { useState } from 'react'
import UserRegistration from '@/components/UserRegistration'
import UserLogin from '@/components/UserLogin'
import UserProfile from '@/components/UserProfile'

interface User {
  id: number
  username: string
  created_at: string
}

export default function AuthPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showLogin, setShowLogin] = useState(true)

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user)
  }

  const handleRegistrationSuccess = (user: User) => {
    setCurrentUser(user)
  }

  const handleProfileUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore logout errors
    }
    setCurrentUser(null)
    setShowLogin(true)
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
          <p className="mt-2 text-gray-600">Manage your gaming profile and track your progress</p>
        </div>

        {currentUser ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700">Welcome back, <span className="font-semibold">{currentUser.username}</span>!</p>
              <button
                onClick={handleLogout}
                className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Logout
              </button>
            </div>
            
            <UserProfile 
              user={currentUser} 
              onUpdate={handleProfileUpdate}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {showLogin ? (
              <div className="space-y-4">
                <UserLogin onSuccess={handleLoginSuccess} />
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don&apos;t have an account?
                    <button
                      onClick={() => setShowLogin(false)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Create one
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <UserRegistration onSuccess={()=>handleRegistrationSuccess} />
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      onClick={() => setShowLogin(true)}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      Login here
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}