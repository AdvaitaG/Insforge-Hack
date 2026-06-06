import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const repo = req.nextUrl.searchParams.get('repo')?.trim()
  if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    return NextResponse.json({ error: 'Valid repo required (owner/name)' }, { status: 400 })
  }

  const branches = ['main', 'master']
  let readme = ''

  for (const branch of branches) {
    const res = await fetch(`https://raw.githubusercontent.com/${repo}/${branch}/README.md`, {
      next: { revalidate: 300 },
    })
    if (res.ok) {
      readme = await res.text()
      break
    }
  }

  if (!readme) {
    return NextResponse.json({ error: 'README not found' }, { status: 404 })
  }

  return NextResponse.json({ readme, repo })
}
