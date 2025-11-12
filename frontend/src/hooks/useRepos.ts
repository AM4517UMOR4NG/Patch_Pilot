import { useQuery } from '@tanstack/react-query'
import api from '../api/client'

interface Repo {
  id: number
  name: string
  cloneUrl: string
  defaultBranch?: string
  pullRequestsCount?: number
  findingsCount?: number
  patchesApplied?: number
  createdAt?: string
  updatedAt?: string
}

export function useRepos() {
  return useQuery<Repo[]>({
    queryKey: ['repos'],
    queryFn: async () => {
      const response = await api.get('/repos')
      return response.data
    },
  })
}
