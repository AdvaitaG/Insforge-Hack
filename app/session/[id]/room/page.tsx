'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { InvestorType, Session, AvatarRole } from '@/lib/types'
import { MOCK_SESSION } from '@/lib/mockData'
import { useReplicasAvatar } from '@/lib/hooks/useReplicasAvatar'
import { personaForRole } from '@/adapters/replicas'

type RoomStage = 'pitch' | 'q1' | 'q2' | 'q3' | 'done'

type TranscriptEntry = {
  speaker: string
  role: 'founder' | 'investor' | 'system'
  text: string
}

const INVESTORS: Record<InvestorType, { name: string; title: string; color: string }> = {
  skeptical_partner: { name: 'Marcus Reid', title: 'Skeptical Partner', color: '#FF6B35' },
  technical_partner: { name: 'Yuki Tanaka', title: 'Technical Partner', color: '#00B4D8' },
  growth_partner: { name: 'Diana Osei', title: 'Growth Partner', color: '#06D6A0' },
}

const STAGE_ORDER: RoomStage[] = ['pitch', 'q1', 'q2', 'q3', 'done']
const STAGE_Q_IDX: Record<string, number> = { q1: 0, q2: 1, q3: 2 }

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [session, setSession] = useState<Session | null>(null)
  const [stage, setStage] = useState<RoomStage>('pitch')
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [timer, setTimer] = useState(0)
  const transcriptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/sessions/${id}`)
      .then(r => r.json())
      .then((s: Session) => {
        setSession(s)
        setTranscript([{ speaker: 'Founder', role: 'founder', text: s.pitch ?? '' }])
      })
      .catch(() => {
        setSession(MOCK_SESSION)
        setTranscript([{ speaker: 'Founder', role: 'founder', text: MOCK_SESSION.pitch ?? '' }])
      })
  }, [id])

  useEffect(() => {
    const t = setInterval(() => setTimer(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcript])

  if (!session) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="font-display text-3xl text-amber animate-pulse-live">LOADING ROOM...</div>
      </div>
    )
  }

  const questions = session.questions ?? []
  const currentQ = stage !== 'pitch' && stage !== 'done' ? questions[STAGE_Q_IDX[stage]] : null
  const activeInvestor = currentQ ? INVESTORS[currentQ.investorType] : null
  const companyName = session.startup?.companyName ?? session.startupId

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  function advanceFromPitch() {
    const q = questions[0]
    if (!q) return
    const inv = INVESTORS[q.investorType]
    setTranscript(t => [...t, { speaker: inv.name, role: 'investor', text: q.question }])
    setStage('q1')
  }

  async function submitAnswer() {
    if (!currentQ || !currentAnswer.trim()) return

    const inv = INVESTORS[currentQ.investorType]
    const newEntry: TranscriptEntry = { speaker: 'You', role: 'founder', text: currentAnswer }

    const nextIdx = STAGE_Q_IDX[stage] + 1
    const isLast = nextIdx >= questions.length

    if (isLast) {
      setTranscript(t => [...t, newEntry])
      setCurrentAnswer('')
      try {
        await fetch(`/api/sessions/${id}/finalize`, { method: 'POST' })
      } catch {}
      router.push(`/session/${id}/report`)
      return
    }

    const nextQ = questions[nextIdx]
    const nextInv = INVESTORS[nextQ.investorType]
    setTranscript(t => [
      ...t,
      newEntry,
      { speaker: nextInv.name, role: 'investor', text: nextQ.question },
    ])
    setCurrentAnswer('')
    setStage(STAGE_ORDER[STAGE_ORDER.indexOf(stage) + 1] as RoomStage)
  }

  return (
    <div className="h-screen bg-void flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-display text-amber tracking-widest text-sm">PITCHMIRROR</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-live animate-pulse-live" />
            <span className="font-mono text-xs text-live">LIVE</span>
          </div>
        </div>
        <div className="font-mono text-xs text-muted">{formatTime(timer)}</div>
        <StageIndicator stage={stage} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: active speaker */}
        <div className="flex-1 flex flex-col border-r border-border">
          {/* Avatar stage — doniv: embed Replicas avatar here */}
          <div className="flex-1 bg-stage flex flex-col items-center justify-center relative">
            <AvatarStage
              stage={stage}
              activeInvestor={activeInvestor}
              companyName={companyName}
              pitch={session.pitch}
              currentQuestion={currentQ?.question}
            />
          </div>

          {/* Transcript */}
          <div className="h-40 border-t border-border flex flex-col">
            <div className="px-4 py-2 border-b border-border">
              <span className="font-mono text-xs text-muted uppercase tracking-widest">Transcript</span>
            </div>
            <div ref={transcriptRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
              {transcript.map((entry, i) => (
                <div key={i} className="flex gap-2 text-xs font-mono animate-slide-up">
                  <span
                    className="shrink-0 font-medium"
                    style={{
                      color:
                        entry.role === 'founder'
                          ? '#F0A500'
                          : entry.role === 'investor'
                          ? '#6E6E84'
                          : '#3E3E52',
                    }}
                  >
                    {entry.speaker}:
                  </span>
                  <span className="text-snow/70 line-clamp-2">{entry.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: investor panel + answer */}
        <div className="w-72 flex flex-col shrink-0">
          {/* Investor cards */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            <div className="font-mono text-xs text-muted uppercase tracking-widest mb-4">Investor Panel</div>
            {questions.map((q, i) => {
              const inv = INVESTORS[q.investorType]
              const isActive = currentQ?.investorType === q.investorType
              return (
                <div
                  key={q.id}
                  className="rounded-lg border p-4 transition-all duration-500"
                  style={{
                    borderColor: isActive ? inv.color : '#1E1E2E',
                    backgroundColor: isActive ? `${inv.color}10` : '#0E0E14',
                    boxShadow: isActive ? `0 0 20px ${inv.color}30` : 'none',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-display"
                      style={{ backgroundColor: `${inv.color}20`, color: inv.color }}
                    >
                      {inv.name[0]}
                    </div>
                    <div>
                      <div className="text-xs text-snow font-medium">{inv.name}</div>
                      <div className="text-xs font-mono" style={{ color: inv.color }}>
                        {inv.title}
                      </div>
                    </div>
                  </div>
                  {isActive && (
                    <p className="text-xs text-snow/70 mt-2 leading-relaxed animate-slide-up">
                      {q.question}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Answer input */}
          <div className="border-t border-border p-4 space-y-3 shrink-0">
            {stage === 'pitch' ? (
              <button
                onClick={advanceFromPitch}
                className="w-full bg-amber text-void font-display text-lg tracking-widest py-3 rounded hover:bg-amber-bright transition-colors"
              >
                BEGIN Q&A →
              </button>
            ) : stage !== 'done' ? (
              <>
                <div className="font-mono text-xs text-muted uppercase tracking-widest">Your answer</div>
                <textarea
                  value={currentAnswer}
                  onChange={e => setCurrentAnswer(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitAnswer()
                  }}
                  placeholder="Type your answer... (⌘↵ to submit)"
                  rows={4}
                  className="w-full bg-surface border border-border rounded px-3 py-2 text-snow text-sm placeholder:text-dim focus:border-amber transition-colors resize-none font-mono"
                />
                <button
                  onClick={submitAnswer}
                  disabled={!currentAnswer.trim()}
                  className="w-full bg-amber text-void font-display text-lg tracking-widest py-2.5 rounded hover:bg-amber-bright transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {STAGE_Q_IDX[stage] === questions.length - 1 ? 'FINISH →' : 'SUBMIT →'}
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function StageIndicator({ stage }: { stage: RoomStage }) {
  const stages = [
    { key: 'pitch', label: 'PITCH' },
    { key: 'q1', label: 'Q1' },
    { key: 'q2', label: 'Q2' },
    { key: 'q3', label: 'Q3' },
  ]
  const currentIdx = STAGE_ORDER.indexOf(stage)
  return (
    <div className="flex items-center gap-1.5">
      {stages.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1.5">
          <div
            className="font-mono text-xs px-2 py-0.5 rounded"
            style={{
              backgroundColor: i <= currentIdx ? '#F0A50020' : 'transparent',
              color: i <= currentIdx ? '#F0A500' : '#3E3E52',
              border: `1px solid ${i <= currentIdx ? '#F0A50040' : '#1E1E2E'}`,
            }}
          >
            {s.label}
          </div>
          {i < stages.length - 1 && <span className="text-dim text-xs">›</span>}
        </div>
      ))}
    </div>
  )
}

const TITLE_TO_ROLE: Record<string, AvatarRole> = {
  'Skeptical Partner': 'skeptical_partner',
  'Technical Partner': 'technical_partner',
  'Growth Partner': 'growth_partner',
}

function AvatarStage({
  stage,
  activeInvestor,
  companyName,
  pitch,
  currentQuestion,
}: {
  stage: RoomStage
  activeInvestor: { name: string; title: string; color: string } | null
  companyName: string
  pitch?: string
  currentQuestion?: string
}) {
  const isPitch = stage === 'pitch'
  const speaker = isPitch
    ? { name: 'Founder', subtitle: companyName, color: '#F0A500' }
    : activeInvestor
    ? { name: activeInvestor.name, subtitle: activeInvestor.title, color: activeInvestor.color }
    : null

  // Stable primitives that identify the current speaker + what they should say.
  const role: AvatarRole = isPitch
    ? 'founder'
    : TITLE_TO_ROLE[activeInvestor?.title ?? ''] ?? 'skeptical_partner'
  const speakText = isPitch ? pitch ?? '' : currentQuestion ?? ''
  const displayName = speaker?.name ?? 'Founder'

  const { avatarSession, isLoading, isMock, createAvatar, speak } = useReplicasAvatar()

  // Create the avatar whenever the active speaker (role) changes.
  // Keyed on `role` only so it runs once per speaker, not every render.
  useEffect(() => {
    if (stage === 'done') return
    createAvatar({ role, displayName, persona: personaForRole(role) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, stage])

  // Once the avatar exists, have it speak the founder pitch / investor question.
  useEffect(() => {
    if (stage === 'done') return
    if (!avatarSession?.providerAvatarId) return
    if (!speakText) return
    speak(speakText)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarSession?.providerAvatarId, speakText, stage])

  const isSpeaking = avatarSession?.status === 'speaking'

  return (
    <>
      {/* Replicas avatar embed when a real provider returns one; otherwise the
          simulated avatar tile that keeps the live room working. */}
      {avatarSession?.embedUrl ? (
        <div
          className="w-56 h-56 rounded-2xl overflow-hidden border-2"
          style={{ borderColor: speaker?.color ?? '#1E1E2E' }}
        >
          <iframe
            src={avatarSession.embedUrl}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            title={`${displayName} avatar`}
          />
        </div>
      ) : (
        <div
          className="w-56 h-56 rounded-2xl border-2 flex items-center justify-center transition-all duration-500"
          style={{
            borderColor: speaker?.color ?? '#1E1E2E',
            backgroundColor: `${speaker?.color ?? '#1E1E2E'}10`,
            boxShadow: isSpeaking ? `0 0 40px ${speaker?.color ?? '#1E1E2E'}55` : 'none',
          }}
        >
          {isLoading ? (
            <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="font-display text-7xl" style={{ color: speaker?.color ?? '#3E3E52' }}>
              {displayName[0] ?? '?'}
            </span>
          )}
        </div>
      )}

      {speaker && (
        <div className="absolute bottom-6 left-6 right-6">
          <div
            className="inline-flex items-center gap-2 bg-void/80 backdrop-blur border rounded px-3 py-2"
            style={{ borderColor: `${speaker.color}40` }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse-live"
              style={{ backgroundColor: speaker.color }}
            />
            <span className="font-mono text-sm text-snow">{speaker.name}</span>
            <span className="font-mono text-xs" style={{ color: speaker.color }}>
              {speaker.subtitle}
            </span>
            <span className="font-mono text-xs text-dim ml-2">
              {isSpeaking ? 'speaking' : isLoading ? 'loading' : 'ready'}
              {isMock ? ' · sim' : ''}
            </span>
          </div>
        </div>
      )}
    </>
  )
}
