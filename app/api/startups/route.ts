import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL ?? 'http://127.0.0.1:8787'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const res = await fetch(`${BACKEND}/api/startups`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  })
  return NextResponse.json(await res.json(), { status: res.status })
}
