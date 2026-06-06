import { NextRequest, NextResponse } from 'next/server'
import { MOCK_STARTUP } from '@/lib/mockData'

// ADVAITA: replace mock with InsForge/Postgres insert
export async function POST(req: NextRequest) {
  const body = await req.json()

  // TODO: insert into startups table, return real startup with id
  const startup = {
    ...MOCK_STARTUP,
    ...body,
    id: `startup_${Date.now()}`,
    createdAt: new Date().toISOString(),
  }

  return NextResponse.json(startup)
}
