import { useNavigate } from 'react-router-dom'
import { removeToken } from '../utils/auth'
import { useEffect } from 'react'

export default function Settings() {
  const navigate = useNavigate()

  // Generate animated stars
  useEffect(() => {
    const starsContainer = document.querySelector('.stars-container')
    if (!starsContainer) return

    // Clear existing stars
    starsContainer.innerHTML = ''

    // Generate regular stars - increased count for more coverage
    const starCount = 300
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div')
      const size = Math.random() > 0.8 ? 'large' : Math.random() > 0.5 ? 'medium' : 'small'
      star.className = `star ${size}`
      star.style.left = `${Math.random() * 100}%`
      star.style.top = `${Math.random() * 100}%`
      star.style.animationDelay = `${Math.random() * 3}s`
      star.style.animationDuration = `${2 + Math.random() * 3}s`
      starsContainer.appendChild(star)
    }

    // Generate shooting stars - more frequent
    for (let i = 0; i < 6; i++) {
      const shootingStar = document.createElement('div')
      shootingStar.className = 'shooting-star'
      shootingStar.style.left = `${Math.random() * 150}%`
      shootingStar.style.top = `${Math.random() * 100}%`
      shootingStar.style.animationDelay = `${Math.random() * 8}s`
      shootingStar.style.animationDuration = `${3 + Math.random() * 2}s`
      starsContainer.appendChild(shootingStar)
    }

    // Add some extra large stars for depth
    for (let i = 0; i < 20; i++) {
      const star = document.createElement('div')
      star.className = 'star large'
      star.style.left = `${Math.random() * 100}%`
      star.style.top = `${Math.random() * 100}%`
      star.style.animationDelay = `${Math.random() * 4}s`
      star.style.animationDuration = `${3 + Math.random() * 2}s`
      star.style.width = '4px'
      star.style.height = '4px'
      star.style.boxShadow = '0 0 15px rgba(255, 255, 255, 1)'
      starsContainer.appendChild(star)
    }
  }, [])

  const handleLogout = () => {
    removeToken()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Stars Background - Full Screen */}
      <div className="fixed inset-0 z-0">
        <div className="stars-container"></div>
      </div>
      
      {/* Content Container */}
      <div className="relative z-10">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header dengan gradient background */}
          <div className="relative overflow-hidden mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 opacity-90"></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative px-6 py-4 rounded-2xl">
              <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200">
                  ⚙️ Settings
                </span>
              </h1>
              <p className="text-blue-100 mt-2">Manage your account and application settings</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                User Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-gray-300 font-medium">Username:</span>
                  <span className="text-white font-mono">{localStorage.getItem('username') || 'admin'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-gray-300 font-medium">Role:</span>
                  <span className="text-white font-mono">Administrator</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                API Configuration
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-gray-300 font-medium">API URL:</span>
                  <span className="text-white font-mono text-sm">{import.meta.env.VITE_API_BASE_URL || '/api'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-gray-300 font-medium">Webhook URL:</span>
                  <span className="text-white font-mono text-sm">/webhooks/github</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Actions
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
