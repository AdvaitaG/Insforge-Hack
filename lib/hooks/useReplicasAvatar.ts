/**
 * useReplicasAvatar Hook
 * 
 * Client-side hook for managing Replicas avatar sessions.
 * Handles avatar creation, speaking, and state management with fallback support.
 */

import { useState, useEffect, useCallback } from 'react'
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

  const createAvatar = useCallback(async (config: AvatarConfig) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/avatars/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        throw new Error(`Failed to create avatar: ${response.status}`)
      }

      const session = await response.json()
      setAvatarSession(session)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create avatar'
      setError(errorMessage)
      // Set mock session as fallback
      setAvatarSession({
        providerAvatarId: `mock_${config.role}_${Date.now()}`,
        status: 'mock'
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const speak = useCallback(async (text: string) => {
    if (!avatarSession?.providerAvatarId) {
      setError('No active avatar session')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/avatars/${avatarSession.providerAvatarId}/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        throw new Error(`Failed to make avatar speak: ${response.status}`)
      }

      const updated = await response.json()
      setAvatarSession(updated)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to make avatar speak'
      setError(errorMessage)
      // Still update status to speaking for mock mode
      setAvatarSession((prev: AvatarSession | null) => prev ? { ...prev, status: 'speaking' } : null)
    } finally {
      setIsLoading(false)
    }
  }, [avatarSession])

  const reset = useCallback(() => {
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
    reset
  }
}
