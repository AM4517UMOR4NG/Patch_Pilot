import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, TrendingUp, Shield, Zap, Code2, GitBranch,
  AlertTriangle, CheckCircle, Info, ChevronRight, 
  Activity, BarChart3, PieChart, GitCommit, Users,
  Clock, FileText, Package, Database, Cloud, Sparkles,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react'

interface CodeHealthMetric {
  name: string
  value: number
  trend: 'up' | 'down' | 'neutral'
  description: string
  color: string
}

interface AIRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: string
  title: string
  impact: string
  effort: string
  description: string
}

export default function InsightsDashboard() {
  const [selectedRepo, setSelectedRepo] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [activeView, setActiveView] = useState<'overview' | 'health' | 'ai' | 'trends'>('overview')
  const [repoData, setRepoData] = useState<any>(null)
  const [lastAnalysis, setLastAnalysis] = useState<any>(null)
  const [repositoryStats, setRepositoryStats] = useState({
    totalFiles: 0,
    totalLines: 0,
    commits: 0,
    branches: 0,
    pullRequests: 0,
    issues: 0,
    lastAnalysis: 'No analysis yet',
    healthScore: 0,
    languages: {}
  })

  useEffect(() => {
    // Fetch real data from localStorage or API
    const storedAnalysis = localStorage.getItem('lastAnalysisResult')
    if (storedAnalysis) {
      const data = JSON.parse(storedAnalysis)
      setLastAnalysis(data)
      
      // Update stats based on real analysis
      const findings = data.findings || []
      const metrics = data.metrics || {}
      
      setRepositoryStats({
        totalFiles: findings.length > 0 ? new Set(findings.map((f: any) => f.filePath)).size : 0,
        totalLines: 0, // Could be calculated from actual files
        commits: 0,
        branches: 0,
        pullRequests: data.analysisType === 'pull_request' ? 1 : 0,
        issues: findings.length,
        lastAnalysis: new Date().toLocaleString(),
        healthScore: metrics.overallScore || 0,
        languages: {} // Could be determined from file extensions
      })
    }
    setLoading(false)
  }, [])

  // Real metrics from analysis
  const healthMetrics: CodeHealthMetric[] = lastAnalysis ? [
    {
      name: 'Code Quality',
      value: lastAnalysis.metrics?.qualityScore || 0,
      trend: 'neutral' as const,
      description: `${lastAnalysis.metrics?.byCategory?.CODE_QUALITY || 0} code quality issues found`,
      color: 'from-green-500 to-emerald-600'
    },
    {
      name: 'Security Score',
      value: lastAnalysis.metrics?.securityScore || 0,
      trend: 'neutral' as const,
      description: `${lastAnalysis.metrics?.byCategory?.SECURITY || 0} security vulnerabilities detected`,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      name: 'Performance',
      value: lastAnalysis.metrics?.performanceScore || 0,
      trend: 'neutral' as const,
      description: `${lastAnalysis.metrics?.byCategory?.PERFORMANCE || 0} performance issues`,
      color: 'from-purple-500 to-pink-600'
    },
    {
      name: 'Overall Health',
      value: lastAnalysis.metrics?.overallScore || 0,
      trend: 'neutral' as const,
      description: `Total ${lastAnalysis.findings?.length || 0} issues found`,
      color: 'from-yellow-500 to-orange-600'
    },
    {
      name: 'Complexity',
      value: Math.max(0, 100 - (lastAnalysis.metrics?.byCategory?.COMPLEXITY || 0) * 10),
      trend: 'neutral' as const,
      description: `${lastAnalysis.metrics?.byCategory?.COMPLEXITY || 0} complexity issues`,
      color: 'from-indigo-500 to-purple-600'
    },
    {
      name: 'Architecture',
      value: Math.max(0, 100 - (lastAnalysis.metrics?.byCategory?.ARCHITECTURE || 0) * 5),
      trend: 'neutral' as const,
      description: `${lastAnalysis.metrics?.byCategory?.ARCHITECTURE || 0} architecture issues`,
      color: 'from-teal-500 to-green-600'
    }
  ] : []

  // Real recommendations from analysis findings
  const aiRecommendations: AIRecommendation[] = lastAnalysis?.findings ? 
    lastAnalysis.findings
      .filter((f: any) => f.severity === 'HIGH')
      .slice(0, 10)
      .map((f: any) => ({
        priority: f.severity === 'HIGH' ? 'critical' as const : f.severity === 'MEDIUM' ? 'high' as const : 'medium' as const,
        category: f.category || 'General',
        title: f.title || 'Issue detected',
        impact: f.severity === 'HIGH' ? 'High' : 'Medium',
        effort: 'Medium',
        description: f.description || 'Please review this issue in your code'
      })) : []

  // Real trend data from analysis history
  const trendData = {
    commits: lastAnalysis ? [lastAnalysis.metrics?.overallScore || 0] : [],
    quality: lastAnalysis ? [lastAnalysis.metrics?.qualityScore || 0] : [],
    issues: lastAnalysis ? [lastAnalysis.findings?.length || 0] : []
  }

  useEffect(() => {
    // Load repository data from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const repo = urlParams.get('repo') || localStorage.getItem('lastAnalyzedRepo')
    if (repo) {
      setSelectedRepo(repo)
      setRepoData({ name: repo, lastAnalysis: new Date().toLocaleString() })
    }
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="w-4 h-4 text-green-400" />
      case 'down': return <ArrowDownRight className="w-4 h-4 text-red-400" />
      default: return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full mix-blend-screen filter blur-xl"
              style={{
                background: `radial-gradient(circle, ${
                  ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6'][i]
                } 0%, transparent 70%)`,
              }}
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 15 + i * 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              initial={{
                width: `${400 + i * 50}px`,
                height: `${400 + i * 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">AI Insights Dashboard</h1>
              <p className="text-gray-300 mt-1">Deep code analysis and intelligent recommendations</p>
            </div>
          </div>
          
          {repoData && (
            <div className="flex items-center gap-2 mt-4">
              <GitBranch className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">{repoData.name}</span>
              <span className="text-gray-400">• Last analyzed {repoData.lastAnalysis}</span>
            </div>
          )}
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'health', label: 'Code Health', icon: Activity },
            { id: 'ai', label: 'AI Recommendations', icon: Sparkles },
            { id: 'trends', label: 'Trends', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeView === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeView === 'overview' && repoData && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-6 h-6 text-blue-400" />
                    <span className="text-2xl font-bold text-white">{repoData.contributors}</span>
                  </div>
                  <div className="text-gray-300 text-sm">Contributors</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <GitCommit className="w-6 h-6 text-green-400" />
                    <span className="text-2xl font-bold text-white">{repoData.commits}</span>
                  </div>
                  <div className="text-gray-300 text-sm">Total Commits</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="w-6 h-6 text-purple-400" />
                    <span className="text-2xl font-bold text-white">{repoData.healthScore}%</span>
                  </div>
                  <div className="text-gray-300 text-sm">Health Score</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-6 h-6 text-yellow-400" />
                    <span className="text-2xl font-bold text-white">{repoData.issues}</span>
                  </div>
                  <div className="text-gray-300 text-sm">Open Issues</div>
                </div>
              </div>

              {/* Language Distribution */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-purple-400" />
                  Language Distribution
                </h3>
                <div className="space-y-3">
                  {Object.entries(repoData.languages).map(([lang, percentage]: [string, any]) => (
                    <div key={lang}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{lang}</span>
                        <span className="text-white font-medium">{percentage}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-purple-400" />
                      <span className="text-white">Generate Report</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  <button className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg hover:from-blue-500/30 hover:to-cyan-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-blue-400" />
                      <span className="text-white">Export Findings</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  <button className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg hover:from-green-500/30 hover:to-emerald-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Cloud className="w-5 h-5 text-green-400" />
                      <span className="text-white">Schedule Scan</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'health' && (
            <motion.div
              key="health"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {healthMetrics.map((metric, idx) => (
                  <motion.div
                    key={metric.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-white">{metric.name}</h4>
                      {getTrendIcon(metric.trend)}
                    </div>
                    
                    <div className="relative h-32 flex items-center justify-center mb-4">
                      <svg className="absolute inset-0 w-32 h-32 mx-auto transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-white/10"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="url(#gradient-${idx})"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${(metric.value * 3.51).toString()} 351.86`}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id={`gradient-${idx}`}>
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#EC4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{metric.value}%</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm">{metric.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeView === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  <h3 className="text-2xl font-semibold text-white">AI-Powered Recommendations</h3>
                </div>
                
                <div className="space-y-4">
                  {aiRecommendations.map((rec, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                          {rec.priority.toUpperCase()}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-lg font-medium text-white">{rec.title}</h4>
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                              {rec.category}
                            </span>
                          </div>
                          
                          <p className="text-gray-400 mb-3">{rec.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-green-400" />
                              <span className="text-gray-300">Impact: </span>
                              <span className="text-white font-medium">{rec.impact}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4 text-yellow-400" />
                              <span className="text-gray-300">Effort: </span>
                              <span className="text-white font-medium">{rec.effort}</span>
                            </div>
                          </div>
                        </div>
                        
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'trends' && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Commit Activity</h3>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {trendData.commits.map((value, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t"
                          style={{ height: `${(value / 100) * 100}%` }}
                        />
                        <span className="text-xs text-gray-400">
                          {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][idx]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Code Quality Trend</h3>
                  <div className="h-64 relative">
                    <svg className="w-full h-full">
                      <polyline
                        fill="none"
                        stroke="url(#quality-gradient)"
                        strokeWidth="3"
                        points={trendData.quality.map((v, i) => 
                          `${(i / 11) * 100}%,${100 - v}%`
                        ).join(' ')}
                      />
                      <defs>
                        <linearGradient id="quality-gradient">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
