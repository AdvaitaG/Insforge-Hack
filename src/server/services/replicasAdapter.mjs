/**
 * Replicas Adapter Service
 * 
 * Interfaces with the Replicas API to create avatar sessions and make them speak.
 * Falls back to mock mode when API is unavailable or not configured.
 */

const REPLICAS_API_URL = process.env.REPLICAS_API_URL || '';
const REPLICAS_API_KEY = process.env.REPLICAS_API_KEY || '';

/**
 * Check if Replicas API is configured and available
 */
function isReplicasConfigured() {
  return !!(REPLICAS_API_URL && REPLICAS_API_KEY);
}

/**
 * Create an avatar session with the given configuration
 * 
 * @param {Object} config - Avatar configuration
 * @param {string} config.role - Avatar role (founder, skeptical_partner, technical_partner, growth_partner)
 * @param {string} config.displayName - Display name for the avatar
 * @param {string} config.persona - Persona description for the avatar
 * @param {string} [config.script] - Optional script for the avatar to speak
 * @returns {Promise<Object>} Avatar session data
 */
export async function createAvatar(config) {
  if (!isReplicasConfigured()) {
    console.log('[replicasAdapter] Using mock mode - API not configured');
    return createMockAvatar(config);
  }

  try {
    const response = await fetch(`${REPLICAS_API_URL}/avatars`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${REPLICAS_API_KEY}`
      },
      body: JSON.stringify({
        role: config.role,
        display_name: config.displayName,
        persona: config.persona,
        script: config.script || ''
      })
    });

    if (!response.ok) {
      throw new Error(`Replicas API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      providerAvatarId: data.id,
      embedUrl: data.embed_url,
      streamUrl: data.stream_url,
      status: 'created'
    };
  } catch (error) {
    console.error('[replicasAdapter] API call failed, falling back to mock:', error.message);
    return createMockAvatar(config);
  }
}

/**
 * Make an avatar speak the given text
 * 
 * @param {string} avatarId - Provider avatar ID
 * @param {string} text - Text for the avatar to speak
 * @returns {Promise<Object>} Updated avatar session data
 */
export async function speak(avatarId, text) {
  if (!isReplicasConfigured()) {
    console.log('[replicasAdapter] Using mock mode for speak - API not configured');
    return {
      providerAvatarId: avatarId,
      status: 'speaking'
    };
  }

  try {
    const response = await fetch(`${REPLICAS_API_URL}/avatars/${avatarId}/speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${REPLICAS_API_KEY}`
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`Replicas API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      providerAvatarId: avatarId,
      embedUrl: data.embed_url,
      streamUrl: data.stream_url,
      status: 'speaking'
    };
  } catch (error) {
    console.error('[replicasAdapter] Speak API call failed, using mock:', error.message);
    return {
      providerAvatarId: avatarId,
      status: 'speaking'
    };
  }
}

/**
 * Create a mock avatar session for fallback mode
 * 
 * @param {Object} config - Avatar configuration
 * @returns {Object} Mock avatar session data
 */
function createMockAvatar(config) {
  return {
    providerAvatarId: `mock_${config.role}_${Date.now()}`,
    embedUrl: null,
    streamUrl: null,
    status: 'mock',
    role: config.role,
    displayName: config.displayName,
    persona: config.persona
  };
}

/**
 * Get avatar embed HTML for the given session
 * 
 * @param {Object} session - Avatar session data
 * @returns {string} HTML string for embed or placeholder
 */
export function getAvatarEmbed(session) {
  if (session.embedUrl) {
    return `<iframe src="${session.embedUrl}" allow="autoplay; encrypted-media" class="w-full h-full rounded-2xl" />`;
  }
  
  // Fallback placeholder
  return `
    <div class="w-full h-full rounded-2xl border-2 flex items-center justify-center bg-surface">
      <div class="text-center">
        <div class="text-6xl mb-2">🎭</div>
        <div class="text-sm text-muted">Avatar Mode</div>
      </div>
    </div>
  `;
}
