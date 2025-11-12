export interface User {
  id: number
  username: string
  email: string
  fullName: string
}

export interface Repo {
  id: number
  name: string
  cloneUrl: string
  defaultBranch?: string
  webhookSecret?: string
  createdAt: string
  updatedAt: string
}

export interface PullRequest {
  id: number
  repoId: number
  prNumber: number
  title: string
  description?: string
  author: string
  sourceBranch: string
  targetBranch: string
  status: string
  createdAt: string
  updatedAt: string
  mergedAt?: string
  closedAt?: string
}

export interface Run {
  id: number
  pullRequestId: number
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  commitSha: string
  triggeredBy: string
  startedAt: string
  completedAt?: string
  errorMessage?: string
  findings?: Finding[]
}

export interface Finding {
  id: number
  runId: number
  filePath: string
  lineNumber?: number
  endLineNumber?: number
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  category: string
  title: string
  description: string
  codeSnippet?: string
  isResolved: boolean
  createdAt: string
  suggestedPatches?: SuggestedPatch[]
}

export interface SuggestedPatch {
  id: number
  findingId: number
  unifiedDiff: string
  explanation: string
  applied: boolean
  appliedAt?: string
  appliedBy?: string
  createdAt: string
}

export interface AuthRequest {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  username: string
  expiresIn: number
}
