import { NextRequest, NextResponse } from 'next/server'

const BACKEND = 'http://127.0.0.1:8787'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.text()
  const res = await fetch(`${BACKEND}/api/sessions/${params.id}/answer`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  })
  return NextResponse.json(await res.json(), { status: res.status })
}
