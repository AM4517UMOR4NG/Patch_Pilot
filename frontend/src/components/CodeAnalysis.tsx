import React from 'react'
import { RunDto, FindingDto } from '../api'

interface CodeAnalysisProps {
  run: RunDto
  onSelectFinding: (finding: FindingDto) => void
}

export default function CodeAnalysis({ run, onSelectFinding }: CodeAnalysisProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return '#ef4444'
      case 'MEDIUM': return '#f59e0b'
      case 'LOW': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'HIGH': return '🔴'
      case 'MEDIUM': return '🟡'
      case 'LOW': return '🟢'
      default: return '⚪'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SECURITY': return '🔒'
      case 'VULNERABILITY': return '⚠️'
      case 'PERFORMANCE': return '⚡'
      case 'CODE_QUALITY': return '✨'
      case 'BEST_PRACTICE': return '📚'
      case 'COMPLEXITY': return '🔧'
      default: return '📝'
    }
  }

  // Group findings by file
  const findingsByFile = run.findings?.reduce((acc, finding) => {
    const file = finding.filePath || 'Unknown'
    if (!acc[file]) acc[file] = []
    acc[file].push(finding)
    return acc
  }, {} as Record<string, FindingDto[]>) || {}

  // Sort files by number of findings (descending)
  const sortedFiles = Object.entries(findingsByFile)
    .sort(([, a], [, b]) => b.length - a.length)

  return (
    <div>
      {/* Run Status */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '4px' }}>
              Analysis Status
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: run.status === 'COMPLETED' ? '#10b981' : 
                     run.status === 'FAILED' ? '#ef4444' : 
                     run.status === 'IN_PROGRESS' ? '#f59e0b' : '#6b7280'
            }}>
              {run.status}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '4px' }}>
              Total Issues
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#667eea' }}>
              {run.findings?.length || 0}
            </div>
          </div>
        </div>
        {run.errorMessage && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '6px',
            color: '#fca5a5',
            fontSize: '13px',
          }}>
            ⚠️ {run.errorMessage}
          </div>
        )}
      </div>

      {/* Files with Issues */}
      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {sortedFiles.map(([file, findings]) => (
          <div
            key={file}
            style={{
              marginBottom: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {/* File Header */}
            <div style={{
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>📄</span>
                <span style={{
                  fontSize: '13px',
                  fontFamily: 'Monaco, monospace',
                  color: '#e6e6e6',
                }}>
                  {file.split('/').pop()}
                </span>
              </div>
              <span style={{
                background: 'rgba(102, 126, 234, 0.2)',
                color: '#667eea',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
              }}>
                {findings.length} issues
              </span>
            </div>

            {/* File Path */}
            <div style={{
              padding: '8px 16px',
              fontSize: '11px',
              color: '#6b7280',
              fontFamily: 'Monaco, monospace',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            }}>
              {file}
            </div>

            {/* Findings List */}
            <div>
              {findings.map((finding, index) => (
                <div
                  key={finding.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: index < findings.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                  onClick={() => onSelectFinding(finding)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}>
                    {/* Severity Icon */}
                    <span style={{ fontSize: '16px', marginTop: '2px' }}>
                      {getSeverityIcon(finding.severity || 'LOW')}
                    </span>

                    {/* Finding Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px',
                      }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#e6e6e6',
                        }}>
                          {finding.title}
                        </span>
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          color: '#9ca3af',
                        }}>
                          Line {finding.lineNumber}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        marginBottom: '8px',
                        lineHeight: '1.5',
                      }}>
                        {finding.description}
                      </div>

                      {/* Code Snippet */}
                      {finding.codeSnippet && (
                        <div style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: '4px',
                          padding: '8px 12px',
                          marginTop: '8px',
                        }}>
                          <pre style={{
                            margin: 0,
                            fontSize: '11px',
                            fontFamily: 'Monaco, Consolas, monospace',
                            color: '#e6e6e6',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {finding.codeSnippet.split('\n')[0]}
                          </pre>
                        </div>
                      )}

                      {/* Tags */}
                      <div style={{
                        display: 'flex',
                        gap: '6px',
                        marginTop: '8px',
                        flexWrap: 'wrap',
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: `${getSeverityColor(finding.severity || 'LOW')}20`,
                          color: getSeverityColor(finding.severity || 'LOW'),
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}>
                          {finding.severity}
                        </span>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'rgba(102, 126, 234, 0.2)',
                          color: '#667eea',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                        }}>
                          {getCategoryIcon(finding.category || 'OTHER')} {finding.category}
                        </span>
                        {finding.suggestedPatches && finding.suggestedPatches.length > 0 && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#10b981',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                          }}>
                            ✨ {finding.suggestedPatches.length} suggestion{finding.suggestedPatches.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(!run.findings || run.findings.length === 0) && run.status === 'COMPLETED' && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>✅</span>
          <h3 style={{ margin: '0 0 8px 0', color: '#10b981' }}>No Issues Found!</h3>
          <p style={{ margin: 0, color: '#6ee7b7', fontSize: '14px' }}>
            This pull request passed all security, performance, and quality checks.
          </p>
        </div>
      )}

      {/* Loading State */}
      {run.status === 'IN_PROGRESS' && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
        }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '3px solid rgba(102, 126, 234, 0.2)',
            borderTop: '3px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ marginTop: '16px', color: '#9ca3af' }}>
            Analyzing code...
          </p>
        </div>
      )}
    </div>
  )
}
