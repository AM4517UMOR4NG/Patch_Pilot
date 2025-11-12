import { Link } from 'react-router-dom'
import { PullRequest } from '../api/types'

interface PRCardProps {
  pr: PullRequest
}

export default function PRCard({ pr }: PRCardProps) {
  return (
    <Link
      to={`/pullrequests/${pr.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">#{pr.prNumber} {pr.title}</h3>
        <span className={`px-2 py-1 text-xs rounded ${
          pr.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {pr.status}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{pr.description}</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>By {pr.author}</span>
        <span>{pr.sourceBranch} → {pr.targetBranch}</span>
      </div>
    </Link>
  )
}
