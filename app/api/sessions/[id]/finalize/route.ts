import { NextRequest, NextResponse } from 'next/server'
import { generateFinalReport } from '@/adapters/memoir'
import { MOCK_FINAL_REPORT } from '@/lib/mockData'

// ADVAITA: load answers from DB, persist final report back to pitch_sessions
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => ({}))

  // TODO: load context + originalPitch + answers from DB by session id
  const context = body.context ?? { companyName: 'PitchMirror', description: '', targetCustomer: '', problem: '', solution: '', whyNow: '' }
  const originalPitch = body.originalPitch ?? ''
  const answers = body.answers ?? []

  // ESHWAR: generateFinalReport will be implemented in adapters/memoir.ts
  const report = await generateFinalReport({ context, originalPitch, answers }).catch(
    () => MOCK_FINAL_REPORT
  )

  // TODO: update pitch_sessions with readiness_score, score_breakdown, rewritten_pitch

  return NextResponse.json(report)
}
