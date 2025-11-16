import React from 'react'
import {
  healthCheck,
  syncPullRequest,
  getRepos,
  getPullRequestsByRepo,
  getRunsByPullRequest,
  RunDto,
  FindingDto,
} from './api'

function parseGitHubPrInput(input: string): { owner: string; repo: string; prNumber: number } | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const urlMatch = trimmed.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i)
  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repo: urlMatch[2],
      prNumber: Number(urlMatch[3]),
    }
  }

  const shortMatch = trimmed.match(/^([^/]+)\/([^#]+)#(\d+)$/i)
  if (shortMatch) {
    return {
      owner: shortMatch[1],
      repo: shortMatch[2],
      prNumber: Number(shortMatch[3]),
    }
  }

  return null
}

async function findLatestRunForPr(
  owner: string,
  repo: string,
  prNumber: number,
): Promise<{ run: RunDto | null; pullRequestId: number | null }> {
  const repos = await getRepos()
  const fullName = `${owner}/${repo}`.toLowerCase()
  const repoMatch = repos.find((r) => r.name.toLowerCase() === fullName)
  if (!repoMatch) {
    return { run: null, pullRequestId: null }
  }

  const pullRequests = await getPullRequestsByRepo(repoMatch.id)
  const pr = pullRequests.find((p) => p.prNumber === prNumber)
  if (!pr) {
    return { run: null, pullRequestId: null }
  }

  const runs = await getRunsByPullRequest(pr.id)
  if (!runs.length) {
    return { run: null, pullRequestId: pr.id }
  }

  const sorted = [...runs].sort((a, b) => {
    const aDate = new Date(a.completedAt || a.startedAt || 0).getTime()
    const bDate = new Date(b.completedAt || b.startedAt || 0).getTime()
    return bDate - aDate
  })

  return { run: sorted[0], pullRequestId: pr.id }
}

async function pollForCompletedRun(
  owner: string,
  repo: string,
  prNumber: number,
  opts: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<RunDto | null> {
  const timeoutMs = opts.timeoutMs ?? 90000
  const intervalMs = opts.intervalMs ?? 3000
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    const { run } = await findLatestRunForPr(owner, repo, prNumber)
    if (run && (run.status === 'COMPLETED' || run.status === 'FAILED')) {
      return run
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  return null
}

export default function App() {
  const [backendStatus, setBackendStatus] = React.useState<'UP' | 'DOWN' | 'checking...'>('checking...')
  const [prInput, setPrInput] = React.useState('')
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [info, setInfo] = React.useState<string | null>(null)
  const [run, setRun] = React.useState<RunDto | null>(null)

  React.useEffect(() => {
    healthCheck()
      .then((ok: boolean) => setBackendStatus(ok ? 'UP' : 'DOWN'))
      .catch(() => setBackendStatus('DOWN'))
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setInfo(null)
    setRun(null)

    const parsed = parseGitHubPrInput(prInput)
    if (!parsed) {
      setError('Please enter a valid GitHub pull request URL, e.g. https://github.com/owner/repo/pull/123')
      return
    }

    setIsAnalyzing(true)

    try {
      setInfo('Syncing pull request and starting analysis...')
      await syncPullRequest(parsed.owner, parsed.repo, parsed.prNumber)

      setInfo('Waiting for analysis to complete...')
      const completedRun = await pollForCompletedRun(parsed.owner, parsed.repo, parsed.prNumber)

      if (!completedRun) {
        setError('Timed out waiting for analysis results. Please try again in a moment.')
      } else {
        setRun(completedRun)
        if (completedRun.status === 'FAILED') {
          setError(completedRun.errorMessage || 'Analysis run failed')
        } else {
          setInfo('Analysis completed successfully.')
        }
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unexpected error while analyzing pull request'
      setError(message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const files: string[] =
    run?.findings && run.findings.length > 0
      ? Array.from(new Set(run.findings.map((f: FindingDto) => f.filePath)))
      : []

  return (
    <div style={{ fontFamily: 'system-ui, Arial', padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <h1>Patch Pilot</h1>
      <p>
        Backend health: <strong>{backendStatus}</strong>
      </p>
      <p>
        API base: <code>{import.meta.env.VITE_API_BASE_URL || '/api'}</code>
      </p>

      <hr style={{ margin: '24px 0' }} />

      <h2>Analyze a GitHub Pull Request</h2>
      <p style={{ maxWidth: 640 }}>
        Paste a GitHub pull request URL below. The backend will fetch the PR, clone the repository, analyze the code, and
        return findings and recommendations.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: 16, marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          GitHub PR URL
          <input
            type="url"
            value={prInput}
            onChange={(e) => setPrInput(e.target.value)}
            placeholder="https://github.com/owner/repo/pull/123"
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            required
          />
        </label>
        <button type="submit" disabled={isAnalyzing} style={{ padding: '8px 16px', marginTop: 8 }}>
          {isAnalyzing ? 'Analyzing…' : 'Analyze PR'}
        </button>
      </form>

      {info && (
        <p style={{ color: '#2563eb', marginBottom: 8 }}>
          <strong>{info}</strong>
        </p>
      )}

      {error && (
        <p style={{ color: '#b91c1c', marginBottom: 16 }}>
          <strong>{error}</strong>
        </p>
      )}

      {run && (
        <div style={{ marginTop: 24 }}>
          <h3>Analysis Run</h3>
          <p>
            Status: <strong>{run.status}</strong>
          </p>
          {run.errorMessage && (
            <p>
              Error: <code>{run.errorMessage}</code>
            </p>
          )}

          {files.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4>Files involved</h4>
              <ul>
                {files.map((file) => (
                  <li key={file}>
                    <code>{file}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {run.findings && run.findings.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h4>Findings &amp; Recommendations</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {run.findings.map((finding) => (
                  <li
                    key={finding.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: 4,
                      padding: 12,
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ marginBottom: 4 }}>
                      <strong>{finding.title}</strong>{' '}
                      <span style={{ fontSize: 12, color: '#6b7280' }}>
                        ({finding.severity} · {finding.category})
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#374151', marginBottom: 4 }}>
                      <code>{finding.filePath}</code>
                      {finding.lineNumber != null && (
                        <>
                          {' '}
                          · line {finding.lineNumber}
                          {finding.endLineNumber && finding.endLineNumber !== finding.lineNumber
                            ? `–${finding.endLineNumber}`
                            : ''}
                        </>
                      )}
                    </div>
                    {finding.description && <p style={{ marginBottom: 4 }}>{finding.description}</p>}
                    {finding.codeSnippet && (
                      <pre
                        style={{
                          background: '#f3f4f6',
                          padding: 8,
                          borderRadius: 4,
                          fontSize: 12,
                          overflowX: 'auto',
                        }}
                      >
                        <code>{finding.codeSnippet}</code>
                      </pre>
                    )}
                    {finding.suggestedPatches && finding.suggestedPatches.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <strong>Suggested patches:</strong>
                        <ul>
                          {finding.suggestedPatches.map((patch) => (
                            <li key={patch.id} style={{ fontSize: 13 }}>
                              {patch.explanation && <div>{patch.explanation}</div>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {run && (!run.findings || run.findings.length === 0) && <p>No issues were found in this pull request.</p>}
        </div>
      )}
    </div>
  )
}
