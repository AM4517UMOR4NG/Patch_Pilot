const TOKEN_KEY = 'auth_token'

export function setToken(token: string): void {
  // TODO: For production, use HttpOnly cookies instead of localStorage
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}
