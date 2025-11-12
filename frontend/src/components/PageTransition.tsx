import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showTransition, setShowTransition] = useState(false)
  const [showExplosion, setShowExplosion] = useState(false)
  const [showHand, setShowHand] = useState(false)
  const [showHandOpen, setShowHandOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // Trigger transition when route changes
    setIsTransitioning(true)
    setShowTransition(true)
    
    // Hide content after a short delay
    const timer1 = setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
    
    // Start explosion effect after divine light peaks
    const timer2 = setTimeout(() => {
      setShowExplosion(true)
    }, 800)
    
    // Start hand appearing from explosion
    const timer3 = setTimeout(() => {
      setShowHand(true)
    }, 1200)
    
    // Hand opens to reveal new page
    const timer4 = setTimeout(() => {
      setShowHandOpen(true)
    }, 1800)
    
    // Hide all effects after animation completes
    const timer5 = setTimeout(() => {
      setShowTransition(false)
      setShowExplosion(false)
      setShowHand(false)
      setShowHandOpen(false)
    }, 2500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
    }
  }, [location.pathname])

  return (
    <div className="relative">
      {/* Divine Light to Explosion Transition Effect */}
      {showTransition && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Main divine light burst */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="divine-light-burst"></div>
          </div>
          
          {/* Central blue moon with red light overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="divine-orb">
              <div className="blue-moon-core"></div>
              <div className="divine-flame"></div>
            </div>
          </div>
          
          {/* Reduced particles */}
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="blue-flame-particle"
                style={{
                  '--delay': `${i * 0.06}s`,
                  '--angle': `${(i * 30) + Math.random() * 10 - 5}deg`,
                  '--distance': `${100 + Math.random() * 100}px`,
                  '--size': `${4 + Math.random() * 6}px`,
                  '--duration': `${1.5 + Math.random() * 0.3}s`,
                  '--max-scale': `${2 + Math.random() * 1}`,
                  '--final-scale': `${0.2 + Math.random() * 0.2}`
                } as React.CSSProperties}
              ></div>
            ))}
          </div>
          
          {/* Simplified light rays */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="divine-rays"></div>
          </div>
          
          {/* Reduced divine particles */}
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="divine-particle"
                style={{
                  '--delay': `${i * 0.1}s`,
                  '--angle': `${(i * 45) + Math.random() * 10 - 5}deg`,
                  '--distance': `${150 + Math.random() * 80}px`
                } as React.CSSProperties}
              ></div>
            ))}
          </div>
          
          {/* Simplified flash */}
          <div className="divine-flash"></div>
          
          {/* Massive Explosion Effect */}
          {showExplosion && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="explosion-core"></div>
              <div className="explosion-shockwave"></div>
              <div className="explosion-particles">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="explosion-particle"
                    style={{
                      '--delay': `${Math.random() * 0.2}s`,
                      '--angle': `${(i * 12) + Math.random() * 6 - 3}deg`,
                      '--distance': `${200 + Math.random() * 300}px`,
                      '--size': `${6 + Math.random() * 12}px`,
                      '--duration': `${1 + Math.random() * 0.5}s`
                    } as React.CSSProperties}
                  ></div>
                ))}
              </div>
              <div className="explosion-smoke"></div>
            </div>
          )}
          
          {/* Mystical Hand Emerging from Explosion */}
          {showHand && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`hand-container ${showHandOpen ? 'hand-opening' : 'hand-closed'}`}>
                <div className="mystical-hand">
                  <div className="hand-palm"></div>
                  <div className="hand-thumb"></div>
                  <div className="hand-index" style={{ '--rotation': '10deg' } as React.CSSProperties}></div>
                  <div className="hand-middle" style={{ '--rotation': '5deg' } as React.CSSProperties}></div>
                  <div className="hand-ring" style={{ '--rotation': '0deg' } as React.CSSProperties}></div>
                  <div className="hand-pinky"></div>
                  <div className="hand-glow"></div>
                  <div className="hand-energy"></div>
                  <div className="hand-portal"></div>
                  <div className="hand-rift"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Page Content - revealed by hand */}
      <div className={`relative transition-all duration-300 ease-out ${
        isTransitioning ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'
      } ${
        showHandOpen ? 'animate-page-reveal' : ''
      }`}>
        {children}
      </div>
    </div>
  )
}
