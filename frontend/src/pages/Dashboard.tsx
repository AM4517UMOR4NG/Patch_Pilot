import { Link } from 'react-router-dom'
import { useRepos } from '../hooks/useRepos'
import Loading from '../components/Loading'
import { useEffect } from 'react'

export default function Dashboard() {
  const { data: repos, isLoading, error } = useRepos()

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

  if (isLoading) return <Loading />
  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="glass-card p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-red-400 font-medium">Error loading repositories</div>
        <p className="text-gray-400 text-sm mt-2">Please try again later</p>
      </div>
    </div>
  )

  const stats = {
    totalRepos: repos?.length || 0,
    activePRs: repos?.reduce((acc: number, repo: any) => acc + (repo.pullRequestsCount || 0), 0) || 0,
    totalFindings: repos?.reduce((acc: number, repo: any) => acc + (repo.findingsCount || 0), 0) || 0,
    appliedPatches: repos?.reduce((acc: number, repo: any) => acc + (repo.patchesApplied || 0), 0) || 0
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Stars Background - Full Screen */}
      <div className="fixed inset-0 z-0">
        <div className="stars-container"></div>
      </div>
      
      {/* Content Container */}
      <div className="relative z-10">
        {/* Header dengan gradient background */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 opacity-90"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white flex items-center gap-3">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200">
                    🚀 Dashboard
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-blue-100">Monitor your repositories and code reviews</p>
              </div>
              <Link
                to="/repos/new"
                className="group inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium rounded-xl hover:bg-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl self-start lg:self-center"
              >
                <svg className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Repository
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Cards dengan glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8">
          <div className="glass-card p-5 sm:p-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl group">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Repositories</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1 sm:mt-2">{stats.totalRepos}</p>
                <p className="text-xs text-gray-400 mt-1">Active projects</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/30 to-blue-600/30 rounded-lg p-3 sm:p-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 sm:p-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl group">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Active PRs</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1 sm:mt-2">{stats.activePRs}</p>
                <p className="text-xs text-gray-400 mt-1">Pull requests</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/30 to-green-600/30 rounded-lg p-3 sm:p-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 sm:p-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl group">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Findings</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1 sm:mt-2">{stats.totalFindings}</p>
                <p className="text-xs text-gray-400 mt-1">Code issues</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/30 to-orange-600/30 rounded-lg p-3 sm:p-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 sm:p-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl group">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Applied Patches</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1 sm:mt-2">{stats.appliedPatches}</p>
                <p className="text-xs text-gray-400 mt-1">Fixes applied</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/30 to-blue-600/30 rounded-lg p-3 sm:p-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Repository List dengan glassmorphism */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="truncate">Registered Repositories</span>
              </h2>
              <span className="text-sm text-gray-300 bg-white/10 px-3 py-1 rounded-full flex-shrink-0">
                {repos?.length || 0} repos
              </span>
            </div>
          </div>
          {repos && repos.length > 0 ? (
            <div className="divide-y divide-white/10">
              {repos.map((repo) => (
                <Link
                  key={repo.id}
                  to={`/repos/${repo.id}`}
                  className="block px-4 sm:px-6 lg:px-8 py-3 sm:py-4 hover:bg-white/5 transition-all duration-300 group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-blue-300 transition-colors truncate">{repo.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1 font-mono truncate">{repo.cloneUrl}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
                      <div className="text-center lg:text-right min-w-[35px] sm:min-w-[40px]">
                        <p className="text-xs text-gray-400">PRs</p>
                        <p className="text-sm font-medium text-white">{repo.pullRequestsCount || 0}</p>
                      </div>
                      <div className="text-center lg:text-right min-w-[50px] sm:min-w-[60px]">
                        <p className="text-xs text-gray-400">Findings</p>
                        <p className="text-sm font-medium text-white">{repo.findingsCount || 0}</p>
                      </div>
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No repositories yet</h3>
              <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base max-w-md mx-auto">Start by adding your first repository to begin monitoring</p>
              <Link
                to="/repos/new"
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 hover:scale-105 hover:shadow-xl text-sm sm:text-base"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add your first repository
              </Link>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
