import { useParams } from 'react-router-dom'
import { useRepo, usePullRequests } from '../hooks/useApi'
import PRList from '../components/PRList'
import Loading from '../components/Loading'

export default function RepoDetail() {
  const { repoId } = useParams<{ repoId: string }>()
  const { data: repo, isLoading: repoLoading } = useRepo(repoId!)
  const { data: pullRequests, isLoading: prLoading } = usePullRequests(repoId!)

  if (repoLoading || prLoading) return <Loading />
  if (!repo) return <div>Repository not found</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{repo.name}</h1>
        <p className="text-gray-600 mb-2">{repo.cloneUrl}</p>
        <p className="text-sm text-gray-500">Default branch: {repo.defaultBranch || 'main'}</p>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Pull Requests</h2>
        {pullRequests && <PRList pullRequests={pullRequests} />}
      </div>
    </div>
  )
}
