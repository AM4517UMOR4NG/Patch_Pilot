import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Zap, Shield, Gauge, Star, GitPullRequest, Code2, 
  TrendingUp, Lock, Bug, Sparkles, ChevronRight, BarChart3
} from 'lucide-react'
import { healthCheck } from '../api'

export default function HomePage() {
  const [backendStatus, setBackendStatus] = useState<'UP' | 'DOWN' | 'checking'>('checking')

  useEffect(() => {
    healthCheck()
      .then((ok: boolean) => setBackendStatus(ok ? 'UP' : 'DOWN'))
      .catch(() => setBackendStatus('DOWN'))
  }, [])

  const features = [
    {
      icon: Shield,
      title: 'Advanced Security Scanning',
      description: 'Detect vulnerabilities, SQL injections, XSS attacks, and security misconfigurations',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Gauge,
      title: 'Performance Analysis',
      description: 'Identify N+1 queries, memory leaks, and performance bottlenecks',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Star,
      title: 'Code Quality Metrics',
      description: 'Analyze complexity, maintainability, and adherence to best practices',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Insights',
      description: 'Get intelligent suggestions and automated code improvements',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Bug,
      title: 'Bug Detection',
      description: 'Find potential bugs, race conditions, and logic errors',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: TrendingUp,
      title: 'Trend Analysis',
      description: 'Track code quality trends over time and across pull requests',
      color: 'from-pink-500 to-pink-600'
    }
  ]

  const stats = [
    { value: '10K+', label: 'PRs Analyzed' },
    { value: '50K+', label: 'Issues Found' },
    { value: '98%', label: 'Accuracy' },
    { value: '<1min', label: 'Analysis Time' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full mix-blend-screen"
              style={{
                background: `radial-gradient(circle, ${
                  ['#8B5CF6', '#EC4899', '#3B82F6'][i % 3]
                }40 0%, transparent 70%)`,
                width: Math.random() * 400 + 100,
                height: Math.random() * 400 + 100,
              }}
              animate={{
                x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              }}
              transition={{
                duration: Math.random() * 20 + 20,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'linear'
              }}
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                       border border-purple-500/30 rounded-full px-4 py-2 mb-8"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`w-2 h-2 rounded-full ${
              backendStatus === 'UP' ? 'bg-green-400 animate-pulse' : 
              backendStatus === 'DOWN' ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'
            }`} />
            <span className="text-sm text-gray-300">
              Backend Status: <strong className={
                backendStatus === 'UP' ? 'text-green-400' : 
                backendStatus === 'DOWN' ? 'text-red-400' : 'text-yellow-400'
              }>{backendStatus}</strong>
            </span>
          </motion.div>

          <h1 className="text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 
                           bg-clip-text text-transparent">
              Patch Pilot
            </span>
          </h1>
          
          <p className="text-2xl text-gray-300 mb-8 leading-relaxed">
            Professional AI-Powered Code Analysis Platform
          </p>
          
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Comprehensive security scanning, performance optimization, and code quality analysis 
            for your GitHub pull requests. Get deep insights in seconds.
          </p>

          <div className="flex gap-4 justify-center">
            <Link to="/analysis">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 
                         text-white font-semibold rounded-lg shadow-lg 
                         hover:shadow-purple-500/25 transition-all duration-300
                         flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Start Analysis
              </motion.button>
            </Link>
            
            <Link to="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20
                         text-white font-semibold rounded-lg shadow-lg 
                         hover:bg-white/20 transition-all duration-300
                         flex items-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                View Dashboard
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 
                            bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-gray-400 mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-bold text-center mb-16 text-white"
        >
          Enterprise-Grade Code Analysis
        </motion.h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6
                       hover:bg-white/10 transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} 
                            flex items-center justify-center mb-4 
                            group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl 
                   border border-purple-500/30 p-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Improve Your Code Quality?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Start analyzing your pull requests now and get instant feedback on security vulnerabilities,
            performance issues, and code quality problems.
          </p>
          <Link to="/analysis">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 
                       text-white font-semibold rounded-lg shadow-lg 
                       hover:shadow-purple-500/25 transition-all duration-300
                       inline-flex items-center gap-2"
            >
              <GitPullRequest className="w-5 h-5" />
              Analyze Your First PR
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p>© 2024 Patch Pilot - Advanced Code Analysis Platform</p>
            <p className="mt-2 text-sm">
              Powered by AI • Built with React & Spring Boot
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
