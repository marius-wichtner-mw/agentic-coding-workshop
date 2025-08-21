'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import UserForm from '@/src/modules/users/presentation/components/UserForm'
import UserList from '@/src/modules/users/presentation/components/UserList'

interface User {
  id: number
  username: string
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch users
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/users')
      const data: ApiResponse<User[]> = await response.json()
      
      if (data.success && data.data) {
        setUsers(data.data)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch users' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch users' })
    } finally {
      setIsLoading(false)
    }
  }

  // Create user
  const createUser = async (username: string) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      
      const data: ApiResponse<User> = await response.json()
      
      if (data.success && data.data) {
        setUsers(prev => [...prev, data.data!])
        setMessage({ type: 'success', text: 'User created successfully!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create user' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create user' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update user
  const updateUser = async (username: string) => {
    if (!editingUser) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      
      const data: ApiResponse<User> = await response.json()
      
      if (data.success && data.data) {
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id ? data.data! : user
        ))
        setEditingUser(null)
        setMessage({ type: 'success', text: 'User updated successfully!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update user' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update user' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete user
  const deleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })
      
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setUsers(prev => prev.filter(user => user.id !== userId))
        setMessage({ type: 'success', text: 'User deleted successfully!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete user' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete user' })
    }
  }

  // Load users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="mt-2 text-gray-600">
                Manage users for the Game Results Tracking Platform
              </p>
            </div>
            
            {/* Navigation breadcrumb */}
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <div>
                    <Link href="/" className="text-gray-400 hover:text-gray-500">
                      Home
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-4 text-sm font-medium text-gray-500">
                      Users
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h2>
            <UserForm
              onSubmit={editingUser ? updateUser : createUser}
              initialUsername={editingUser?.username || ''}
              submitLabel={editingUser ? 'Update User' : 'Create User'}
              isLoading={isSubmitting}
            />
            {editingUser && (
              <button
                onClick={() => setEditingUser(null)}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* User List */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Users</h2>
              <button
                onClick={fetchUsers}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            <UserList
              users={users}
              onEdit={setEditingUser}
              onDelete={deleteUser}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}