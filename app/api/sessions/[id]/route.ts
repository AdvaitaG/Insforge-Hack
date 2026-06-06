import { NextRequest, NextResponse } from 'next/server'

const BACKEND = 'http://127.0.0.1:8787'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const res = await fetch(`${BACKEND}/api/sessions/${params.id}`)
  return NextResponse.json(await res.json(), { status: res.status })
}
