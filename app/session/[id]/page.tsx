'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Session } from '@/lib/types'
import { MOCK_SESSION } from '@/lib/mockData'

export default function PitchPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [session, setSession] = useState<Session | null>(null)
  const [activeAsset, setActiveAsset] = useState(0)

  useEffect(() => {
    fetch(`/api/sessions/${id}`)
      .then(r => r.json())
      .then(setSession)
      .catch(() => setSession(MOCK_SESSION))
  }, [id])

  if (!session) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="font-display text-3xl text-amber animate-pulse-live">GENERATING PITCH ROOM...</div>
      </div>
    )
  }

  const assets = session.launchAssets ?? []

  return (
    <div className="min-h-screen bg-void">
      {/* Top bar */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="font-display text-amber tracking-widest">PITCHMIRROR</span>
        <span className="font-mono text-xs text-muted">PITCH PREVIEW</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-5 gap-10">
        {/* Left: pitch */}
        <div className="col-span-3 space-y-8">
          <div>
            <div className="font-mono text-xs text-muted uppercase tracking-widest mb-3">One-liner</div>
            <p className="font-display text-3xl text-snow leading-tight">{session.oneLiner}</p>
          </div>

          <div>
            <div className="font-mono text-xs text-muted uppercase tracking-widest mb-3">Positioning</div>
            <p className="text-snow/80 text-lg">{session.positioning}</p>
          </div>

          <div>
            <div className="font-mono text-xs text-muted uppercase tracking-widest mb-3">60-second pitch</div>
            <div className="bg-surface border border-border rounded-lg p-6">
              <p className="text-snow/90 leading-relaxed whitespace-pre-line font-body text-sm">{session.pitch}</p>
            </div>
          </div>

          {session.proofPoints && session.proofPoints.length > 0 && (
            <div>
              <div className="font-mono text-xs text-muted uppercase tracking-widest mb-3">Proof points</div>
              <ul className="space-y-2">
                {session.proofPoints.map((p, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-amber mt-0.5">▸</span>
                    <span className="text-snow/80 text-sm">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right: questions + assets */}
        <div className="col-span-2 space-y-8">
          <div>
            <div className="font-mono text-xs text-muted uppercase tracking-widest mb-4">Investor questions</div>
            <div className="space-y-3">
              {(session.questions ?? []).map((q, i) => (
                <div key={q.id} className="bg-surface border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded"
                      style={{ color: INVESTOR_COLOR[q.investorType], border: `1px solid ${INVESTOR_COLOR[q.investorType]}40` }}
                    >
                      {INVESTOR_LABEL[q.investorType]}
                    </span>
                  </div>
                  <p className="text-snow/80 text-sm">{q.question}</p>
                </div>
              ))}
            </div>
          </div>

          {assets.length > 0 && (
            <div>
              <div className="font-mono text-xs text-muted uppercase tracking-widest mb-4">Launch assets</div>
              <div className="flex gap-2 flex-wrap mb-3">
                {assets.map((a, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveAsset(i)}
                    className={`text-xs font-mono px-2 py-1 rounded border transition-colors ${
                      activeAsset === i
                        ? 'border-amber text-amber'
                        : 'border-border text-muted hover:border-muted'
                    }`}
                  >
                    {ASSET_LABEL[a.assetType] ?? a.assetType}
                  </button>
                ))}
              </div>
              <div className="bg-surface border border-border rounded-lg p-4 max-h-48 overflow-y-auto">
                <p className="text-snow/70 text-xs font-mono leading-relaxed whitespace-pre-line">
                  {assets[activeAsset]?.content}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="border-t border-border px-6 py-5 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="font-mono text-sm text-muted hover:text-snow transition-colors"
        >
          ← Edit startup
        </button>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              const res = await fetch(`/api/sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startupId: session.startupId }),
              })
              const s = await res.json().catch(() => ({ id: 'session_demo' }))
              router.push(`/session/${s.id}`)
            }}
            className="font-mono text-sm text-muted border border-border px-4 py-2 rounded hover:border-muted transition-colors"
          >
            Regenerate
          </button>
          <button
            onClick={() => router.push(`/session/${id}/room`)}
            className="font-display text-xl tracking-widest bg-amber text-void px-8 py-2 rounded hover:bg-amber-bright transition-colors"
          >
            START SIMULATION →
          </button>
        </div>
      </div>
    </div>
  )
}

const INVESTOR_COLOR: Record<string, string> = {
  skeptical_partner: '#FF6B35',
  technical_partner: '#00B4D8',
  growth_partner: '#06D6A0',
}

const INVESTOR_LABEL: Record<string, string> = {
  skeptical_partner: 'SKEPTICAL',
  technical_partner: 'TECHNICAL',
  growth_partner: 'GROWTH',
}

const ASSET_LABEL: Record<string, string> = {
  x_thread: 'X/Twitter',
  linkedin_post: 'LinkedIn',
  hacker_news_post: 'HN',
  product_hunt_tagline: 'PH tagline',
  product_hunt_description: 'PH description',
  demo_video_script: 'Video script',
}
