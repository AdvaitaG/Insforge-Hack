'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { MOCK_FINAL_REPORT, MOCK_SESSION } from '@/lib/mockData'

type Tab = 'social' | 'demoday'

// ─── Investor Personas ────────────────────────────────────────────────────────

const INVESTORS = [
  {
    id: 'pg',
    name: 'Paul G.',
    role: 'YC Founder',
    trait: 'thoughtful',
    color: '#F0A500',
    size: 72,
    floatAnim: 'float-1',
    floatDur: '11s',
    floatDelay: '0s',
    pos: { left: '12%', top: '18%' },
    questions: [
      'What do people do when your product breaks?',
      'Who are your first 10 users, and how did you find them?',
      'What insight are you working from that others are missing?',
    ],
  },
  {
    id: 'skeptic',
    name: 'The Skeptic',
    role: 'Contrarian',
    trait: 'hostile',
    color: '#FF3535',
    size: 64,
    floatAnim: 'float-2',
    floatDur: '8s',
    floatDelay: '1.2s',
    pos: { left: '74%', top: '12%' },
    questions: [
      'This is another AI wrapper. Why won\'t it just die?',
      'Your total addressable market number is made up. All of it.',
      'Name one paying customer. Just one.',
    ],
  },
  {
    id: 'dana',
    name: 'YC Dana',
    role: 'YC Partner',
    trait: 'analytical',
    color: '#00B4D8',
    size: 68,
    floatAnim: 'float-3',
    floatDur: '13s',
    floatDelay: '2.5s',
    pos: { left: '80%', top: '60%' },
    questions: [
      'What\'s your week-over-week growth rate right now?',
      'Walk me through what retention looks like after month one.',
      'What happens to your unit economics at scale?',
    ],
  },
  {
    id: 'vc',
    name: 'Hype VC',
    role: 'Web3 Investor',
    trait: 'chaotic',
    color: '#A855F7',
    size: 58,
    floatAnim: 'float-4',
    floatDur: '9s',
    floatDelay: '0.7s',
    pos: { left: '16%', top: '72%' },
    questions: [
      'Have you considered making this tokenized?',
      'What\'s the viral coefficient and how do you own it?',
      'Is there a community play here?',
    ],
  },
  {
    id: 'journalist',
    name: 'TechCrunch',
    role: 'Tech Journalist',
    trait: 'probing',
    color: '#06D6A0',
    size: 63,
    floatAnim: 'float-5',
    floatDur: '12s',
    floatDelay: '3s',
    pos: { left: '60%', top: '80%' },
    questions: [
      'What\'s the actual headline story here?',
      'How is this different from what OpenAI ships next quarter?',
      'Who are the losers if you win?',
    ],
  },
  {
    id: 'angel',
    name: 'Angel Raj',
    role: 'Angel Investor',
    trait: 'friendly',
    color: '#FF6B35',
    size: 61,
    floatAnim: 'float-6',
    floatDur: '10s',
    floatDelay: '1.8s',
    pos: { left: '6%', top: '48%' },
    questions: [
      'I love the direction. What do you need from early investors?',
      'Who else is building toward the same vision?',
      'What\'s the milestone that gets you to Series A?',
    ],
  },
]

const FOUNDER_RESPONSES = [
  'Great question. The core insight is that most tools in this space optimize for the wrong thing — we go deeper on what actually matters to the user.',
  'We\'ve seen this concern before. The key differentiator is our approach to the data layer, which compounds with usage in a way competitors can\'t replicate easily.',
  'Our first customers came through direct founder networks. The retention tells the real story — we\'re seeing 68% still active after 60 days.',
  'The market is genuinely large, but we\'re not trying to boil the ocean. We own one sharp wedge first and expand from there.',
  'Fair pushback. Here\'s what we know: three design partners pay us today, and two more are in trial. Real money, real usage.',
  'The moat builds through data and workflow lock-in. The longer a team uses this, the more irreplaceable it becomes.',
]

// ─── Social Post Data ─────────────────────────────────────────────────────────

const SOCIAL_POSTS = {
  x: {
    handle: '@pitchmirror',
    name: 'PitchMirror',
    time: '2h',
    text: `We built a thing for founders:\n\nAI Demo Day simulator that actually talks back like a YC partner.\n\nEnter your startup → 60-second pitch generated → three AI investor replicas ask the hard questions → your pitch gets rewritten based on your weakest answers.\n\nBuilt in 4 hours. Live today.`,
    likes: 847,
    retweets: 234,
    replies: 92,
  },
  linkedin: {
    name: 'PitchMirror Team',
    headline: 'Building AI Demo Day practice for founders',
    time: '2 hours ago',
    text: `Every founder practices their pitch. Almost none of them practice the Q&A.\n\nWe built PitchMirror to fix that.\n\nYou enter your startup context. We generate a YC-style pitch, a founder avatar presents it, then three AI investor partners grill you on market, product, and distribution.\n\nAfter the session you get a readiness score, a rewritten pitch, and a full launch kit.\n\nBuilt at InsForge Hackathon. Live today.`,
    likes: 1240,
    comments: 84,
  },
  hn: {
    points: 847,
    title: 'Show HN: PitchMirror – AI Demo Day simulator with investor avatars and pitch rewriting',
    text: `Built this at a hackathon over 4 hours. You paste your GitHub repo, it reads your README, generates a 60-second pitch, then three AI investors ask hard questions. After Q&A it scores your session and rewrites the pitch. Stack: Next.js, InsForge, Replicas for avatars, Memoir for content generation.`,
    submitter: 'ycfounder',
    time: '2 hours ago',
    comments: 142,
  },
  ph: {
    upvotes: 312,
    name: 'PitchMirror',
    tagline: 'The AI Demo Day room that asks the questions VCs actually ask.',
    description: `Practice your Demo Day pitch against AI investor replicas. Enter your startup context, get a polished 60-second pitch, then face three investor personas who ask hard questions about market, technical depth, and growth.\n\nAfter the session: readiness score + rewritten pitch + full launch content package.`,
    badge: '#1 Product of the Day',
  },
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const params = useParams()
  const [tab, setTab] = useState<Tab>('social')
  const session = MOCK_SESSION

  return (
    <div className="h-screen bg-void flex flex-col overflow-hidden">
      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-display text-amber tracking-widest text-sm">YCSIM</span>
          <span className="text-dim font-mono text-xs">·</span>
          <span className="font-mono text-xs text-muted">{session.startupId}</span>
        </div>

        <div className="flex gap-1 bg-surface rounded-lg p-1 border border-border">
          {(['social', 'demoday'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="font-mono text-xs px-4 py-1.5 rounded-md transition-all duration-200"
              style={{
                background: tab === t ? '#F0A500' : 'transparent',
                color: tab === t ? '#060608' : '#6E6E84',
              }}
            >
              {t === 'social' ? 'SOCIAL' : 'DEMO DAY'}
            </button>
          ))}
        </div>

        <div className="font-mono text-xs text-dim">powered by memoir + replicas</div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'social' ? <SocialTab /> : <DemoDayTab />}
      </div>
    </div>
  )
}

// ─── Social Tab ───────────────────────────────────────────────────────────────

function SocialTab() {
  const [activePlatform, setActivePlatform] = useState<'x' | 'linkedin' | 'hn' | 'ph'>('x')

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Platform tabs */}
      <div className="flex items-center gap-1 px-6 py-3 border-b border-border shrink-0">
        {(['x', 'linkedin', 'hn', 'ph'] as const).map(p => (
          <button
            key={p}
            onClick={() => setActivePlatform(p)}
            className="font-mono text-xs px-3 py-1.5 rounded border transition-all duration-200"
            style={{
              borderColor: activePlatform === p ? '#F0A500' : '#1E1E2E',
              color: activePlatform === p ? '#F0A500' : '#6E6E84',
              background: activePlatform === p ? 'rgba(240,165,0,0.05)' : 'transparent',
            }}
          >
            {p === 'x' ? 'X / Twitter' : p === 'linkedin' ? 'LinkedIn' : p === 'hn' ? 'Hacker News' : 'Product Hunt'}
          </button>
        ))}
        <div className="ml-auto font-mono text-xs text-dim">generated by memoir · not posted</div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 flex items-start justify-center">
        <div className="w-full max-w-lg" style={{ animation: 'fade-in 0.4s ease-out forwards' }} key={activePlatform}>
          {activePlatform === 'x' && <XCard />}
          {activePlatform === 'linkedin' && <LinkedInCard />}
          {activePlatform === 'hn' && <HNCard />}
          {activePlatform === 'ph' && <PHCard />}
        </div>
      </div>
    </div>
  )
}

function XCard() {
  const p = SOCIAL_POSTS.x
  return (
    <div className="rounded-2xl border border-border p-6 space-y-4" style={{ background: '#0f1419' }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber flex items-center justify-center text-void font-display text-lg shrink-0">P</div>
        <div>
          <div className="text-snow text-sm font-medium">{p.name}</div>
          <div className="text-muted font-mono text-xs">{p.handle} · {p.time}</div>
        </div>
      </div>
      <p className="text-snow/90 text-sm leading-relaxed whitespace-pre-line">{p.text}</p>
      <div className="flex items-center gap-6 pt-2 border-t border-white/5">
        <div className="font-mono text-xs text-muted flex items-center gap-1.5">
          <span className="text-base">💬</span> {p.replies.toLocaleString()}
        </div>
        <div className="font-mono text-xs text-muted flex items-center gap-1.5">
          <span className="text-base">🔁</span> {p.retweets.toLocaleString()}
        </div>
        <div className="font-mono text-xs text-muted flex items-center gap-1.5">
          <span className="text-base">❤️</span> {p.likes.toLocaleString()}
        </div>
      </div>
    </div>
  )
}

function LinkedInCard() {
  const p = SOCIAL_POSTS.linkedin
  return (
    <div className="rounded-2xl border border-border p-6 space-y-4" style={{ background: '#1c1c1c' }}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-teal flex items-center justify-center text-void font-display text-xl shrink-0">P</div>
        <div>
          <div className="text-snow text-sm font-medium">{p.name}</div>
          <div className="text-muted font-mono text-xs">{p.headline}</div>
          <div className="text-dim font-mono text-xs mt-0.5">{p.time} · 🌐</div>
        </div>
      </div>
      <p className="text-snow/85 text-sm leading-relaxed whitespace-pre-line">{p.text}</p>
      <div className="flex items-center gap-4 pt-3 border-t border-white/5">
        <span className="text-muted font-mono text-xs">👍 {p.likes.toLocaleString()}</span>
        <span className="text-muted font-mono text-xs">💬 {p.comments} comments</span>
      </div>
    </div>
  )
}

function HNCard() {
  const p = SOCIAL_POSTS.hn
  return (
    <div className="rounded-2xl border border-border p-6 space-y-3" style={{ background: '#1a0f00' }}>
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center shrink-0">
          <div className="text-amber text-lg leading-none">▲</div>
          <div className="font-mono text-sm text-amber font-bold">{p.points}</div>
        </div>
        <div className="space-y-2">
          <div className="text-snow font-medium text-sm leading-tight">{p.title}</div>
          <p className="text-snow/70 text-xs leading-relaxed">{p.text}</p>
          <div className="font-mono text-xs text-dim">
            submitted {p.time} by <span className="text-amber/70">{p.submitter}</span> · {p.comments} comments
          </div>
        </div>
      </div>
    </div>
  )
}

function PHCard() {
  const p = SOCIAL_POSTS.ph
  return (
    <div className="rounded-2xl border border-border p-6 space-y-4" style={{ background: '#1a0a00' }}>
      <div className="flex items-start gap-4">
        <button className="shrink-0 flex flex-col items-center gap-1 border border-coral/40 rounded-xl px-3 py-2 hover:border-coral transition-colors">
          <span className="text-coral text-sm">▲</span>
          <span className="font-mono text-xs text-coral font-bold">{p.upvotes}</span>
        </button>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-coral flex items-center justify-center text-void font-display text-lg">P</div>
            <div>
              <div className="text-snow font-medium text-sm">{p.name}</div>
              <div className="text-muted font-mono text-xs">{p.tagline}</div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-snow/80 text-sm leading-relaxed whitespace-pre-line">{p.description}</p>
      <div className="inline-flex items-center gap-2 bg-coral/10 border border-coral/20 rounded-full px-3 py-1">
        <span className="text-coral text-xs">🔸</span>
        <span className="font-mono text-xs text-coral">{p.badge}</span>
      </div>
    </div>
  )
}

// ─── Demo Day Tab ─────────────────────────────────────────────────────────────

type ChatEntry = {
  id: string
  type: 'question' | 'answer'
  investor?: typeof INVESTORS[0]
  text: string
}

function DemoDayTab() {
  const [chatLog, setChatLog] = useState<ChatEntry[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [questionCursors, setQuestionCursors] = useState<Record<string, number>>({})
  const chatRef = useRef<HTMLDivElement>(null)
  const tickRef = useRef(0)
  const [stars, setStars] = useState<{ x: number; y: number; size: number; opacity: number; dur: number; delay: number }[]>([])

  useEffect(() => {
    setStars(
      Array.from({ length: 100 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.4,
        opacity: Math.random() * 0.35 + 0.05,
        dur: Math.random() * 4 + 2,
        delay: Math.random() * 6,
      }))
    )
  }, [])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [chatLog])

  useEffect(() => {
    // Kick off immediately, then every 6 seconds
    function fire() {
      const investor = INVESTORS[tickRef.current % INVESTORS.length]
      tickRef.current++
      const cursor = questionCursors[investor.id] ?? 0
      const question = investor.questions[cursor % investor.questions.length]

      setActiveId(investor.id)
      setChatLog(log => [
        ...log,
        { id: `q-${Date.now()}`, type: 'question', investor, text: question },
      ])
      setQuestionCursors(prev => ({ ...prev, [investor.id]: (prev[investor.id] ?? 0) + 1 }))

      setTimeout(() => {
        const answer = FOUNDER_RESPONSES[Math.floor(Math.random() * FOUNDER_RESPONSES.length)]
        setChatLog(log => [...log, { id: `a-${Date.now()}`, type: 'answer', text: answer }])
        setActiveId(null)
      }, 3200)
    }

    const t = setTimeout(fire, 1200)
    const interval = setInterval(fire, 6500)
    return () => { clearTimeout(t); clearInterval(interval) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="h-full flex overflow-hidden">
      {/* Space scene */}
      <div className="flex-1 relative overflow-hidden bg-void">
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

        {/* Center product bubble */}
        <div
          className="absolute z-10"
          style={{
            left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            className="rounded-full flex flex-col items-center justify-center"
            style={{
              width: 130,
              height: 130,
              background: 'radial-gradient(circle at 35% 35%, rgba(240,165,0,0.25), rgba(240,165,0,0.08))',
              border: '2px solid rgba(240,165,0,0.6)',
              backdropFilter: 'blur(12px)',
              animation: 'center-pulse 3s ease-in-out infinite',
            }}
          >
            <span className="font-display text-amber text-lg leading-none">YC</span>
            <span className="font-display text-amber text-lg leading-none">SIM</span>
            <span className="font-mono text-xs text-amber/50 mt-1">you</span>
          </div>
        </div>

        {/* Investor bubbles */}
        {INVESTORS.map(inv => {
          const isActive = activeId === inv.id
          return (
            <div
              key={inv.id}
              className="absolute z-20"
              style={{
                ...inv.pos,
                animation: `${inv.floatAnim} ${inv.floatDur} ease-in-out ${inv.floatDelay} infinite`,
                transition: 'transform 0.5s ease',
              }}
            >
              <div
                className="rounded-full flex flex-col items-center justify-center cursor-default select-none transition-all duration-500"
                style={{
                  width: inv.size,
                  height: inv.size,
                  background: `radial-gradient(circle at 35% 35%, ${inv.color}30, ${inv.color}10)`,
                  border: `2px solid ${inv.color}${isActive ? 'CC' : '50'}`,
                  backdropFilter: 'blur(8px)',
                  transform: isActive ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: isActive
                    ? `0 0 30px ${inv.color}60, 0 0 60px ${inv.color}30`
                    : `0 0 12px ${inv.color}20`,
                }}
              >
                <span className="font-mono text-xs font-bold leading-tight text-center px-1" style={{ color: inv.color, fontSize: '9px' }}>
                  {inv.name}
                </span>
                <span className="font-mono leading-tight text-center px-1" style={{ color: `${inv.color}80`, fontSize: '7px' }}>
                  {inv.role}
                </span>
              </div>

              {/* Speaking indicator */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    border: `2px solid ${inv.color}`,
                    animation: 'speaking-ring 1s ease-in-out infinite',
                    color: inv.color,
                  }}
                />
              )}
            </div>
          )
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 font-mono text-xs text-dim space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber inline-block" />
            <span>your product</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full border border-muted inline-block" />
            <span>investor / agent</span>
          </div>
        </div>
      </div>

      {/* Chat sidebar */}
      <div className="w-80 flex flex-col border-l border-border shrink-0">
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="font-mono text-xs text-muted uppercase tracking-widest">Live Q&A</div>
        </div>

        <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {chatLog.length === 0 && (
            <div className="text-dim font-mono text-xs text-center pt-8">
              Investors are approaching...
            </div>
          )}
          {chatLog.map(entry => (
            <div
              key={entry.id}
              className="space-y-1"
              style={{ animation: 'slide-up 0.35s ease-out forwards' }}
            >
              {entry.type === 'question' && entry.investor && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.investor.color }} />
                    <span className="font-mono text-xs font-medium" style={{ color: entry.investor.color }}>
                      {entry.investor.name}
                    </span>
                    <span className="font-mono text-xs text-dim">{entry.investor.role}</span>
                  </div>
                  <div
                    className="rounded-xl rounded-tl-sm px-3 py-2.5 text-xs leading-relaxed text-snow/85 ml-3.5"
                    style={{
                      background: `${entry.investor.color}12`,
                      border: `1px solid ${entry.investor.color}25`,
                    }}
                  >
                    {entry.text}
                  </div>
                </>
              )}
              {entry.type === 'answer' && (
                <>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="font-mono text-xs text-amber">you</span>
                    <span className="w-2 h-2 rounded-full bg-amber shrink-0" />
                  </div>
                  <div className="rounded-xl rounded-tr-sm px-3 py-2.5 text-xs leading-relaxed text-void bg-amber mr-0 ml-auto max-w-[95%]">
                    {entry.text}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-border px-4 py-3 shrink-0">
          <div className="font-mono text-xs text-dim text-center">
            AI investors are live · powered by replicas
          </div>
        </div>
      </div>
    </div>
  )
}
