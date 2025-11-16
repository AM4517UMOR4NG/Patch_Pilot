const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '/api'

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/actuator/health`)
    if (!res.ok) return false
    const data = await res.json()
    return data?.status === 'UP'
  } catch {
    return false
  }
}

export interface PrSyncResponse {
  success: boolean
  repository?: string
  prNumber?: number
  prTitle?: string
  prAuthor?: string
  message?: string
  error?: string
}

export interface RepoDto {
  id: number
  name: string
  cloneUrl: string
}

export interface SuggestedPatchDto {
  id: number
  findingId: number
  unifiedDiff?: string
  explanation?: string
  applied?: boolean
}

export interface FindingDto {
  id: number
  runId: number
  filePath: string
  lineNumber?: number | null
  endLineNumber?: number | null
  severity: string
  category: string
  title: string
  description?: string
  codeSnippet?: string
  isResolved?: boolean
  suggestedPatches?: SuggestedPatchDto[]
}

export type RunStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | string

export interface RunDto {
  id: number
  pullRequestId: number
  status: RunStatus
  commitSha?: string
  triggeredBy?: string
  startedAt?: string | null
  completedAt?: string | null
  errorMessage?: string | null
  findings?: FindingDto[]
}

export interface PullRequestDto {
  id: number
  repoId: number
  prNumber: number
  title: string
  description?: string
  author?: string
  status?: string
}

export async function syncPullRequest(
  owner: string,
  repo: string,
  prNumber: number,
): Promise<PrSyncResponse> {
  const res = await fetch(
    `${API_BASE}/github/sync/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pr/${prNumber}`,
    { method: 'POST' },
  )

  if (!res.ok) {
    throw new Error(`Failed to sync PR (status ${res.status})`)
  }

  return (await res.json()) as PrSyncResponse
}

export async function getRepos(): Promise<RepoDto[]> {
  const res = await fetch(`${API_BASE}/repos`)
  if (!res.ok) {
    throw new Error('Failed to load repositories')
  }
  return (await res.json()) as RepoDto[]
}

export async function getPullRequestsByRepo(repoId: number): Promise<PullRequestDto[]> {
  const res = await fetch(`${API_BASE}/pullrequests/repo/${repoId}`)
  if (!res.ok) {
    throw new Error('Failed to load pull requests')
  }
  return (await res.json()) as PullRequestDto[]
}

export async function getRunsByPullRequest(pullRequestId: number): Promise<RunDto[]> {
  const res = await fetch(`${API_BASE}/runs/pull-request/${pullRequestId}`)
  if (!res.ok) {
    throw new Error('Failed to load runs for pull request')
  }
  return (await res.json()) as RunDto[]
}
