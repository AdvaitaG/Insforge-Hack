import { NextRequest, NextResponse } from 'next/server'
<<<<<<< HEAD
import { speak } from '@/adapters/replicas'

// DONIV: Replicas speak endpoint. Sends founder pitch or investor question text
// to the avatar. Falls back to a mock "speaking" session if the provider fails.
=======

const API = process.env.BACKEND_URL ?? 'http://127.0.0.1:8787'

>>>>>>> 030eb1c202d8c24c7dc8b00a1e0ca7933e4e487b
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
<<<<<<< HEAD
  const { id } = params
  const { text } = await req.json().catch(() => ({ text: '' }))

  const session = await speak(id, text ?? '').catch(() => ({
    status: 'speaking' as const,
    providerAvatarId: id,
  }))

  return NextResponse.json(session)
=======
  const res = await fetch(`${API}/api/avatars/${params.id}/speak`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: await req.text(),
  })
  return NextResponse.json(await res.json(), { status: res.status })
>>>>>>> 030eb1c202d8c24c7dc8b00a1e0ca7933e4e487b
}
