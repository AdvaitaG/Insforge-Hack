import { NextRequest, NextResponse } from 'next/server'
import { createAvatar, personaForRole } from '@/adapters/replicas'
import { AvatarRole } from '@/lib/types'

// DONIV: Replicas avatar creation. Calls the adapter, which uses the real
// provider when REPLICAS_API_URL/KEY are set and falls back to mock otherwise.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const role = (body.role ?? 'founder') as AvatarRole

  const session = await createAvatar({
    role,
    displayName: body.displayName ?? 'Founder',
    persona: body.persona ?? personaForRole(role),
    script: body.script,
  }).catch(() => ({
    status: 'mock' as const,
    providerAvatarId: `mock_${role}`,
  }))

  return NextResponse.json(session)
}
