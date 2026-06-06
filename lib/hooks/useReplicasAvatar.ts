/**
 * useReplicasAvatar Hook
 *
 * Client-side hook for managing Replicas avatar sessions.
 * Handles avatar creation, speaking, and state management with fallback support.
 */

import { useState, useCallback, useRef } from 'react'
import { AvatarRole, AvatarSession } from '@/lib/types'

type AvatarConfig = {
  role: AvatarRole
  displayName: string
  persona: string
  script?: string
}

type UseReplicasAvatarReturn = {
  avatarSession: AvatarSession | null
  isLoading: boolean
  error: string | null
  isMock: boolean
  createAvatar: (config: AvatarConfig) => Promise<void>
  speak: (text: string) => Promise<void>
  reset: () => void
}

export function useReplicasAvatar(): UseReplicasAvatarReturn {
  const [avatarSession, setAvatarSession] = useState<AvatarSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const createdRoleRef = useRef<string | null>(null)
  const spokenTextRef = useRef<string | null>(null)
  const avatarIdRef = useRef<string | null>(null)

  const createAvatar = useCallback(async (config: AvatarConfig) => {
    const key = `${config.role}:${config.displayName}`
    if (createdRoleRef.current === key) return

    createdRoleRef.current = key
    spokenTextRef.current = null
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/avatars/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        throw new Error(`Failed to create avatar: ${response.status}`)
      }

      const session = await response.json()
      avatarIdRef.current = session.providerAvatarId ?? null
      setAvatarSession(session)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create avatar'
      setError(errorMessage)
      const mockId = `mock_${config.role}_${Date.now()}`
      avatarIdRef.current = mockId
      setAvatarSession({
        providerAvatarId: mockId,
        status: 'mock',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const speak = useCallback(async (text: string) => {
    const avatarId = avatarIdRef.current
    if (!avatarId) {
      setError('No active avatar session')
      return
    }
    if (spokenTextRef.current === text) return

    spokenTextRef.current = text

    try {
      const response = await fetch(`/api/avatars/${avatarId}/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error(`Failed to make avatar speak: ${response.status}`)
      }

      const updated = await response.json()
      avatarIdRef.current = updated.providerAvatarId ?? avatarId
      setAvatarSession(updated)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to make avatar speak'
      setError(errorMessage)
      setAvatarSession((prev: AvatarSession | null) =>
        prev ? { ...prev, status: 'speaking' } : null
      )
    }
  }, [])

  const reset = useCallback(() => {
    createdRoleRef.current = null
    spokenTextRef.current = null
    avatarIdRef.current = null
    setAvatarSession(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    avatarSession,
    isLoading,
    error,
    isMock: avatarSession?.status === 'mock',
    createAvatar,
    speak,
    reset,
  }
}
