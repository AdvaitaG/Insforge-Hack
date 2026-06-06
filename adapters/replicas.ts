import { AvatarConfig, AvatarSession } from '@/lib/types'

// DONIV: implement these two functions using the Replicas API

export async function createAvatar(config: AvatarConfig): Promise<AvatarSession> {
  // TODO: call Replicas API, create avatar with config, return session
  return {
    status: 'mock',
    providerAvatarId: `mock_${config.role}`,
    embedUrl: undefined,
    streamUrl: undefined,
  }
}

export async function speak(avatarId: string, text: string): Promise<AvatarSession> {
  // TODO: call Replicas API, send text to avatar, return updated session
  return {
    status: 'mock',
    providerAvatarId: avatarId,
  }
}
