import { useParams } from 'react-router-dom'
import { useRun } from '../hooks/useApi'
import FindingList from '../components/FindingList'
import Loading from '../components/Loading'

export default function RunDetail() {
  const { runId } = useParams<{ runId: string }>()
  const { data: run, isLoading } = useRun(runId!)

  if (isLoading) return <Loading />
  if (!run) return <div>Run not found</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">Run #{run.id}</h1>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className={`font-semibold ${
              run.status === 'COMPLETED' ? 'text-green-600' :
              run.status === 'FAILED' ? 'text-red-600' : 'text-yellow-600'
            }`}>{run.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Commit SHA</p>
            <p className="font-mono">{run.commitSha}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Triggered By</p>
            <p>{run.triggeredBy}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Started At</p>
            <p>{new Date(run.startedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Findings ({run.findings?.length || 0})</h2>
        {run.findings && <FindingList findings={run.findings} />}
      </div>
    </div>
  )
}
