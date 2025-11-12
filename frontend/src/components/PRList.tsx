import { PullRequest } from '../api/types'
import PRCard from './PRCard'

interface PRListProps {
  pullRequests: PullRequest[]
}

export default function PRList({ pullRequests }: PRListProps) {
  if (pullRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No pull requests found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pullRequests.map((pr) => (
        <PRCard key={pr.id} pr={pr} />
      ))}
    </div>
  )
}
