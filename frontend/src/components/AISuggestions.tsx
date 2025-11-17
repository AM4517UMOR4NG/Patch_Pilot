import React, { useState } from 'react'
import { FindingDto, SuggestedPatchDto } from '../api'

// Component for displaying AI-powered suggestions for findings
interface AISuggestionsProps {
  finding: FindingDto
}

export default function AISuggestions({ finding }: AISuggestionsProps) {
  const [expandedPatch, setExpandedPatch] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const handleCopyCode = (code: string, id: number) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Generate professional suggestions if none exist
  const getGeneratedSuggestions = (): Array<{
    title: string
    description: string
    code?: string
    impact: string
    effort: 'LOW' | 'MEDIUM' | 'HIGH'
  }> => {
    if (finding.title?.includes('Hardcoded')) {
      return [{
        title: '🔒 Use Environment Variables',
        description: 'Move sensitive credentials to environment variables or a secure configuration service.',
        code: `// Instead of hardcoding:
const password = "mySecret123";

// Use environment variables:
const password = process.env.DB_PASSWORD;

// Or use a configuration service:
import { Config } from './config';
const password = Config.get('db.password');`,
        impact: 'Eliminates security risk of exposed credentials',
        effort: 'LOW',
      }, {
        title: '🔑 Implement Secret Management',
        description: 'Use a dedicated secret management service like HashiCorp Vault, AWS Secrets Manager, or Azure Key Vault.',
        code: `// Using AWS Secrets Manager:
import { SecretsManager } from 'aws-sdk';
const client = new SecretsManager();

async function getSecret() {
  const secret = await client.getSecretValue({
    SecretId: "prod/db/password"
  }).promise();
  return JSON.parse(secret.SecretString);
}`,
        impact: 'Professional-grade security with audit trails',
        effort: 'MEDIUM',
      }]
    }
    
    if (finding.title?.includes('SQL Injection')) {
      return [{
        title: '🛡️ Use Parameterized Queries',
        description: 'Replace string concatenation with parameterized queries to prevent SQL injection.',
        code: `// Vulnerable code:
const query = "SELECT * FROM users WHERE id = " + userId;

// Secure approach:
const query = "SELECT * FROM users WHERE id = ?";
db.query(query, [userId], (err, results) => {
  // Handle results
});

// Using prepared statements:
const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
stmt.run(userId);`,
        impact: 'Complete protection against SQL injection attacks',
        effort: 'LOW',
      }, {
        title: '📊 Implement ORM Layer',
        description: 'Use an Object-Relational Mapping (ORM) library that handles parameterization automatically.',
        code: `// Using Sequelize ORM:
const user = await User.findOne({
  where: { id: userId }
});

// Using TypeORM:
const user = await userRepository.findOne({
  where: { id: userId }
});`,
        impact: 'Safer and more maintainable database interactions',
        effort: 'HIGH',
      }]
    }

    if (finding.category === 'PERFORMANCE') {
      return [{
        title: '⚡ Optimize Algorithm',
        description: 'Refactor the code to use more efficient algorithms or data structures.',
        code: `// Consider using:
- Hash maps for O(1) lookups instead of arrays
- Binary search for sorted data
- Memoization for repeated calculations
- Batch processing for database operations`,
        impact: 'Significant performance improvement',
        effort: 'MEDIUM',
      }, {
        title: '🗄️ Add Caching Layer',
        description: 'Implement caching to reduce repeated expensive operations.',
        code: `// Using Redis for caching:
const cached = await redis.get(cacheKey);
if (cached) {
  return JSON.parse(cached);
}

const result = await expensiveOperation();
await redis.setex(cacheKey, 3600, JSON.stringify(result));
return result;`,
        impact: 'Reduces load and improves response times',
        effort: 'MEDIUM',
      }]
    }

    // Default suggestions
    return [{
      title: '🔍 Code Review Required',
      description: 'This issue requires manual review by a senior developer to determine the best fix.',
      impact: 'Ensures proper solution implementation',
      effort: 'LOW',
    }, {
      title: '📚 Follow Best Practices',
      description: 'Refactor following industry-standard best practices and coding guidelines.',
      impact: 'Improves code quality and maintainability',
      effort: 'MEDIUM',
    }]
  }

  const suggestions = finding.suggestedPatches && finding.suggestedPatches.length > 0
    ? finding.suggestedPatches
    : null

  const generatedSuggestions = getGeneratedSuggestions()

  return (
    <div>
      {/* AI-Generated Suggestions */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          fontWeight: 600,
          color: '#e6e6e6',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          🤖 AI-Powered Recommendations
        </h4>
        
        {generatedSuggestions.map((suggestion, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(102, 126, 234, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              padding: '16px',
              marginBottom: '12px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)'
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)'
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px',
            }}>
              <h5 style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 600,
                color: '#667eea',
              }}>
                {suggestion.title}
              </h5>
              <span style={{
                background: suggestion.effort === 'LOW' ? 'rgba(16, 185, 129, 0.2)' :
                           suggestion.effort === 'MEDIUM' ? 'rgba(245, 158, 11, 0.2)' :
                           'rgba(239, 68, 68, 0.2)',
                color: suggestion.effort === 'LOW' ? '#10b981' :
                       suggestion.effort === 'MEDIUM' ? '#f59e0b' :
                       '#ef4444',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
              }}>
                {suggestion.effort} EFFORT
              </span>
            </div>
            
            <p style={{
              margin: '0 0 12px 0',
              fontSize: '13px',
              lineHeight: '1.6',
              color: '#9ca3af',
            }}>
              {suggestion.description}
            </p>

            {suggestion.code && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  background: '#0d1117',
                  borderRadius: '6px',
                  padding: '12px',
                  position: 'relative',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  <button
                    onClick={() => handleCopyCode(suggestion.code!, index)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: copiedId === index ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      color: copiedId === index ? '#10b981' : '#9ca3af',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {copiedId === index ? '✅ Copied' : '📋 Copy'}
                  </button>
                  <pre style={{
                    margin: 0,
                    fontSize: '12px',
                    fontFamily: 'Monaco, Consolas, monospace',
                    color: '#e6e6e6',
                    overflow: 'auto',
                  }}>
                    {suggestion.code}
                  </pre>
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#667eea',
            }}>
              <span>💡</span>
              <strong>Impact:</strong>
              <span style={{ color: '#9ca3af' }}>{suggestion.impact}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Existing Suggestions from Backend */}
      {suggestions && suggestions.length > 0 && (
        <div>
          <h4 style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            fontWeight: 600,
            color: '#e6e6e6',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            📝 Additional Patches
          </h4>
          
          {suggestions.map((patch) => (
            <div
              key={patch.id}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '12px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.2s ease',
                }}
                onClick={() => setExpandedPatch(expandedPatch === patch.id ? null : patch.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <span style={{
                  fontSize: '13px',
                  color: '#e6e6e6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  {patch.applied ? '✅' : '⚠️'}
                  Patch #{patch.id}
                </span>
                <span style={{
                  fontSize: '18px',
                  color: '#9ca3af',
                  transform: expandedPatch === patch.id ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s ease',
                }}>
                  ⌄
                </span>
              </div>
              
              {expandedPatch === patch.id && (
                <div style={{
                  padding: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  {patch.explanation && (
                    <p style={{
                      margin: '0 0 12px 0',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      color: '#9ca3af',
                    }}>
                      {patch.explanation}
                    </p>
                  )}
                  
                  {patch.unifiedDiff && (
                    <div style={{
                      background: '#0d1117',
                      borderRadius: '6px',
                      padding: '12px',
                      marginTop: '12px',
                    }}>
                      <pre style={{
                        margin: 0,
                        fontSize: '12px',
                        fontFamily: 'Monaco, Consolas, monospace',
                        color: '#e6e6e6',
                      }}>
                        {patch.unifiedDiff}
                      </pre>
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '12px',
                  }}>
                    <button
                      style={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      ✅ Apply Patch
                    </button>
                    <button
                      style={{
                        background: 'rgba(102, 126, 234, 0.2)',
                        color: '#667eea',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      📋 Copy Diff
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Professional Tips */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(126, 34, 206, 0.1) 100%)',
        borderRadius: '8px',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        padding: '16px',
        marginTop: '24px',
      }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          fontWeight: 600,
          color: '#667eea',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          💡 Pro Tips
        </h4>
        <ul style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '12px',
          lineHeight: '1.8',
          color: '#9ca3af',
        }}>
          <li>Always test fixes in a development environment first</li>
          <li>Consider the impact on existing functionality</li>
          <li>Document your changes for future reference</li>
          <li>Run security scans after applying patches</li>
          <li>Consider adding unit tests for the fixed code</li>
        </ul>
      </div>
    </div>
  )
}
