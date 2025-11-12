import { useMutation } from '@tanstack/react-query'
import client from '../api/client'
import { AuthRequest, AuthResponse } from '../api/types'
import { setToken } from '../utils/auth'

export function useLogin() {
  return useMutation({
    mutationFn: async (data: AuthRequest) => {
      const response = await client.post<AuthResponse>('/auth/login', data)
      return response.data
    },
    onSuccess: (data) => {
      setToken(data.token)
    },
  })
}
