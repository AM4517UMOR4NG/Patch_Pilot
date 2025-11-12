import { Link } from 'react-router-dom'
import { Repo } from '../api/types'

interface RepoCardProps {
  repo: Repo
}

export default function RepoCard({ repo }: RepoCardProps) {
  return (
    <Link
      to={`/repos/${repo.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
    >
      <h3 className="text-lg font-semibold mb-2">{repo.name}</h3>
      <p className="text-gray-600 text-sm mb-2">{repo.cloneUrl}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Branch: {repo.defaultBranch || 'main'}
        </span>
        <span className="text-xs text-gray-400">
          Updated: {new Date(repo.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  )
}
