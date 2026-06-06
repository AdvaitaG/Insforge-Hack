import { FinalReport } from './types'

const PREFIX = 'ycsim:report:'

export type CachedReport = FinalReport & { session?: unknown }

export function cacheReport(sessionId: string, data: CachedReport) {
  try {
    sessionStorage.setItem(`${PREFIX}${sessionId}`, JSON.stringify(data))
  } catch {}
}

export function loadCachedReport(sessionId: string): CachedReport | null {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${sessionId}`)
    if (!raw) return null
    sessionStorage.removeItem(`${PREFIX}${sessionId}`)
    return JSON.parse(raw) as CachedReport
  } catch {
    return null
  }
}
