import { Link } from 'react-router-dom'
import { useRepos } from '../hooks/useRepos'
import Loading from '../components/Loading'

export default function Dashboard() {
  const { data: repos, isLoading, error } = useRepos()

  if (isLoading) return <Loading />
  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-red-500">Error loading repositories</div>
    </div>
  )

  const stats = {
    totalRepos: repos?.length || 0,
    activePRs: repos?.reduce((acc: number, repo: any) => acc + (repo.pullRequestsCount || 0), 0) || 0,
    totalFindings: repos?.reduce((acc: number, repo: any) => acc + (repo.findingsCount || 0), 0) || 0,
    appliedPatches: repos?.reduce((acc: number, repo: any) => acc + (repo.patchesApplied || 0), 0) || 0
  }

  return (
    <div>
      {/* Header */}
      <div className="glass-card mx-4 mt-4 mb-8 sm:mx-6 lg:mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                🌌 Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-300">Monitor your repositories and code reviews</p>
            </div>
            <Link
              to="/repos/new"
              className="btn-primary inline-flex items-center px-4 py-2 text-sm font-medium"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Repository
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="glass-card p-6 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-600/20 rounded-lg p-3">
                <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Repositories</p>
                <p className="text-2xl font-bold text-white">{stats.totalRepos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-600/20 rounded-lg p-3">
                <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Active PRs</p>
                <p className="text-2xl font-bold text-white">{stats.activePRs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Findings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFindings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Applied Patches</p>
                <p className="text-2xl font-bold text-gray-900">{stats.appliedPatches}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Repository List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Registered Repositories</h2>
          </div>
          {repos && repos.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {repos.map((repo) => (
                <Link
                  key={repo.id}
                  to={`/repos/${repo.id}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{repo.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{repo.cloneUrl}</p>
                    </div>
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">No repositories registered yet</p>
              <Link
                to="/repos/new"
                className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add your first repository
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
