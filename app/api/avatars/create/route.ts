import { NextRequest, NextResponse } from 'next/server'
<<<<<<< HEAD
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
=======

const API = process.env.BACKEND_URL ?? 'http://127.0.0.1:8787'

export async function POST(req: NextRequest) {
  const res = await fetch(`${API}/api/avatars/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: await req.text(),
  })
  return NextResponse.json(await res.json(), { status: res.status })
>>>>>>> 030eb1c202d8c24c7dc8b00a1e0ca7933e4e487b
}
