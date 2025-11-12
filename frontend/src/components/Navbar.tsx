import { Link, useNavigate, useLocation } from 'react-router-dom'
import { removeToken, getToken } from '../utils/auth'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = !!getToken()

  const handleLogout = () => {
    removeToken()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <svg className="h-8 w-8 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white text-xl font-bold">Patch Pilot</span>
            </Link>
            
            {isAuthenticated && (
              <div className="ml-10 flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/repos/new"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/repos/new')
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Add Repository
                </Link>
                <Link
                  to="/settings"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/settings')
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Settings
                </Link>
              </div>
            )}
          </div>

          {isAuthenticated && (
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
