export type InvestorType =
  | 'skeptical_partner'
  | 'technical_partner'
  | 'growth_partner'

export type AssetType =
  | 'x_thread'
  | 'linkedin_post'
  | 'hacker_news_post'
  | 'product_hunt_tagline'
  | 'product_hunt_description'
  | 'demo_video_script'

export type StartupContext = {
  companyName: string
  description: string
  targetCustomer: string
  problem: string
  solution: string
  whyNow: string
  traction?: string
  businessModel?: string
  competitors?: string
  productUrl?: string
  repoUrl?: string
  founderVoiceSample?: string
}

export type Startup = StartupContext & {
  id: string
  createdAt: string
}

export type InvestorQuestion = {
  id: string
  investorType: InvestorType
  question: string
  answer?: string
  feedback?: string
  score?: number
}

export type LaunchAsset = {
  assetType: AssetType
  content: string
}

export type PitchPackage = {
  pitch: string
  oneLiner: string
  positioning: string
  proofPoints: string[]
  risks: string[]
  investorQuestions: InvestorQuestion[]
  launchAssets: LaunchAsset[]
}

export type Session = {
  id: string
  startupId: string
  status: 'generating' | 'ready' | 'in_progress' | 'completed'
  pitch?: string
  oneLiner?: string
  positioning?: string
  proofPoints?: string[]
  risks?: string[]
  questions?: InvestorQuestion[]
  launchAssets?: LaunchAsset[]
  readinessScore?: number
  scoreBreakdown?: Record<string, number>
  strengths?: string[]
  weaknesses?: string[]
  rewrittenPitch?: string
  createdAt: string
  completedAt?: string
}

export type FinalReport = {
  readinessScore: number
  scoreBreakdown: Record<string, number>
  strengths: string[]
  weaknesses: string[]
  rewrittenPitch: string
  launchAssets: LaunchAsset[]
}

export type AvatarRole =
  | 'founder'
  | 'skeptical_partner'
  | 'technical_partner'
  | 'growth_partner'

export type AvatarConfig = {
  role: AvatarRole
  displayName: string
  persona: string
  script?: string
}

export type AvatarSession = {
  providerAvatarId?: string
  embedUrl?: string
  streamUrl?: string
  status: 'mock' | 'created' | 'ready' | 'speaking' | 'complete'
}
