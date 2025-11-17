import React, { useEffect, useState } from 'react'
import {
  getRepos,
  getPullRequestsByRepo,
  getRunsByPullRequest,
  RunDto,
  RepoDto,
  PullRequestDto,
  FindingDto,
} from '../api'
import CodeAnalysis from '../components/CodeAnalysis'
import FindingDetails from '../components/FindingDetails'
import AISuggestions from '../components/AISuggestions'

interface DashboardStats {
  totalAnalyses: number
  criticalIssues: number
  resolvedIssues: number
  avgSecurityScore: number
  avgQualityScore: number
  avgPerformanceScore: number
}

export default function Dashboard() {
  const [repos, setRepos] = useState<RepoDto[]>([])
  const [selectedRepo, setSelectedRepo] = useState<RepoDto | null>(null)
  const [pullRequests, setPullRequests] = useState<PullRequestDto[]>([])
  const [selectedPR, setSelectedPR] = useState<PullRequestDto | null>(null)
  const [runs, setRuns] = useState<RunDto[]>([])
  const [selectedRun, setSelectedRun] = useState<RunDto | null>(null)
  const [selectedFinding, setSelectedFinding] = useState<FindingDto | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalAnalyses: 0,
    criticalIssues: 0,
    resolvedIssues: 0,
    avgSecurityScore: 85,
    avgQualityScore: 78,
    avgPerformanceScore: 82,
  })
  const [loading, setLoading] = useState(false)

  // Load repositories on mount
  useEffect(() => {
    loadRepositories()
  }, [])

  // Load PRs when repo is selected
  useEffect(() => {
    if (selectedRepo) {
      loadPullRequests(selectedRepo.id)
    }
  }, [selectedRepo])

  // Load runs when PR is selected
  useEffect(() => {
    if (selectedPR) {
      loadRuns(selectedPR.id)
    }
  }, [selectedPR])

  const loadRepositories = async () => {
    try {
      const repoData = await getRepos()
      setRepos(repoData)
      if (repoData.length > 0) {
        setSelectedRepo(repoData[0])
      }
    } catch (error) {
      console.error('Failed to load repositories:', error)
    }
  }

  const loadPullRequests = async (repoId: number) => {
    try {
      setLoading(true)
      const prData = await getPullRequestsByRepo(repoId)
      setPullRequests(prData)
      if (prData.length > 0) {
        setSelectedPR(prData[0])
      }
    } catch (error) {
      console.error('Failed to load pull requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRuns = async (prId: number) => {
    try {
      setLoading(true)
      const runData = await getRunsByPullRequest(prId)
      setRuns(runData)
      if (runData.length > 0) {
        setSelectedRun(runData[0])
        calculateStats(runData)
      }
    } catch (error) {
      console.error('Failed to load runs:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (runs: RunDto[]) => {
    let totalCritical = 0
    let totalResolved = 0
    let totalFindings = 0

    runs.forEach(run => {
      if (run.findings) {
        run.findings.forEach(finding => {
          totalFindings++
          if (finding.severity === 'HIGH') totalCritical++
          if (finding.isResolved) totalResolved++
        })
      }
    })

    setStats({
      totalAnalyses: runs.length,
      criticalIssues: totalCritical,
      resolvedIssues: totalResolved,
      avgSecurityScore: 85,
      avgQualityScore: 78,
      avgPerformanceScore: 82,
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)',
      color: '#e6e6e6',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '20px 40px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🚀 Patch Pilot Dashboard
          </h1>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {/* Repository Selector */}
            <select
              value={selectedRepo?.id || ''}
              onChange={(e) => {
                const repo = repos.find(r => r.id === Number(e.target.value))
                setSelectedRepo(repo || null)
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '8px 16px',
                color: '#e6e6e6',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="">Select Repository</option>
              {repos.map(repo => (
                <option key={repo.id} value={repo.id}>{repo.name}</option>
              ))}
            </select>

            {/* PR Selector */}
            {selectedRepo && (
              <select
                value={selectedPR?.id || ''}
                onChange={(e) => {
                  const pr = pullRequests.find(p => p.id === Number(e.target.value))
                  setSelectedPR(pr || null)
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: '#e6e6e6',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <option value="">Select PR</option>
                {pullRequests.map(pr => (
                  <option key={pr.id} value={pr.id}>#{pr.prNumber} - {pr.title}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div style={{
        padding: '20px 40px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
        }}>
          {[
            { label: 'Total Analyses', value: stats.totalAnalyses, color: '#667eea', icon: '📊' },
            { label: 'Critical Issues', value: stats.criticalIssues, color: '#f56565', icon: '🔴' },
            { label: 'Resolved Issues', value: stats.resolvedIssues, color: '#48bb78', icon: '✅' },
            { label: 'Security Score', value: `${stats.avgSecurityScore}%`, color: '#667eea', icon: '🔒' },
            { label: 'Quality Score', value: `${stats.avgQualityScore}%`, color: '#4299e1', icon: '⭐' },
            { label: 'Performance Score', value: `${stats.avgPerformanceScore}%`, color: '#48bb78', icon: '⚡' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = stat.color
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
              <div style={{
                fontSize: '28px',
                fontWeight: 700,
                color: stat.color,
              }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{
        padding: '20px 40px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        minHeight: 'calc(100vh - 300px)',
      }}>
        {/* Code Analysis Panel */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '20px' }}>🔍</span>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Code Analysis</h2>
          </div>
          <div style={{ padding: '20px' }}>
            {selectedRun ? (
              <CodeAnalysis run={selectedRun} onSelectFinding={setSelectedFinding} />
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#6b7280',
              }}>
                <span style={{ fontSize: '48px', opacity: 0.3 }}>📊</span>
                <p>Select a repository and pull request to view analysis</p>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard View Panel */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '20px' }}>📈</span>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Dashboard View</h2>
          </div>
          <div style={{ padding: '20px' }}>
            {selectedRun && selectedRun.findings && selectedRun.findings.length > 0 ? (
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Issue Distribution</h3>
                {/* Issue severity chart */}
                <div style={{ marginBottom: '24px' }}>
                  {['HIGH', 'MEDIUM', 'LOW'].map(severity => {
                    const count = selectedRun.findings?.filter(f => f.severity === severity).length || 0
                    const percentage = selectedRun.findings ? (count / selectedRun.findings.length) * 100 : 0
                    const color = severity === 'HIGH' ? '#ef4444' : severity === 'MEDIUM' ? '#f59e0b' : '#10b981'
                    
                    return (
                      <div key={severity} style={{ marginBottom: '12px' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '4px',
                          fontSize: '14px',
                        }}>
                          <span>{severity}</span>
                          <span>{count} issues</span>
                        </div>
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '4px',
                          height: '24px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            background: color,
                            height: '100%',
                            width: `${percentage}%`,
                            transition: 'width 0.5s ease',
                            borderRadius: '4px',
                          }} />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Category Breakdown</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {Object.entries(
                    selectedRun.findings?.reduce((acc, f) => {
                      acc[f.category || 'OTHER'] = (acc[f.category || 'OTHER'] || 0) + 1
                      return acc
                    }, {} as Record<string, number>) || {}
                  ).map(([category, count]) => (
                    <div
                      key={category}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '13px', color: '#9ca3af' }}>{category}</span>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#667eea',
                      }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#6b7280',
              }}>
                <span style={{ fontSize: '48px', opacity: 0.3 }}>📈</span>
                <p>No analysis data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Finding Details Panel */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '20px' }}>🐛</span>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Finding Details</h2>
          </div>
          <div style={{ padding: '20px' }}>
            {selectedFinding ? (
              <FindingDetails finding={selectedFinding} />
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#6b7280',
              }}>
                <span style={{ fontSize: '48px', opacity: 0.3 }}>🔍</span>
                <p>Select a finding to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Suggestions Panel */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '20px' }}>✨</span>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>AI Suggestions</h2>
          </div>
          <div style={{ padding: '20px' }}>
            {selectedFinding ? (
              <AISuggestions finding={selectedFinding} />
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#6b7280',
              }}>
                <span style={{ fontSize: '48px', opacity: 0.3 }}>🤖</span>
                <p>Select a finding to view AI-powered suggestions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: '20px 40px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '14px',
      }}>
        <p style={{ margin: 0 }}>
          🚀 Patch Pilot v1.0.0 | Advanced Code Analysis & Security Scanner
        </p>
      </footer>
    </div>
  )
}
