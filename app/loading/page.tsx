'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { parseReadmeToStartup } from '@/lib/github'

const STEPS = [
  { id: 'connect', label: 'Connecting to GitHub' },
  { id: 'readme', label: 'Reading README' },
  { id: 'codebase', label: 'Creating startup profile' },
  { id: 'pitch', label: 'Generating pitch narrative' },
  { id: 'room', label: 'Building investor room' },
]

function LoadingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const repo = searchParams.get('repo') ?? ''
  const companyName = repo.split('/')[1] ?? repo

  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stars, setStars] = useState<
    { x: number; y: number; size: number; opacity: number; dur: number; delay: number }[]
  >([])
  const started = useRef(false)

  useEffect(() => {
    setStars(
      Array.from({ length: 80 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.05,
        dur: Math.random() * 4 + 2,
        delay: Math.random() * 5,
      }))
    )
  }, [])

  useEffect(() => {
    if (started.current || !repo) return
    started.current = true

    async function run() {
      try {
        setCurrentStep(0)
        const readmeRes = await fetch(`/api/github/readme?repo=${encodeURIComponent(repo)}`)
        const readmeData = await readmeRes.json()
        if (!readmeRes.ok) throw new Error(readmeData.error ?? 'Failed to fetch README')
        setCompletedSteps((prev) => new Set(Array.from(prev).concat(0)))

        setCurrentStep(1)
        const startupPayload = parseReadmeToStartup(readmeData.readme, repo)
        setCompletedSteps((prev) => new Set(Array.from(prev).concat(1)))

        setCurrentStep(2)
        const startupRes = await fetch('/api/startups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(startupPayload),
        })
        const startup = await startupRes.json()
        if (!startupRes.ok) throw new Error(startup.error ?? 'Failed to create startup')
        setCompletedSteps((prev) => new Set(Array.from(prev).concat(2)))

        setCurrentStep(3)
        const sessionRes = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startupId: startup.id }),
        })
        const session = await sessionRes.json()
        if (!sessionRes.ok) throw new Error(session.error ?? 'Failed to generate pitch')
        setCompletedSteps((prev) => new Set(Array.from(prev).concat(3)))

        setCurrentStep(4)
        setCompletedSteps((prev) => new Set(Array.from(prev).concat(4)))
        setDone(true)
        setTimeout(() => router.push(`/session/${session.id}`), 1600)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    }

    run()
  }, [repo, router])

  const progress = (completedSteps.size / STEPS.length) * 100

  if (!repo) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <p className="font-mono text-sm text-muted">No repo specified.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
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
              animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-between px-8 pt-8">
        <span className="font-display text-amber tracking-widest text-sm">YCSIM</span>
        <span className="font-mono text-xs text-dim">{repo}</span>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
        {error ? (
          <div className="text-center space-y-4 max-w-md">
            <div className="font-display text-3xl text-live">FAILED</div>
            <p className="font-mono text-sm text-muted">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="font-mono text-sm text-amber border border-amber/30 px-4 py-2 rounded hover:border-amber transition-colors"
            >
              ← Try again
            </button>
          </div>
        ) : !done ? (
          <div className="w-full max-w-md space-y-10">
            <div className="overflow-hidden">
              <div
                key={currentStep}
                className="font-display text-5xl text-snow leading-none"
                style={{ animation: 'reveal-word 0.5s cubic-bezier(0.16,1,0.3,1) forwards' }}
              >
                {STEPS[currentStep]?.label.toUpperCase()}
              </div>
            </div>

            <div className="space-y-4">
              {STEPS.map((step, i) => {
                const completed = completedSteps.has(i)
                const active = currentStep === i && !completed
                const pending = i > currentStep

                return (
                  <div
                    key={step.id}
                    className="flex items-center gap-4 transition-all duration-700"
                    style={{
                      opacity: pending ? 0.15 : 1,
                      animation: !pending ? `step-in 0.4s ease-out ${i * 0.05}s both` : 'none',
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-mono transition-all duration-500"
                      style={{
                        background: completed ? '#F0A500' : 'transparent',
                        border: completed ? 'none' : `1px solid ${active ? '#F0A500' : '#1E1E2E'}`,
                        color: completed ? '#060608' : '#F0A500',
                      }}
                    >
                      {completed ? (
                        '✓'
                      ) : active ? (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-amber"
                          style={{ animation: 'pulse-live 1s ease-in-out infinite' }}
                        />
                      ) : null}
                    </div>

                    <div className="flex items-baseline gap-3">
                      <span
                        className="font-mono text-sm transition-colors duration-300"
                        style={{ color: completed ? '#E8E8F0' : active ? '#F0A500' : '#6E6E84' }}
                      >
                        {step.label}
                      </span>
                      {completed && i === 1 && (
                        <span
                          className="font-mono text-xs text-amber/50"
                          style={{ animation: 'fade-in 0.5s ease-out forwards' }}
                        >
                          found: {companyName}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div
              className="font-mono text-xs text-amber tracking-[0.3em] uppercase"
              style={{ animation: 'fade-in 0.6s ease-out forwards' }}
            >
              Room Ready
            </div>
            <div className="font-display leading-none" style={{ fontSize: 'clamp(60px, 12vw, 100px)' }}>
              <div className="text-snow overflow-hidden">
                <span
                  style={{
                    display: 'inline-block',
                    animation: 'reveal-word 0.6s cubic-bezier(0.16,1,0.3,1) 0s both',
                  }}
                >
                  YOUR
                </span>
              </div>
              <div className="text-amber overflow-hidden">
                <span
                  style={{
                    display: 'inline-block',
                    animation: 'reveal-word 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both',
                  }}
                >
                  PITCH
                </span>
              </div>
              <div className="text-snow overflow-hidden">
                <span
                  style={{
                    display: 'inline-block',
                    animation: 'reveal-word 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both',
                  }}
                >
                  ROOM
                </span>
              </div>
            </div>
            <div
              className="font-mono text-xs text-dim"
              style={{ animation: 'fade-in 1s ease-out 0.8s both' }}
            >
              Entering...
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10 px-0 pb-0">
        <div className="h-0.5 bg-surface w-full">
          <div
            className="h-full bg-amber transition-all duration-700 ease-out"
            style={{ width: done ? '100%' : `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function LoadingPage() {
  return (
    <Suspense>
      <LoadingContent />
    </Suspense>
  )
}
