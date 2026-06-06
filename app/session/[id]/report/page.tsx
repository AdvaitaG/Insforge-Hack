'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FinalReport, Session } from '@/lib/types'
import { MOCK_FINAL_REPORT, MOCK_SESSION } from '@/lib/mockData'
import { loadCachedReport } from '@/lib/reportCache'

const SCORE_LABELS: Record<string, string> = {
  clarity: 'Clarity',
  urgency: 'Urgency',
  market: 'Market',
  differentiation: 'Differentiation',
  productDepth: 'Product Depth',
  gtm: 'GTM',
  fundability: 'Fundability',
}

const ASSET_LABEL: Record<string, string> = {
  x_thread: 'X / Twitter',
  linkedin_post: 'LinkedIn',
  hacker_news_post: 'Hacker News',
  product_hunt_tagline: 'PH Tagline',
  product_hunt_description: 'PH Description',
  demo_video_script: 'Video Script',
}

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [session, setSession] = useState<Session | null>(null)
  const [report, setReport] = useState<FinalReport | null>(null)
  const [activeAsset, setActiveAsset] = useState(0)
  const [showRewritten, setShowRewritten] = useState(false)

  useEffect(() => {
    const cached = loadCachedReport(id)
    if (cached) {
      setReport({
        readinessScore: cached.readinessScore,
        scoreBreakdown: cached.scoreBreakdown ?? {},
        strengths: cached.strengths ?? [],
        weaknesses: cached.weaknesses ?? [],
        rewrittenPitch: cached.rewrittenPitch ?? '',
        launchAssets: cached.launchAssets ?? [],
      })
      if (cached.session) setSession(cached.session as Session)
      return
    }

    fetch(`/api/sessions/${id}`)
      .then(r => r.json())
      .then((s: Session) => {
        setSession(s)
        if (s.readinessScore !== undefined) {
          setReport({
            readinessScore: s.readinessScore,
            scoreBreakdown: s.scoreBreakdown ?? {},
            strengths: s.strengths ?? [],
            weaknesses: s.weaknesses ?? [],
            rewrittenPitch: s.rewrittenPitch ?? '',
            launchAssets: s.launchAssets ?? [],
          })
        } else {
          setReport(MOCK_FINAL_REPORT)
        }
      })
      .catch(() => {
        setSession(MOCK_SESSION)
        setReport(MOCK_FINAL_REPORT)
      })
  }, [id])

  if (!report) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="font-display text-3xl text-amber animate-pulse-live">SCORING YOUR SESSION...</div>
      </div>
    )
  }

  const scoreColor = report.readinessScore >= 80 ? '#06D6A0' : report.readinessScore >= 60 ? '#F0A500' : '#FF3535'

  return (
    <div className="min-h-screen bg-void">
      {/* Top bar */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="font-display text-amber tracking-widest">PITCHMIRROR</span>
        <span className="font-mono text-xs text-muted">DEMO DAY READINESS REPORT</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">
        {/* Score hero */}
        <div className="flex items-end gap-8">
          <div>
            <div className="font-mono text-xs text-muted uppercase tracking-widest mb-2">Readiness Score</div>
            <div className="font-display leading-none" style={{ fontSize: '120px', color: scoreColor }}>
              {report.readinessScore}
            </div>
          </div>
          <div className="pb-4">
            <div className="font-display text-4xl text-snow/40">/ 100</div>
          </div>
          <div className="pb-4 ml-auto text-right">
            <div className="font-mono text-xs text-muted mb-1">VERDICT</div>
            <div className="font-display text-2xl" style={{ color: scoreColor }}>
              {report.readinessScore >= 80
                ? 'DEMO DAY READY'
                : report.readinessScore >= 60
                ? 'NEEDS WORK'
                : 'NOT READY'}
            </div>
          </div>
        </div>

        {/* Score breakdown */}
        <div>
          <div className="font-mono text-xs text-muted uppercase tracking-widest mb-5">Score Breakdown</div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-4">
            {Object.entries(report.scoreBreakdown).map(([key, val]) => (
              <div key={key}>
                <div className="flex justify-between mb-1.5">
                  <span className="font-mono text-xs text-muted">{SCORE_LABELS[key] ?? key}</span>
                  <span className="font-mono text-xs text-snow">{val}/10</span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${val * 10}%`,
                      backgroundColor: val >= 8 ? '#06D6A0' : val >= 6 ? '#F0A500' : '#FF6B35',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths / Weaknesses */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="font-mono text-xs text-muted uppercase tracking-widest mb-4">Strengths</div>
            <ul className="space-y-3">
              {report.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-emerald mt-0.5 shrink-0">✓</span>
                  <span className="text-snow/80 text-sm">{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-mono text-xs text-muted uppercase tracking-widest mb-4">Needs Work</div>
            <ul className="space-y-3">
              {report.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-live mt-0.5 shrink-0">✗</span>
                  <span className="text-snow/80 text-sm">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Before / After pitch */}
        {report.rewrittenPitch && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="font-mono text-xs text-muted uppercase tracking-widest">Pitch Rewrite</div>
              <button
                onClick={() => setShowRewritten(v => !v)}
                className="font-mono text-xs text-amber border border-amber/30 px-3 py-1 rounded hover:border-amber transition-colors"
              >
                {showRewritten ? 'Show original' : 'Show rewritten'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <div className="font-mono text-xs text-dim mb-2">ORIGINAL</div>
                <div className="bg-surface border border-border rounded-lg p-5 h-56 overflow-y-auto">
                  <p className="text-snow/50 text-sm leading-relaxed whitespace-pre-line">
                    {session?.pitch ?? ''}
                  </p>
                </div>
              </div>
              <div>
                <div className="font-mono text-xs text-amber mb-2">REWRITTEN ↑</div>
                <div className="bg-surface border border-amber/20 rounded-lg p-5 h-56 overflow-y-auto">
                  <p className="text-snow/90 text-sm leading-relaxed whitespace-pre-line">
                    {report.rewrittenPitch}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Launch kit */}
        {report.launchAssets.length > 0 && (
          <div>
            <div className="font-mono text-xs text-muted uppercase tracking-widest mb-5">Launch Kit</div>
            <div className="flex gap-2 flex-wrap mb-4">
              {report.launchAssets.map((a, i) => (
                <button
                  key={i}
                  onClick={() => setActiveAsset(i)}
                  className={`text-xs font-mono px-3 py-1.5 rounded border transition-colors ${
                    activeAsset === i
                      ? 'border-amber text-amber bg-amber/5'
                      : 'border-border text-muted hover:border-muted'
                  }`}
                >
                  {ASSET_LABEL[a.assetType] ?? a.assetType}
                </button>
              ))}
            </div>
            <div className="bg-surface border border-border rounded-lg p-6 min-h-32">
              <p className="text-snow/80 text-sm font-mono leading-relaxed whitespace-pre-line">
                {report.launchAssets[activeAsset]?.content}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pb-8">
          <button
            onClick={() => router.push('/')}
            className="font-display text-xl tracking-widest bg-amber text-void px-8 py-3 rounded hover:bg-amber-bright transition-colors"
          >
            RUN AGAIN →
          </button>
          <button
            onClick={() => router.push(`/session/${id}/room`)}
            className="font-mono text-sm text-muted border border-border px-6 py-3 rounded hover:border-muted transition-colors"
          >
            Back to room
          </button>
        </div>
      </div>
    </div>
  )
}
