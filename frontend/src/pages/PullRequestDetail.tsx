import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { usePullRequest, useRuns, useApplyPatch } from '../hooks/useApi'
import FindingList from '../components/FindingList'
import Loading from '../components/Loading'
import Toast from '../components/Toast'

export default function PullRequestDetail() {
  const { prId } = useParams<{ prId: string }>()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const { data: pr } = usePullRequest(prId!)
  const { data: runs, isLoading } = useRuns(prId!)
  const applyPatchMutation = useApplyPatch()

  const handleApplyPatch = (patchId: number) => {
    applyPatchMutation.mutate(
      { prId: prId!, patchId },
      {
        onSuccess: () => {
          setToast({ message: 'Patch applied successfully', type: 'success' })
        },
        onError: () => {
          setToast({ message: 'Failed to apply patch', type: 'error' })
        },
      }
    )
  }

  if (isLoading) return <Loading />

  const allFindings = runs?.flatMap(run => run.findings || []) || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {pr && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4">#{pr.prNumber} {pr.title}</h1>
          <p className="text-gray-600 mb-2">{pr.description}</p>
          <div className="text-sm text-gray-500">
            <span>Author: {pr.author}</span> • 
            <span> {pr.sourceBranch} → {pr.targetBranch}</span> • 
            <span> Status: {pr.status}</span>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Runs ({runs?.length || 0})</h2>
        {runs?.map(run => (
          <div key={run.id} className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Run #{run.id}</span>
              <span className={`px-2 py-1 text-xs rounded ${
                run.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                run.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {run.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Commit: {run.commitSha?.substring(0, 7)} • Triggered by: {run.triggeredBy}
            </p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Findings ({allFindings.length})</h2>
        <FindingList findings={allFindings} onApplyPatch={handleApplyPatch} />
      </div>
    </div>
  )
}
