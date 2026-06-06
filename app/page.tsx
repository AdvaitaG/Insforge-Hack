'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function IntakePage() {
  const router = useRouter()
  const [repo, setRepo] = useState('')
  const [focused, setFocused] = useState(false)
  const [stars, setStars] = useState<{ x: number; y: number; size: number; opacity: number; duration: number; delay: number }[]>([])

  useEffect(() => {
    setStars(
      Array.from({ length: 120 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        duration: Math.random() * 4 + 2,
        delay: Math.random() * 6,
      }))
    )
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!repo.trim()) return
    router.push(`/loading?repo=${encodeURIComponent(repo.trim())}`)
  }

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Star field */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-snow"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity,
              animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Radial glow behind content */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(240,165,0,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl w-full" style={{ animation: 'fade-in 1.2s ease-out forwards' }}>
        <div className="font-mono text-xs text-muted tracking-[0.3em] uppercase mb-6 opacity-60">
          Y Combinator Simulator
        </div>

        <h1
          className="font-display leading-none mb-4"
          style={{ fontSize: 'clamp(80px, 18vw, 160px)' }}
        >
          <span className="text-snow">YC</span>
          <span className="text-amber">SIM</span>
        </h1>

        <p className="text-muted text-lg mb-12 max-w-sm leading-relaxed">
          Paste your GitHub repo. We read your README, build your pitch, and put you in front of AI investors.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <div
            className="flex items-center bg-surface rounded-2xl px-5 py-4 transition-all duration-300"
            style={{
              border: `1px solid ${focused ? '#F0A500' : '#1E1E2E'}`,
              boxShadow: focused ? '0 0 0 1px rgba(240,165,0,0.15)' : 'none',
            }}
          >
            <span className="text-dim font-mono text-sm shrink-0 mr-1">github.com /</span>
            <input
              type="text"
              value={repo}
              onChange={e => setRepo(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="username/repo"
              autoComplete="off"
              spellCheck={false}
              className="flex-1 bg-transparent text-snow placeholder:text-dim font-mono text-sm outline-none min-w-0"
            />
          </div>

          <button
            type="submit"
            disabled={!repo.trim()}
            className="w-full font-display text-2xl tracking-widest py-4 rounded-2xl transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed"
            style={{
              background: repo.trim() ? '#F0A500' : '#1a1208',
              color: repo.trim() ? '#060608' : '#7A5200',
            }}
          >
            ANALYZE REPO →
          </button>
        </form>

        <p className="font-mono text-xs text-dim mt-8 leading-relaxed">
          Your README should include company name, problem, solution, and target customer
        </p>
      </div>
    </div>
  )
}
