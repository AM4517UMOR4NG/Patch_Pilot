import { Finding } from '../api/types'

interface FindingCardProps {
  finding: Finding
  onApplyPatch?: (patchId: number) => void
}

export default function FindingCard({ finding, onApplyPatch }: FindingCardProps) {
  const severityColors = {
    INFO: 'bg-blue-100 text-blue-800',
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-lg font-semibold">{finding.title}</h4>
        <span className={`px-2 py-1 text-xs rounded ${severityColors[finding.severity]}`}>
          {finding.severity}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-600">{finding.description}</p>
        <p className="text-sm">
          <span className="font-medium">File:</span> {finding.filePath}
          {finding.lineNumber && ` (Line ${finding.lineNumber}${finding.endLineNumber ? `-${finding.endLineNumber}` : ''})`}
        </p>
        <p className="text-sm">
          <span className="font-medium">Category:</span> {finding.category}
        </p>
      </div>

      {finding.codeSnippet && (
        <pre className="bg-gray-100 p-3 rounded text-sm mb-4 overflow-x-auto">
          <code>{finding.codeSnippet}</code>
        </pre>
      )}

      {finding.suggestedPatches && finding.suggestedPatches.length > 0 && (
        <div className="border-t pt-4">
          <h5 className="font-medium mb-2">Suggested Patches:</h5>
          {finding.suggestedPatches.map((patch) => (
            <div key={patch.id} className="bg-gray-50 rounded p-3 mb-2">
              <p className="text-sm mb-2">{patch.explanation}</p>
              {!patch.applied && onApplyPatch && (
                <button
                  onClick={() => onApplyPatch(patch.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  Apply Patch
                </button>
              )}
              {patch.applied && (
                <span className="text-green-600 text-sm">
                  ✓ Applied by {patch.appliedBy}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
