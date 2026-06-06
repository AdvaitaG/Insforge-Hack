import { NextRequest, NextResponse } from 'next/server'
import { speak } from '@/adapters/replicas'

// DONIV: Replicas speak endpoint. Sends founder pitch or investor question text
// to the avatar. Falls back to a mock "speaking" session if the provider fails.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const { text } = await req.json().catch(() => ({ text: '' }))

  const session = await speak(id, text ?? '').catch(() => ({
    status: 'speaking' as const,
    providerAvatarId: id,
  }))

  return NextResponse.json(session)
}
