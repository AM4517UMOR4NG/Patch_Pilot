import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateRepo } from '../hooks/useApi'

export default function NewRepo() {
  const [name, setName] = useState('')
  const [cloneUrl, setCloneUrl] = useState('')
  const [defaultBranch, setDefaultBranch] = useState('main')
  const [webhookSecret, setWebhookSecret] = useState('')
  const navigate = useNavigate()
  const createRepoMutation = useCreateRepo()

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createRepoMutation.mutate(
      { name, cloneUrl, defaultBranch, webhookSecret },
      {
        onSuccess: () => {
          navigate('/dashboard')
        },
      }
    )
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
                  🚀 Register New Repository
                </span>
              </h1>
              <p className="text-blue-100 mt-2">Add a new repository to monitor and analyze</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass-card p-6">
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                Repository Name
              </label>
              <input
                type="text"
                id="name"
                required
                className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-gray-400 shadow-sm focus:border-blue-400 focus:ring-blue-400 focus:bg-white/15 sm:text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="owner/repository"
              />
            </div>

            <div className="glass-card p-6">
              <label htmlFor="cloneUrl" className="block text-sm font-medium text-white mb-2">
                Clone URL
              </label>
              <input
                type="text"
                id="cloneUrl"
                required
                className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-gray-400 shadow-sm focus:border-blue-400 focus:ring-blue-400 focus:bg-white/15 sm:text-sm"
                value={cloneUrl}
                onChange={(e) => setCloneUrl(e.target.value)}
                placeholder="https://github.com/owner/repository.git"
              />
            </div>

            <div className="glass-card p-6">
              <label htmlFor="defaultBranch" className="block text-sm font-medium text-white mb-2">
                Default Branch
              </label>
              <input
                type="text"
                id="defaultBranch"
                className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-gray-400 shadow-sm focus:border-blue-400 focus:ring-blue-400 focus:bg-white/15 sm:text-sm"
                value={defaultBranch}
                onChange={(e) => setDefaultBranch(e.target.value)}
              />
            </div>

            <div className="glass-card p-6">
              <label htmlFor="webhookSecret" className="block text-sm font-medium text-white mb-2">
                Webhook Secret (optional)
              </label>
              <input
                type="text"
                id="webhookSecret"
                className="mt-1 block w-full rounded-md bg-white/10 border-white/20 text-white placeholder-gray-400 shadow-sm focus:border-blue-400 focus:ring-blue-400 focus:bg-white/15 sm:text-sm"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder="Secret for webhook verification"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 border border-white/30 rounded-md text-white hover:bg-white/10 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createRepoMutation.isPending}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-md hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 transition-all duration-300 hover:scale-105"
              >
                {createRepoMutation.isPending ? 'Registering...' : 'Register Repository'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
