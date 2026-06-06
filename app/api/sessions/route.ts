import { NextRequest, NextResponse } from 'next/server'
import { generatePitchPackage } from '@/adapters/memoir'
import { MOCK_SESSION } from '@/lib/mockData'

// ADVAITA: replace mock with InsForge/Postgres insert + real startup lookup
export async function POST(req: NextRequest) {
  const { startupId } = await req.json()

  // TODO: load startup from DB by startupId
  const startupContext = {
    companyName: 'PitchMirror',
    description: 'AI Demo Day simulator',
    targetCustomer: 'Founders',
    problem: 'No good pitch practice',
    solution: 'AI investor replicas',
    whyNow: 'AI avatars are good enough now',
  }

  // ESHWAR: generatePitchPackage will be implemented in adapters/memoir.ts
  const pitchPackage = await generatePitchPackage(startupContext).catch(() => null)

  const session = {
    ...MOCK_SESSION,
    id: `session_${Date.now()}`,
    startupId,
    status: 'ready',
    ...(pitchPackage ?? {}),
    createdAt: new Date().toISOString(),
  }

  // TODO: insert session + questions + launch_assets into DB

  return NextResponse.json(session)
}
