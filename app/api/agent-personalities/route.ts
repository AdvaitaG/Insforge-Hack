import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const API = process.env.BACKEND_URL ?? 'http://127.0.0.1:8787'

export async function GET() {
  const res = await fetch(`${API}/api/agent-personalities`)
  return NextResponse.json(await res.json(), { status: res.status })
}
