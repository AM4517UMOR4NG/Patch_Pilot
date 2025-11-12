import { Repo } from '../api/types'
import RepoCard from './RepoCard'

interface RepoListProps {
  repos: Repo[]
}

export default function RepoList({ repos }: RepoListProps) {
  if (repos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No repositories found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {repos.map((repo) => (
        <RepoCard key={repo.id} repo={repo} />
      ))}
    </div>
  )
}
