import { NextRequest, NextResponse } from 'next/server'
import { MOCK_SESSION } from '@/lib/mockData'

// ADVAITA: replace mock with InsForge/Postgres lookup
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  // TODO: query sessions + investor_questions + launch_assets by id
  const session = { ...MOCK_SESSION, id }

  return NextResponse.json(session)
}
