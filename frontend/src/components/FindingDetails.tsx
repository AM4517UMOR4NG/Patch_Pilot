import React from 'react'
import { FindingDto } from '../api'

interface FindingDetailsProps {
  finding: FindingDto
}

export default function FindingDetails({ finding }: FindingDetailsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return '#ef4444'
      case 'MEDIUM': return '#f59e0b'
      case 'LOW': return '#10b981'
      default: return '#6b7280'
    }
  }

  const formatLineNumbers = () => {
    if (finding.endLineNumber && finding.endLineNumber > (finding.lineNumber || 0)) {
      return `Lines ${finding.lineNumber}-${finding.endLineNumber}`
    }
    return `Line ${finding.lineNumber}`
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '18px',
          fontWeight: 600,
          color: '#e6e6e6',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {finding.title}
          {finding.isResolved && (
            <span style={{
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 500,
            }}>
              RESOLVED
            </span>
          )}
        </h3>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: `${getSeverityColor(finding.severity || 'LOW')}20`,
            color: getSeverityColor(finding.severity || 'LOW'),
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
          }}>
            {finding.severity} SEVERITY
          </span>
          <span style={{
            color: '#9ca3af',
            fontSize: '13px',
          }}>
            Category: {finding.category}
          </span>
        </div>
      </div>

      {/* File Location */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '16px',
      }}>
        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
          File Location
        </div>
        <div style={{
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '13px',
          color: '#e6e6e6',
          marginBottom: '4px',
        }}>
          {finding.filePath}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#667eea',
        }}>
          {formatLineNumbers()}
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          fontWeight: 600,
          color: '#e6e6e6',
        }}>
          Description
        </h4>
        <p style={{
          margin: 0,
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#9ca3af',
        }}>
          {finding.description}
        </p>
      </div>

      {/* Code Snippet */}
      {finding.codeSnippet && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: 600,
            color: '#e6e6e6',
          }}>
            Affected Code
          </h4>
          <div style={{
            background: '#0d1117',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'auto',
          }}>
            <pre style={{
              margin: 0,
              fontSize: '12px',
              fontFamily: 'Monaco, Consolas, monospace',
              lineHeight: '1.5',
              color: '#e6e6e6',
            }}>
              {finding.codeSnippet.split('\n').map((line, i) => {
                const lineNum = (finding.lineNumber || 1) + i - Math.floor(finding.codeSnippet?.split('\n').length || 0 / 2)
                const isHighlighted = lineNum === finding.lineNumber
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      background: isHighlighted ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                      borderLeft: isHighlighted ? '3px solid #ef4444' : '3px solid transparent',
                      marginLeft: '-16px',
                      paddingLeft: '13px',
                    }}
                  >
                    <span style={{
                      display: 'inline-block',
                      width: '40px',
                      color: '#6b7280',
                      fontSize: '11px',
                      userSelect: 'none',
                      textAlign: 'right',
                      paddingRight: '12px',
                    }}>
                      {lineNum > 0 ? lineNum : ''}
                    </span>
                    <span style={{ flex: 1 }}>{line}</span>
                  </div>
                )
              })}
            </pre>
          </div>
        </div>
      )}

      {/* Impact Analysis */}
      <div style={{
        background: 'rgba(239, 68, 68, 0.05)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px',
        border: '1px solid rgba(239, 68, 68, 0.2)',
      }}>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          fontWeight: 600,
          color: '#fca5a5',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          ⚠️ Potential Impact
        </h4>
        <ul style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#fca5a5',
        }}>
          {finding.category === 'SECURITY' && (
            <>
              <li>Could lead to unauthorized access or data breaches</li>
              <li>May expose sensitive information to attackers</li>
              <li>Potential for system compromise</li>
            </>
          )}
          {finding.category === 'PERFORMANCE' && (
            <>
              <li>May cause application slowdowns</li>
              <li>Could impact user experience</li>
              <li>Risk of resource exhaustion</li>
            </>
          )}
          {finding.category === 'CODE_QUALITY' && (
            <>
              <li>Increases technical debt</li>
              <li>Makes code harder to maintain</li>
              <li>May lead to bugs in the future</li>
            </>
          )}
          {finding.category === 'VULNERABILITY' && (
            <>
              <li>Critical security risk</li>
              <li>Immediate patching required</li>
              <li>Could be exploited by malicious actors</li>
            </>
          )}
        </ul>
      </div>

      {/* Metadata */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        fontSize: '12px',
      }}>
        <div>
          <span style={{ color: '#6b7280' }}>Finding ID:</span>
          <span style={{ marginLeft: '8px', color: '#9ca3af', fontFamily: 'Monaco, monospace' }}>
            #{finding.id}
          </span>
        </div>
        <div>
          <span style={{ color: '#6b7280' }}>Run ID:</span>
          <span style={{ marginLeft: '8px', color: '#9ca3af', fontFamily: 'Monaco, monospace' }}>
            #{finding.runId}
          </span>
        </div>
        <div>
          <span style={{ color: '#6b7280' }}>Detected:</span>
          <span style={{ marginLeft: '8px', color: '#9ca3af' }}>
            Recently
          </span>
        </div>
        <div>
          <span style={{ color: '#6b7280' }}>Status:</span>
          <span style={{
            marginLeft: '8px',
            color: finding.isResolved ? '#10b981' : '#f59e0b',
          }}>
            {finding.isResolved ? 'Resolved' : 'Open'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '20px',
      }}>
        <button
          style={{
            background: 'rgba(102, 126, 234, 0.2)',
            color: '#667eea',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'
          }}
        >
          📋 Copy Code
        </button>
        <button
          style={{
            background: finding.isResolved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            color: finding.isResolved ? '#10b981' : '#f59e0b',
            border: `1px solid ${finding.isResolved ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = finding.isResolved ? 
              'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = finding.isResolved ?
              'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'
          }}
        >
          {finding.isResolved ? '↩️ Reopen' : '✅ Mark Resolved'}
        </button>
        <button
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
          }}
        >
          🚨 Report False Positive
        </button>
      </div>
    </div>
  )
}
