import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/Layout'
import PageTransition from './components/PageTransition'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NewRepo from './pages/NewRepo'
import RepoDetail from './pages/RepoDetail'
import PullRequestDetail from './pages/PullRequestDetail'
import RunDetail from './pages/RunDetail'
import Settings from './pages/Settings'
import { createContext, useContext, useState } from 'react'
import { getToken } from './utils/auth'

const AuthContext = createContext<{
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void
}>({
  isAuthenticated: false,
  setIsAuthenticated: () => {}
})

export const useAuth = () => useContext(AuthContext)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken())

  const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <PageTransition>
            <Routes>
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? 
                    <Navigate to="/dashboard" /> : 
                    <Login onLogin={() => setIsAuthenticated(true)} />
                } 
              />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/repos/new" element={<ProtectedRoute><NewRepo /></ProtectedRoute>} />
              <Route path="/repos/:repoId" element={<ProtectedRoute><RepoDetail /></ProtectedRoute>} />
              <Route path="/pullrequests/:prId" element={<ProtectedRoute><PullRequestDetail /></ProtectedRoute>} />
              <Route path="/runs/:runId" element={<ProtectedRoute><RunDetail /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </PageTransition>
        </Router>
      </QueryClientProvider>
    </AuthContext.Provider>
  )
}

export default App
