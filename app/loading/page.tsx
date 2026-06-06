'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const STEPS = [
  { id: 'connect',  label: 'Connecting to GitHub',      detail: null },
  { id: 'readme',   label: 'Reading README',             detail: null },
  { id: 'codebase', label: 'Parsing codebase',           detail: null },
  { id: 'pitch',    label: 'Generating pitch narrative', detail: null },
  { id: 'room',     label: 'Building investor room',     detail: null },
]

const STEP_DELAY = 1500 // ms between steps
const COMPLETE_DELAY = 1100 // ms after step starts to mark complete

function LoadingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const repo = searchParams.get('repo') ?? 'your/repo'
  const companyName = repo.split('/')[1] ?? repo

  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [done, setDone] = useState(false)
  const [stars, setStars] = useState<{ x: number; y: number; size: number; opacity: number; dur: number; delay: number }[]>([])
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
    if (started.current) return
    started.current = true

    STEPS.forEach((_, i) => {
      setTimeout(() => setCurrentStep(i), i * STEP_DELAY)
      setTimeout(() => setCompletedSteps(prev => new Set(Array.from(prev).concat(i))), i * STEP_DELAY + COMPLETE_DELAY)
    })

    const doneAt = STEPS.length * STEP_DELAY
    setTimeout(() => setDone(true), doneAt)
    setTimeout(() => router.push('/dashboard/session_demo'), doneAt + 1800)
  }, [router])

  const progress = (completedSteps.size / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-void flex flex-col relative overflow-hidden">
      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-snow"
            style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: `${s.size}px`, height: `${s.size}px`,
              opacity: s.opacity,
              animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Top label */}
      <div className="relative z-10 flex items-center justify-between px-8 pt-8">
        <span className="font-display text-amber tracking-widest text-sm">YCSIM</span>
        <span className="font-mono text-xs text-dim">{repo}</span>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
        {!done ? (
          <div className="w-full max-w-md space-y-10">
            {/* Big status word */}
            <div className="overflow-hidden">
              <div
                key={currentStep}
                className="font-display text-5xl text-snow leading-none"
                style={{ animation: 'reveal-word 0.5s cubic-bezier(0.16,1,0.3,1) forwards' }}
              >
                {STEPS[currentStep]?.label.toUpperCase()}
              </div>
            </div>

            {/* Step list */}
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
                      {completed ? '✓' : active ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber" style={{ animation: 'pulse-live 1s ease-in-out infinite' }} />
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
                        <span className="font-mono text-xs text-amber/50" style={{ animation: 'fade-in 0.5s ease-out forwards' }}>
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
            <div className="font-mono text-xs text-amber tracking-[0.3em] uppercase" style={{ animation: 'fade-in 0.6s ease-out forwards' }}>
              Room Ready
            </div>
            <div className="font-display leading-none" style={{ fontSize: 'clamp(60px, 12vw, 100px)' }}>
              <div className="text-snow overflow-hidden">
                <span style={{ display: 'inline-block', animation: 'reveal-word 0.6s cubic-bezier(0.16,1,0.3,1) 0s both' }}>YOUR</span>
              </div>
              <div className="text-amber overflow-hidden">
                <span style={{ display: 'inline-block', animation: 'reveal-word 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>PITCH</span>
              </div>
              <div className="text-snow overflow-hidden">
                <span style={{ display: 'inline-block', animation: 'reveal-word 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}>ROOM</span>
              </div>
            </div>
            <div className="font-mono text-xs text-dim" style={{ animation: 'fade-in 1s ease-out 0.8s both' }}>
              Entering...
            </div>
          </div>
        )}
      </div>

      {/* Bottom progress bar */}
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
