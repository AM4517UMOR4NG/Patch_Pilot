import { useQuery, useMutation } from '@tanstack/react-query'
import client from '../api/client'
import { Repo, PullRequest, Run } from '../api/types'

export function useRepos() {
  return useQuery({
    queryKey: ['repos'],
    queryFn: async () => {
      const response = await client.get<Repo[]>('/repos')
      return response.data
    },
  })
}

export function useRepo(id: string) {
  return useQuery({
    queryKey: ['repos', id],
    queryFn: async () => {
      const response = await client.get<Repo>(`/repos/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function usePullRequests(repoId: string) {
  return useQuery({
    queryKey: ['pullrequests', repoId],
    queryFn: async () => {
      const response = await client.get<PullRequest[]>(`/pullrequests/repo/${repoId}`)
      return response.data
    },
    enabled: !!repoId,
  })
}

export function usePullRequest(id: string) {
  return useQuery({
    queryKey: ['pullrequests', id],
    queryFn: async () => {
      const response = await client.get<PullRequest>(`/pullrequests/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useRun(id: string) {
  return useQuery({
    queryKey: ['runs', id],
    queryFn: async () => {
      const response = await client.get<Run>(`/runs/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useRuns(pullRequestId: string) {
  return useQuery({
    queryKey: ['runs', 'pr', pullRequestId],
    queryFn: async () => {
      const response = await client.get<Run[]>(`/runs/pull-request/${pullRequestId}`)
      return response.data
    },
    enabled: !!pullRequestId,
  })
}

export function useApplyPatch() {
  return useMutation({
    mutationFn: async ({ prId, patchId }: { prId: string; patchId: number }) => {
      const response = await client.post(`/pullrequests/${prId}/apply-patch`, { patchId })
      return response.data
    },
  })
}

export function useCreateRepo() {
  return useMutation({
    mutationFn: async (data: Partial<Repo>) => {
      const response = await client.post<Repo>('/repos', data)
      return response.data
    },
  })
}
