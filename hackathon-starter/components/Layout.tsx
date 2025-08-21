'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
	const pathname = usePathname()
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [authLoading, setAuthLoading] = useState(true)

	useEffect(() => {
		let isMounted = true

		const refreshAuth = async () => {
			try {
				const res = await fetch('/api/auth/me', { 
					cache: 'no-store',
					credentials: 'include' // Ensure cookies are included
				})
				if (!isMounted) return
				const newAuthState = res.ok
				setIsAuthenticated(newAuthState)
				setAuthLoading(false)
				console.log('Auth state refreshed:', newAuthState) // Debug log
			} catch (error) {
				if (!isMounted) return
				console.log('Auth check failed:', error) // Debug log
				setIsAuthenticated(false)
				setAuthLoading(false)
			}
		}

		// Initial check
		refreshAuth()

		// React to custom auth change events with small delay to ensure session is updated
		const onAuthChanged = () => {
			console.log('Auth changed event received') // Debug log
			setTimeout(refreshAuth, 100) // Small delay to ensure session is updated
		}
		window.addEventListener('auth:changed', onAuthChanged as EventListener)

		// Also refresh on window focus (covers login in another tab)
		const onFocus = () => refreshAuth()
		window.addEventListener('focus', onFocus)

		// Also refresh on page visibility change
		const onVisibilityChange = () => {
			if (!document.hidden) {
				refreshAuth()
			}
		}
		document.addEventListener('visibilitychange', onVisibilityChange)

		return () => {
			isMounted = false
			window.removeEventListener('auth:changed', onAuthChanged as EventListener)
			window.removeEventListener('focus', onFocus)
			document.removeEventListener('visibilitychange', onVisibilityChange)
		}
	}, [])

	const navItems = [
		{ href: '/', label: 'Home', icon: '🏠' },
		{ href: '/games', label: 'Games', icon: '🎮' },
		...(isAuthenticated ? [{ href: '/auth', label: 'Account', icon: '👤' }] : [] as { href: string; label: string; icon: string }[]),
		{ href: '/api-docs', label: 'API Docs', icon: '📚' },
	]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl">🎮</span>
                <span className="text-xl font-bold text-gray-900">Game Tracker</span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                type="button"
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"
                aria-label="Toggle navigation menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2024 Game Tracker. Built for agentic coding workshop.
            </p>
            <div className="flex space-x-4">
              <Link href="/api-docs" className="text-sm text-gray-500 hover:text-gray-700">
                API Documentation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}