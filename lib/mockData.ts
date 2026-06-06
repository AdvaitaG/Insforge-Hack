import { FinalReport, PitchPackage, Session, Startup } from './types'

export const MOCK_STARTUP: Startup = {
  id: 'startup_demo',
  companyName: 'PitchMirror',
  description: 'AI Demo Day simulator that lets founders practice with investor avatars and get a rewritten pitch',
  targetCustomer: 'Early-stage technical founders',
  problem: 'Founders do not get enough high-quality pitch practice before Demo Day',
  solution: 'AI investor replicas simulate Demo Day with live questions and feedback',
  whyNow: 'AI avatars and marketing generation are now good enough to feel real',
  traction: 'Hackathon prototype — built in 4 hours',
  businessModel: 'SaaS, $49/simulation',
  competitors: 'Pitch deck tools and generic AI chatbots',
  productUrl: '',
  repoUrl: '',
  founderVoiceSample: '',
  createdAt: new Date().toISOString(),
}

export const MOCK_PITCH_PACKAGE: PitchPackage = {
  pitch: `Every founder has practiced their pitch in front of a mirror. We built the mirror that talks back like a YC partner.

PitchMirror is an AI Demo Day simulator. You enter your startup context, and in sixty seconds we generate a polished pitch, create a live founder avatar to present it, then bring in three AI investor partners who ask you the exact questions that will wreck you on stage.

After the Q&A, we score your answers, show you where you lost them, and rewrite your pitch based on your weaknesses. You leave with a stronger pitch and a full launch kit.

Our first users are technical founders who ship great products but struggle to explain them. We charge $49 per simulation. Our north star is founders who close their next round faster because they practiced here first.`,
  oneLiner: 'AI Demo Day practice room where investor avatars ask the questions that will wreck you on stage.',
  positioning: 'The fastest way for founders to pressure-test a pitch before it costs them a round.',
  proofPoints: [
    'Generates a 60-second YC-style pitch from a 5-minute intake form',
    'Three investor personas with distinct personalities and question styles',
    'Before/after pitch comparison shows measurable improvement per session',
  ],
  risks: [
    'AI investor questions may not fully replicate real investor styles',
    'Market may be too narrow if limited to pre-seed founders',
    'Founders may game the simulation rather than answer honestly',
  ],
  investorQuestions: [
    {
      id: 'q1',
      investorType: 'skeptical_partner',
      question: 'Why is this a venture-scale company? Pitch coaching feels like a services business, not a software one.',
    },
    {
      id: 'q2',
      investorType: 'technical_partner',
      question: 'What gets meaningfully better as more founders use PitchMirror? Where is the data flywheel?',
    },
    {
      id: 'q3',
      investorType: 'growth_partner',
      question: 'How do you get your first 100 paying founders? YC alumni network, cold outreach, or something else?',
    },
  ],
  launchAssets: [
    {
      assetType: 'x_thread',
      content: `We built a thing for founders:\n\nAI Demo Day simulator that actually talks back like a YC partner.\n\nEnter your startup → get a 60-second pitch → three AI investor replicas ask you the hard questions → your pitch gets rewritten based on your weakest answers.\n\nThread on why we built it 🧵`,
    },
    {
      assetType: 'linkedin_post',
      content: `Every founder practices their pitch. Almost none of them practice the Q&A.\n\nWe built PitchMirror to fix that.\n\nYou enter your startup context. We generate a YC-style pitch, a founder avatar presents it, then three AI investor partners grill you on market, product, and distribution.\n\nAfter the session you get a readiness score, a rewritten pitch, and a full launch kit.\n\nBuilt at InsForge Hackathon. Live today.`,
    },
    {
      assetType: 'hacker_news_post',
      content: `Show HN: PitchMirror – AI Demo Day simulator with investor avatars and pitch rewriting\n\nBuilt this at a hackathon in 4 hours. You paste your startup context, it generates a 60-second pitch, a founder avatar presents it, then three AI investors ask hard questions. After Q&A it scores your session and rewrites the pitch.\n\nStack: Next.js, InsForge, Replicas for avatars, Memoir for content generation.`,
    },
    {
      assetType: 'product_hunt_tagline',
      content: 'The AI Demo Day room that asks the questions VCs actually ask.',
    },
    {
      assetType: 'product_hunt_description',
      content: 'PitchMirror lets founders practice their Demo Day pitch against AI investor replicas. Enter your startup context, get a polished 60-second pitch, present it through a founder avatar, then face three investor personas who ask hard questions about market, technical depth, and growth. After the session, you get a readiness score, a rewritten pitch, and a full launch content package.',
    },
  ],
}

export const MOCK_SESSION: Session = {
  id: 'session_demo',
  startupId: 'startup_demo',
  status: 'ready',
  pitch: MOCK_PITCH_PACKAGE.pitch,
  oneLiner: MOCK_PITCH_PACKAGE.oneLiner,
  positioning: MOCK_PITCH_PACKAGE.positioning,
  proofPoints: MOCK_PITCH_PACKAGE.proofPoints,
  risks: MOCK_PITCH_PACKAGE.risks,
  questions: MOCK_PITCH_PACKAGE.investorQuestions,
  launchAssets: MOCK_PITCH_PACKAGE.launchAssets,
  createdAt: new Date().toISOString(),
}

export const MOCK_FINAL_REPORT: FinalReport = {
  readinessScore: 78,
  scoreBreakdown: {
    clarity: 9,
    urgency: 7,
    market: 6,
    differentiation: 8,
    productDepth: 7,
    gtm: 7,
    fundability: 7,
  },
  strengths: [
    'Extremely clear product explanation — judges understand PitchMirror in one sentence',
    'Strong emotional hook: "the mirror that talks back like a YC partner"',
    'Demo format is inherently theatrical and memorable',
  ],
  weaknesses: [
    'Market size argument is weak — needs a sharper venture-scale narrative',
    'No data flywheel or network effect articulated',
    'GTM beyond "technical founders" is vague — needs a concrete first channel',
  ],
  rewrittenPitch: `Every founder practices their pitch. Almost none of them practice the questions that kill them on stage.

PitchMirror is the AI Demo Day room. Five minutes on an intake form. We generate your 60-second pitch, a founder avatar presents it, then three AI investors ask the exact questions that will lose you the round.

We score every answer, show you where you broke down, and rewrite your pitch based on your weakest moments. You leave with a stronger pitch and the muscle memory of having been grilled.

50,000 companies raise in the US each year. Every single one of them needs to practice. We charge $49 per simulation. We are three engineers. We shipped this in four hours. Give us six months and PitchMirror will be the room every serious founder walks through before a partner meeting.`,
  launchAssets: MOCK_PITCH_PACKAGE.launchAssets,
}
