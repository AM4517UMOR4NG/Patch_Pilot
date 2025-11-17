import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import Dashboard from './pages/Dashboard'
import InsightsDashboard from './pages/InsightsDashboard'

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#0f0f23' }}>
        {/* Navigation */}
        <nav style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          <div style={{ 
            maxWidth: '1280px', 
            margin: '0 auto', 
            padding: '0 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '4rem'
          }}>
            <Link to="/" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              textDecoration: 'none'
            }}>
              <div style={{
                padding: '0.5rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '0.5rem'
              }}>
                <svg style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #a78bfa, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Patch Pilot
              </span>
            </Link>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Link to="/" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500 }}>
                Home
              </Link>
              <Link to="/analysis" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500 }}>
                Analysis
              </Link>
              <Link to="/dashboard" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500 }}>
                Dashboard
              </Link>
              <Link to="/insights" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500 }}>
                AI Insights
              </Link>
              <a href="/api/swagger-ui.html" target="_blank" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: 500 }}>
                API Docs
              </a>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/insights" element={<InsightsDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
