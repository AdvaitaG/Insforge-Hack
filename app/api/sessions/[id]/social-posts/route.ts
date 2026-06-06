import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const API = process.env.BACKEND_URL ?? 'http://127.0.0.1:8787'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const res = await fetch(`${API}/api/sessions/${params.id}/social-posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: await req.text(),
  })
  return NextResponse.json(await res.json(), { status: res.status })
}
