'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Avatar } from './Avatar'

export function Navbar({ user }: { user: any }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loggingOut, setLoggingOut] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (path: string) => pathname.startsWith(path)

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-white/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-2.5 group">
          <div className="relative w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-200/50 group-hover:shadow-indigo-300/60 transition-all duration-300 group-hover:scale-105">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span className="text-lg font-extrabold tracking-tight hidden sm:block">
            <span className="text-gray-900">Social</span><span className="gradient-text">Connect</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden sm:flex items-center gap-1 bg-white/50 rounded-2xl p-1.5 border border-white/60">
          <Link
            href="/feed"
            className={`relative px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              isActive('/feed')
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isActive('/feed') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Feed
            </span>
          </Link>

          {user && (
            <Link
              href={`/profile/${user.id}`}
              className={`relative px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isActive('/profile')
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isActive('/profile') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profile
              </span>
            </Link>
          )}
        </div>

        {/* Right - User Menu */}
        <div className="flex items-center gap-3">
          {/* Mobile nav links */}
          <div className="flex sm:hidden items-center gap-1">
            <Link href="/feed" className={`p-2.5 rounded-xl transition-all ${isActive('/feed') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isActive('/feed') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </Link>
            {user && (
              <Link href={`/profile/${user.id}`} className={`p-2.5 rounded-xl transition-all ${isActive('/profile') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isActive('/profile') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            )}
          </div>

          {/* User avatar dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-white/60 transition-all duration-200 border border-transparent hover:border-white/60"
            >
              <Avatar url={user?.avatar_url} size="sm" className="w-9 h-9 ring-2 ring-white/80 shadow-sm" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-gray-500 transition-transform duration-200 hidden sm:block ${menuOpen ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 glass-card rounded-2xl py-2 animate-scale-in z-50 shadow-xl">
                {user && (
                  <div className="px-4 py-3 border-b border-gray-100/60">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.first_name || user.username}</p>
                    <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                  </div>
                )}
                {user && (
                  <Link
                    href={`/profile/${user.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    My Profile
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
