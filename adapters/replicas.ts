import { AvatarConfig, AvatarRole, AvatarSession } from '@/lib/types'

/**
 * Replicas avatar adapter (DONIV).
 *
 * Implements the avatar simulation layer exactly as detailed in the project
 * files (roles.md / YC_DEMO_DAY_SIMULATOR_PLAN.md):
 *
 *   createAvatar(config) -> AvatarSession
 *   speak(avatarId, text) -> AvatarSession
 *
 * Behaviour:
 *  - If REPLICAS_API_URL + REPLICAS_API_KEY are configured, calls the provider
 *    and maps its response into our AvatarSession shape.
 *  - Otherwise (default for the hackathon) it returns a deterministic mock
 *    session so the live room renders and advances through founder -> three
 *    investors with the transcript, per the required fallback in the spec.
 *
 * NOTE: The sponsor product at tryreplicas.com is a coding-agent platform and
 * does not expose a talking-head avatar API. This adapter therefore defaults to
 * the simulated/mock visual mode the project files endorse, while leaving a
 * clean env-driven seam for any real avatar provider.
 */

const REPLICAS_API_URL = process.env.REPLICAS_API_URL || ''
const REPLICAS_API_KEY = process.env.REPLICAS_API_KEY || ''

function isConfigured(): boolean {
  return Boolean(REPLICAS_API_URL && REPLICAS_API_KEY)
}

const ROLE_PERSONA: Record<AvatarRole, string> = {
  founder:
    'Confident technical founder presenting a crisp 60-second Demo Day pitch.',
  skeptical_partner:
    'Challenges market size, competition, urgency, and whether this can become a venture-scale company.',
  technical_partner:
    'Challenges product depth, defensibility, architecture, and whether this is more than a thin wrapper.',
  growth_partner:
    'Challenges first customer, distribution, pricing, retention, and repeat usage.',
}

/**
 * Deterministic mock avatar session — keeps the live room working with no API.
 */
function mockAvatar(config: AvatarConfig): AvatarSession {
  return {
    status: 'mock',
    providerAvatarId: `mock_${config.role}`,
    embedUrl: undefined,
    streamUrl: undefined,
  }
}

/**
 * Create (or load) an avatar for a given role.
 */
export async function createAvatar(config: AvatarConfig): Promise<AvatarSession> {
  if (!isConfigured()) {
    return mockAvatar(config)
  }

  try {
    const res = await fetch(`${REPLICAS_API_URL}/avatars`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${REPLICAS_API_KEY}`,
      },
      body: JSON.stringify({
        role: config.role,
        display_name: config.displayName,
        persona: config.persona || ROLE_PERSONA[config.role],
        script: config.script ?? '',
      }),
    })

    if (!res.ok) {
      throw new Error(`Replicas createAvatar failed: ${res.status}`)
    }

    const data = await res.json()
    return {
      status: 'created',
      providerAvatarId: data.id ?? data.avatar_id ?? `replica_${config.role}`,
      embedUrl: data.embed_url ?? data.embedUrl ?? undefined,
      streamUrl: data.stream_url ?? data.streamUrl ?? undefined,
    }
  } catch (err) {
    console.error('[replicas] createAvatar fell back to mock:', err)
    return mockAvatar(config)
  }
}

/**
 * Make an avatar speak the given text (founder pitch or investor question).
 */
export async function speak(avatarId: string, text: string): Promise<AvatarSession> {
  if (!isConfigured()) {
    return { status: 'speaking', providerAvatarId: avatarId }
  }

  try {
    const res = await fetch(`${REPLICAS_API_URL}/avatars/${avatarId}/speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${REPLICAS_API_KEY}`,
      },
      body: JSON.stringify({ text }),
    })

    if (!res.ok) {
      throw new Error(`Replicas speak failed: ${res.status}`)
    }

    const data = await res.json()
    return {
      status: 'speaking',
      providerAvatarId: avatarId,
      embedUrl: data.embed_url ?? data.embedUrl ?? undefined,
      streamUrl: data.stream_url ?? data.streamUrl ?? undefined,
    }
  } catch (err) {
    console.error('[replicas] speak fell back to mock:', err)
    return { status: 'speaking', providerAvatarId: avatarId }
  }
}

/** Convenience helper: default persona text for a role. */
export function personaForRole(role: AvatarRole): string {
  return ROLE_PERSONA[role]
}
