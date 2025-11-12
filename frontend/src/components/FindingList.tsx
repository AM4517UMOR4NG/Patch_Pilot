import { Finding } from '../api/types'
import FindingCard from './FindingCard'

interface FindingListProps {
  findings: Finding[]
  onApplyPatch?: (patchId: number) => void
}

export default function FindingList({ findings, onApplyPatch }: FindingListProps) {
  if (findings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No findings found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {findings.map((finding) => (
        <FindingCard
          key={finding.id}
          finding={finding}
          onApplyPatch={onApplyPatch}
        />
      ))}
    </div>
  )
}
