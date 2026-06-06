'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

const API_BASE = '/backend'

const COMPANY = {
  name: 'FlowDesk',
  tagline: 'AI-powered support that resolves 80% of tickets before a human sees them.',
  repo: 'flowdesk/flowdesk',
  mrr: '$18k MRR',
}

type SocialPost = { text: string; hook: string; imageData: string | null }
type SocialPosts = {
  x: SocialPost[]
  linkedin: SocialPost[]
  hackerNews: SocialPost[]
  productHunt: SocialPost[]
  instagram: SocialPost[]
}

// ─── Types ────────────────────────────────────────────────────────────────────

type InvestorTrait = 'thoughtful' | 'hostile' | 'analytical' | 'chaotic' | 'probing' | 'friendly'
type Mood = 'neutral' | 'curious' | 'excited' | 'skeptical' | 'bored'
type Tab = 'social' | 'demoday'

type Investor = {
  id: string; name: string; role: string; trait: InvestorTrait; color: string
  persona?: string; questionStyle?: string
  size: number; floatAnim: string; floatDur: string; floatDelay: string
  bobbleDur: string; bobbleDelay: string
  pos: { left: string; top: string }
  approachPos: { left: string; top: string }
  baseInterest: number; baseMood: Mood
  targetInterest: number; targetConviction: number
  thoughts: string[]
  pros: string[]; cons: string[]
  feasibilityNote: string; viabilityNote: string; overallNote: string
}

type InvestorStats = {
  interest: number; conviction: number; feasibility: number; viability: number
  mood: Mood; thought: string; thoughtIdx: number
}

type ChatEntry = { id: string; type: 'user' | 'investor'; text: string }
type Star = { x: number; y: number; size: number; opacity: number; dur: number; delay: number }

// ─── Investor Data ────────────────────────────────────────────────────────────

const DEFAULT_INVESTORS: Investor[] = [
  {
    id: 'pg', name: 'Paul G.', role: 'YC Founder', trait: 'thoughtful', color: '#FF6100',
    size: 78, floatAnim: 'float-1', floatDur: '11s', floatDelay: '0s', bobbleDur: '2.8s', bobbleDelay: '0s',
    pos: { left: '10%', top: '18%' }, approachPos: { left: '34%', top: '46%' },
    baseInterest: 40, baseMood: 'neutral', targetInterest: 70, targetConviction: 62,
    thoughts: [
      "Waiting to hear something I haven't seen before.",
      "The codebase integration is clever. Question is whether it holds up at scale.",
      "118% NRR doesn't lie. The product is working for someone.",
      "I've seen worse teams get further with less. This one might actually have it.",
    ],
    pros: ['Deep product context is a real differentiator from Zendesk', '118% NRR suggests genuine product-market fit', 'Team has direct prior experience with the problem'],
    cons: ['Market size narrative needs sharpening', 'No articulated data flywheel or compounding moat', 'GTM playbook is founder-led, which doesn\'t scale alone'],
    feasibilityNote: "Technically achievable — the retrieval-augmented approach is well-understood. The hard part is keeping the live index fresh across deployments.",
    viabilityNote: "Real business if they own the Support Engineering persona. The expansion revenue story is credible. Need to see if CAC stays under $1,500 as they move upmarket.",
    overallNote: "Would take a follow-up meeting. Not leading a round today, but want to watch this for 90 days.",
  },
  {
    id: 'skeptic', name: 'The Skeptic', role: 'Contrarian', trait: 'hostile', color: '#FF3535',
    size: 68, floatAnim: 'float-2', floatDur: '8s', floatDelay: '1.2s', bobbleDur: '1.8s', bobbleDelay: '0.5s',
    pos: { left: '74%', top: '12%' }, approachPos: { left: '63%', top: '46%' },
    baseInterest: 10, baseMood: 'skeptical', targetInterest: 42, targetConviction: 28,
    thoughts: [
      "Another AI support company. I've seen six this month.",
      "They didn't fall apart on the hard questions. Fine.",
      "The 80% number is suspicious. I want a customer reference call.",
      "I've been wrong before. I'm probably not wrong here.",
    ],
    pros: ['The codebase integration is a real technical moat if it works', '$18k MRR in 8 months is not embarrassing'],
    cons: ['80% resolution claim needs external validation', 'Market is crowded with well-funded competitors', 'No clear reason why OpenAI can\'t build this in 18 months'],
    feasibilityNote: "The retrieval pipeline is doable but fraught. One bad hallucination in a billing context and you've lost the customer forever.",
    viabilityNote: "Viable if they stay narrow and win one segment completely. Trying to be a platform too early will kill them.",
    overallNote: "Passed. Would revisit if they show three more months of clean NRR and a customer logo I recognize.",
  },
  {
    id: 'dana', name: 'YC Dana', role: 'YC Partner', trait: 'analytical', color: '#00B4D8',
    size: 74, floatAnim: 'float-3', floatDur: '13s', floatDelay: '2.5s', bobbleDur: '3.2s', bobbleDelay: '1.1s',
    pos: { left: '80%', top: '60%' }, approachPos: { left: '63%', top: '52%' },
    baseInterest: 35, baseMood: 'neutral', targetInterest: 68, targetConviction: 71,
    thoughts: [
      "The metrics will tell me everything.",
      "118% NRR and 83% 90-day retention. That's unusually clean.",
      "CAC at $1,200 blended is manageable. The question is what happens at $5k ACV.",
      "The cohort data is clean. This one's worth a closer look.",
    ],
    pros: ['Cohort retention metrics are unusually strong for this stage', 'Natural expansion revenue loop is built into the pricing structure', 'Clear ICP: Head of Support Engineering at Series A SaaS'],
    cons: ['CAC efficiency unclear at higher ACVs', 'No enterprise reference customers yet', 'Sales cycle at enterprise may be 6–9 months — capital intensive'],
    feasibilityNote: "Highly feasible. The technical stack is proven and the retrieval approach is well-validated in adjacent applications.",
    viabilityNote: "The unit economics at SMB are strong. The enterprise path is plausible but needs proof. Would want to see one $24k ACV contract.",
    overallNote: "Strong signal. Would recommend for YC if they can show one more month of consistent expansion revenue.",
  },
  {
    id: 'vc', name: 'Hype VC', role: 'Web3 Investor', trait: 'chaotic', color: '#A855F7',
    size: 62, floatAnim: 'float-4', floatDur: '9s', floatDelay: '0.7s', bobbleDur: '2.1s', bobbleDelay: '0.3s',
    pos: { left: '16%', top: '72%' }, approachPos: { left: '34%', top: '54%' },
    baseInterest: 55, baseMood: 'excited', targetInterest: 80, targetConviction: 52,
    thoughts: [
      "Support automation is going to be HUGE.",
      "The founder knows their numbers. That's rare.",
      "I want to put this on my portfolio page.",
      "Writing the check in my head. Need to tweet first.",
    ],
    pros: ['Strong viral potential through word-of-mouth in engineering communities', 'The AI angle is timely and highly fundable in current market', 'Founder energy is convincing'],
    cons: ['Unclear if there\'s a genuine community flywheel', 'Hype risk — might get copied by every major SaaS tooling company'],
    feasibilityNote: "Definitely feasible. The AI tooling has matured. Execution is the constraint, not technology.",
    viabilityNote: "Absolutely viable. Support is a pain point in every company I've funded. If they nail distribution this goes fast.",
    overallNote: "Writing a small check. This is a good bet at this stage. Want to be in the round.",
  },
  {
    id: 'journalist', name: 'TechCrunch', role: 'Journalist', trait: 'probing', color: '#06D6A0',
    size: 68, floatAnim: 'float-5', floatDur: '12s', floatDelay: '3s', bobbleDur: '2.6s', bobbleDelay: '1.8s',
    pos: { left: '60%', top: '80%' }, approachPos: { left: '63%', top: '55%' },
    baseInterest: 38, baseMood: 'curious', targetInterest: 60, targetConviction: 45,
    thoughts: [
      "What's the angle? Every story needs a villain.",
      "Zendesk as the disrupted legacy player works narratively.",
      "I need a customer quote. '60% cost reduction' would be the lede.",
      "Real TC headline territory. Need the customer reference.",
    ],
    pros: ['Clear narrative: AI vs. legacy support infrastructure', 'The 4.2 hours → 9 seconds stat is a great headline number', 'Founder is quotable — understands how to tell the story'],
    cons: ['Story is crowded — every AI startup is disrupting something', 'No public customer logos yet to anchor the narrative'],
    feasibilityNote: "From a story angle, the technology is credible enough. I've spoken to three engineers who confirmed the retrieval approach works.",
    viabilityNote: "Viable business, but the real story is whether they scale before incumbents react. The 2025 window is real.",
    overallNote: "Writing a feature story once they have one named customer logo. Will check back in 60 days.",
  },
  {
    id: 'angel', name: 'Angel Raj', role: 'Angel Investor', trait: 'friendly', color: '#FF6B35',
    size: 65, floatAnim: 'float-6', floatDur: '10s', floatDelay: '1.8s', bobbleDur: '3s', bobbleDelay: '0.8s',
    pos: { left: '6%', top: '48%' }, approachPos: { left: '34%', top: '50%' },
    baseInterest: 62, baseMood: 'curious', targetInterest: 84, targetConviction: 74,
    thoughts: [
      "I want to root for this team. Let's see what they've built.",
      "Real empathy for the problem. That's rarer than people think.",
      "118% NRR. This product is sticky. I want in.",
      "Writing a small check. This is going somewhere good.",
    ],
    pros: ['Founder has genuine conviction and clear product intuition', '118% NRR shows customers find ongoing value', 'Team has directly relevant experience from inside the problem'],
    cons: ['Early stage — meaningful execution risk remains', 'Need to see the fundraising strategy and use of capital'],
    feasibilityNote: "Completely feasible. The team has built harder things. James's background at Google is directly relevant.",
    viabilityNote: "Highly viable. The customer love is real — I spoke to one of their design partners and they couldn't imagine going back.",
    overallNote: "Writing a check. This is a team I want to back early and I believe in the product direction.",
  },
]

function initStats(investors: Investor[] = DEFAULT_INVESTORS): Record<string, InvestorStats> {
  return Object.fromEntries(
    investors.map(inv => [inv.id, {
      interest: inv.baseInterest, conviction: 0,
      feasibility: inv.trait === 'hostile' ? 48 : inv.trait === 'analytical' ? 75 : 65,
      viability: inv.trait === 'hostile' ? 30 : inv.trait === 'analytical' ? 68 : 55,
      mood: inv.baseMood, thought: inv.thoughts[0], thoughtIdx: 0,
    }])
  )
}

type AgentPersonality = {
  id: string
  role: string
  displayName: string
  category: string
  persona: string
  questionStyle: string
  systemPrompt: string
}

const PERSONALITY_COLORS = ['#FF6100', '#FF3535', '#00B4D8', '#A855F7', '#06D6A0', '#FF6B35']
const PERSONALITY_TRAITS: InvestorTrait[] = ['thoughtful', 'hostile', 'analytical', 'chaotic', 'probing', 'friendly']

function personalityToInvestor(persona: AgentPersonality, i: number): Investor {
  const fallback = DEFAULT_INVESTORS[i % DEFAULT_INVESTORS.length]
  return {
    ...fallback,
    id: persona.role,
    name: persona.displayName,
    role: persona.category === 'media' ? 'Journalist' : persona.displayName,
    trait: PERSONALITY_TRAITS[i % PERSONALITY_TRAITS.length],
    color: PERSONALITY_COLORS[i % PERSONALITY_COLORS.length],
    persona: persona.persona,
    questionStyle: persona.questionStyle,
    thoughts: [
      persona.persona,
      persona.questionStyle,
      `Testing whether ${persona.displayName.toLowerCase()} would believe this pitch.`,
      'Waiting for a specific, credible answer.',
    ],
    pros: [persona.persona, 'Persona is loaded from InsForge Postgres', 'Can be used by Gemini for in-character responses'],
    cons: [persona.questionStyle, 'Needs founder-specific evidence', 'Needs live demo proof'],
    feasibilityNote: persona.systemPrompt,
    viabilityNote: persona.questionStyle,
    overallNote: `${persona.displayName} is evaluating the pitch through an InsForge-stored persona.`,
  }
}

// ─── Chat Response Engine ─────────────────────────────────────────────────────

const RESPONSES: Record<InvestorTrait, Record<string, string[]>> = {
  thoughtful: {
    market: ["The market question is the one I keep circling back to. $11B in support software sounds big, but you're not taking all of it. What's your realistic wedge for year three?", "I want to believe in the market, but 'enterprise support is large' isn't a thesis. Where do you own a category no one else can credibly claim?"],
    tech: ["The technical moat question matters. Hallucinations in a support context could really hurt you — one wrong billing answer and you've lost that customer. How do you handle model errors?", "You're building on top of existing LLMs. What happens when Anthropic or OpenAI builds this natively into their API? Where's the moat that survives that?"],
    competition: ["Zendesk has 160,000 customers and a $4B R&D budget. The fact that they've failed at AI so far is interesting — but don't count on them failing forever.", "The honest answer is that you have maybe 18 months before Intercom ships something that looks like this. What's the moat you're building in that window?"],
    team: ["The Stripe background for Priya is directly relevant — she's seen this problem from the inside. That matters. What's the story for the rest of the team?", "I care less about logos and more about judgment. Tell me about a decision you made that turned out to be wrong and how you caught it."],
    traction: ["118% NRR is the number I keep coming back to. That doesn't happen unless the product is genuinely working. What's driving the expansion — is it seat growth or plan upgrades?", "Twelve customers at $18k MRR means an average ACV around $18k. That's a real number. How many are at the $299 tier vs. $899?"],
    invest: ["I'm not leading rounds right now, but I'd take a follow-up call to understand the Series A thesis better. What does the $2M get you?", "The question for me is timing. If I wait 90 days and the NRR holds, I'm more confident. Is there a reason to move now?"],
    default: ["That's an interesting framing. The thing I keep thinking about is whether the core insight — that context is the problem, not speed — is defensible long-term.", "Walk me through how you think about this. I want to understand the founder's mental model more than the deck."],
  },
  hostile: {
    market: ["$11B TAM is always the number AI startup decks use. It's always wrong. What's the actual serviceable market for your price point at your stage?", "You're not getting enterprise in year one. So the real question is: is the SMB market large enough to matter? I don't think it is."],
    tech: ["Your AI gives a wrong answer. Customer escalates. How does that situation not become a PR disaster?", "Every AI support company says 'we handle edge cases gracefully.' None of them do at scale. What makes you different?"],
    competition: ["OpenAI launches a native support agent product in 12 months. It's free for API customers. You're dead. Make the case you survive.", "Zendesk has tried this three times internally. They failed. But they'll hire the right team eventually. What's your defense when that happens?"],
    team: ["The Google NLP experience is relevant, but building a B2B SaaS GTM motion is a completely different skill. Who's done that before on your team?", "Show me a time the team disagreed on something important and how you resolved it. That tells me more than any credentials."],
    traction: ["$18k MRR in 8 months. A solo consultant makes that. This is not traction.", "$18k MRR across 12 customers means you're not charging enough or you haven't found the customers willing to pay more. Which is it?"],
    invest: ["I'm not investing at this stage. Come back when you have $50k MRR and two customers I can call.", "The deck is fine. The product is fine. I'm not the right fit here."],
    default: ["I've heard this pitch before. What's the thing that makes you different that you haven't told me yet?", "Okay, but what's the answer to the question that your investors are going to ask in due diligence that you're hoping they don't ask?"],
  },
  analytical: {
    market: ["I model markets bottom-up. Support Engineering at Series A SaaS: ~8,000 companies in the US, average support spend ~$240k/year. That's a $1.9B TAM before international. Enough for a real company.", "The $11B number is the total market. Your serviceable market is probably $200M in year three. That's fine — it doesn't need to be bigger to build a good business."],
    tech: ["What does the latency look like on the retrieval pipeline? For real-time support, anything over 3 seconds degrades the experience.", "How do you handle the case where the customer's question spans multiple integrations — GitHub, Stripe, and Notion simultaneously? What's the query architecture?"],
    competition: ["The Zendesk AI team has the distribution advantage. You have the integration depth advantage. The question is which matters more to buyers, and I think you're right that depth wins in the SMB segment.", "I've looked at the Intercom Fin product. Your resolution rate would beat theirs on the test suite I'd apply — but I'd want to see the data independently verified."],
    team: ["The team structure looks right. What's the equity split and does everyone have standard 4-year vesting? I've seen companies break on cap table issues at Series A.", "What's the plan if James leaves? Key-person risk on the CTO is something I'd want to understand before writing a check."],
    traction: ["Walk me through the cohort retention chart month by month. I want to see if there's a cliff somewhere after month three.", "118% NRR is strong. I've seen companies hit that on small customer counts and then revert to the mean as the base grows. How many customers do you need to be confident the number holds?"],
    invest: ["What's the milestone that justifies the valuation at Series A? I want to understand the step function in the business between now and then.", "I'd want to do a customer reference call before committing. Can you put me in contact with two customers at different tier sizes?"],
    default: ["Help me understand the unit economics at the $899 tier specifically. That's where I'd focus the business.", "What's the one number you track every morning to know if the business is healthy?"],
  },
  chaotic: {
    market: ["Bro the market is HUGE. Every company has support tickets. Every company hates them. This is a massive opportunity.", "Have you thought about the network effects angle? If every company's support data is in FlowDesk, you have the best training data in the world. That's a moat."],
    tech: ["Could you run this on device somehow? Like, what if the AI never left the customer's infrastructure? That could be a huge enterprise angle.", "What if you built a marketplace where companies could share anonymized support resolutions? That would be crazy defensible."],
    competition: ["Honestly I'd worry less about Zendesk and more about what you can build before they wake up. You have 18 months. Move fast.", "Have you thought about acquisitions? Like, buying a smaller Zendesk plugin with existing customers?"],
    team: ["The team sounds solid. Who's the growth person? You need someone who's done PLG before to build the bottom-up motion.", "What's the culture like? I've seen technically strong teams implode on culture. What are your values around speed vs. quality?"],
    traction: ["$18k MRR growing how fast month-over-month? That's the number that matters to me right now.", "118% NRR is insane. That means your customers are literally paying you more over time. That's the holy grail. How'd you build that?"],
    invest: ["I'm in. Seriously. What's the round structure? Are you doing SAFEs?", "I want to lead or co-lead. Who else is in the round? I know some great operators who could add value here."],
    default: ["This is genuinely exciting. What's the most ambitious version of where this goes in 5 years?", "Have you thought about international? Support is a global problem and EU regulation is creating new compliance requirements that could be a wedge."],
  },
  probing: {
    market: ["The $11B number comes from Gartner. I've seen three companies this week cite it. What's your original research on market size?", "Who are the three companies that would be your perfect reference customers? If you had them, what would that tell the market?"],
    tech: ["I spoke to an engineer at a mid-stage SaaS company. They said the main issue with AI support tools is hallucinating product features. How do you handle that specifically?", "What's the failure mode that your customers have complained about most? Not the ones you've fixed — the ones still on your backlog."],
    competition: ["I interviewed the VP of Product at Intercom last month. They described their AI ambitions in ways that sound a lot like your product. What's the timeline difference?", "Have you done a win-loss analysis? When you lose a deal, why do you lose it?"],
    team: ["How did Priya and James meet? I find founding team origin stories tell you a lot about how they'll handle adversity.", "What's the hardest thing the team has disagreed on and how did you resolve it?"],
    traction: ["Walk me through how you found your first three customers. Not the process — the actual story.", "You said 'design partners' earlier. What does that mean exactly? Were they paying? Giving feedback? Both?"],
    invest: ["What do investors who've passed say is their main concern? I've learned more from why people say no than from why they say yes.", "If I called your two best customers right now, what would they tell me that you wouldn't say in a pitch?"],
    default: ["What's the question you're hoping I don't ask?", "Tell me something about the business that's true but that makes you nervous."],
  },
  friendly: {
    market: ["The market is clearly there — I've talked to five founders who said they'd switch to something like this immediately. That's your distribution right there.", "I'm not worried about market size. I'm more excited about the founder's understanding of the customer. That's the rare thing here."],
    tech: ["The technical approach sounds solid. Are you using Claude for the retrieval? I've heard good things about the context window for exactly this use case.", "What would you build if you had the perfect infrastructure and no constraints? I always ask that because it tells me where the founder's head is."],
    competition: ["Competition is validation. The fact that Zendesk is trying to do this means the market is real. You just have to be faster.", "I actually think the incumbent advantage is overstated here. Enterprise support teams want the best tool, not the most familiar one."],
    team: ["Priya's Stripe background is perfect for this. How is she finding the transition from being an operator to a founder?", "I love that James has Google scale experience. What's it been like bringing that kind of engineering mindset to a startup context?"],
    traction: ["$18k MRR in 8 months with 12 customers and 118% NRR. Honestly that's really impressive for this stage. What does the pipeline look like?", "I want to introduce you to someone. I know a Head of Support Engineering at a $15M ARR company who would be your perfect customer. Can I make that intro?"],
    invest: ["I want to be in this round. What's the structure? I can move quickly.", "Tell me what you need most right now beyond capital. I have a network in the support tooling space that might be useful."],
    default: ["What's been the hardest part of building this so far? I always want to understand what founders find genuinely difficult.", "What do you wish more investors asked you about?"],
  },
}

function getResponse(investor: Investor, stats: InvestorStats, message: string): string {
  const msg = message.toLowerCase()
  let topic = 'default'
  if (/(market|tam|size|total|addressable|billion)/.test(msg)) topic = 'market'
  else if (/(tech|technical|build|ai|llm|model|retrieval|hallucin|error|scale)/.test(msg)) topic = 'tech'
  else if (/(compet|zendesk|intercom|rival|win|lose|beat|openai)/.test(msg)) topic = 'competition'
  else if (/(team|founder|engineer|hire|priya|james|culture)/.test(msg)) topic = 'team'
  else if (/(mrr|revenue|growth|traction|nrr|retention|customer|churn)/.test(msg)) topic = 'traction'
  else if (/(invest|check|round|raise|money|fund|capital|safe|equity)/.test(msg)) topic = 'invest'

  const bank = RESPONSES[investor.trait][topic]
  return bank[Math.floor(Math.random() * bank.length)]
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params?.id as string | undefined
  const [tab, setTab] = useState<Tab>('social')
  return (
    <div className="h-screen bg-void flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-display text-amber tracking-widest text-sm shrink-0">YCSIM</span>
          <span className="text-dim font-mono text-xs shrink-0">·</span>
          <span className="font-mono text-xs text-muted truncate">{COMPANY.repo}</span>
        </div>
        <div className="flex gap-1 bg-surface rounded-lg p-1 border border-border shrink-0">
          {(['social', 'demoday'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="font-mono text-xs px-4 py-1.5 rounded-md transition-all duration-200"
              style={{ background: tab === t ? '#FF6100' : 'transparent', color: tab === t ? '#060608' : '#6E6E84' }}>
              {t === 'social' ? 'SOCIAL' : 'DEMO DAY'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {sessionId && (
            <button
              onClick={() => router.push(`/session/${sessionId}`)}
              className="font-mono text-xs text-amber border border-amber/30 px-3 py-1.5 rounded hover:border-amber transition-colors hidden sm:block"
            >
              PRACTICE PITCH →
            </button>
          )}
          <span className="font-mono text-xs text-dim hidden md:block">gemini + replicas</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {tab === 'social' ? <SocialTab sessionId={sessionId} /> : <DemoDayTab />}
      </div>
    </div>
  )
}

// ─── Social Post Static Data ──────────────────────────────────────────────────

const SOCIAL_POSTS = {
  x: {
    handle: '@flowdesk_ai', name: 'FlowDesk', time: '2h',
    text: `We just hit $18k MRR.\n\nHere's what we've learned building AI support infrastructure for SaaS:\n\nThe problem isn't that support is slow. It's that agents don't know your product.\n\nFlowDesk reads your GitHub, your Notion, your error logs. It knows what broke before your customer finishes typing.\n\n80% resolution rate. 8-second avg response. Thread 🧵`,
    likes: 1243, retweets: 389, replies: 147,
  },
  linkedin: {
    name: 'Priya Nair', headline: 'CEO at FlowDesk · ex-Stripe Support Engineering', time: '3 hours ago',
    text: `I spent 6 years at Stripe watching brilliant engineers get woken up at 2am to answer tickets any AI should have handled.\n\nThat's why we built FlowDesk.\n\n12 paying customers. $18k MRR. 118% NRR.\n\nWe're just getting started.`,
    likes: 2810, comments: 134,
  },
  hn: {
    points: 1204,
    title: 'Show HN: FlowDesk – AI support that reads your codebase and resolves 80% of tickets automatically',
    text: `Built this after watching support costs at a Series A company 3x in 12 months. Core insight: most tools treat every ticket as unknown. We treat every ticket as a known problem we haven't seen from this customer yet.`,
    submitter: 'priya_nair', time: '5 hours ago', comments: 287,
  },
  ph: {
    upvotes: 847, name: 'FlowDesk',
    tagline: 'AI support that resolves 80% of tickets before a human ever sees them.',
    description: `FlowDesk connects to your GitHub, Notion, Stripe, and product database. When a ticket arrives, it already knows what's wrong.\n\n→ 80% automated resolution rate\n→ 8-second average response time\n→ Full context handoff for the other 20%`,
    badge: '#1 Product of the Day',
  },
}

// ─── Social Tab ───────────────────────────────────────────────────────────────

type Platform = 'x' | 'linkedin' | 'hn' | 'ph'
const PLATFORM_LABELS: Record<Platform, string> = {
  x: 'X / Twitter', linkedin: 'LinkedIn', hn: 'Hacker News', ph: 'Product Hunt',
}

type SimComment = {
  id: string; author: string; handle?: string; title?: string
  badge?: string | null; timeAgo: string; text: string
  likes?: number; replies?: number; points?: number; isFounder?: boolean
}

const SIMULATED_COMMENTS: Record<string, SimComment[]> = {
  x: [
    { id: 'x1', author: 'Lena Park', handle: '@lenapark_dev', timeAgo: '1h', text: 'We tried building this in-house at our Series A. Took 4 months, still broken. This makes me feel seen.', likes: 312, replies: 14 },
    { id: 'x2', author: 'Marcus T.', handle: '@mtoliver', timeAgo: '1h', text: 'The 80% claim sounds high. What\'s the methodology? Asking because I\'ve seen a lot of inflated numbers in this space.', likes: 87, replies: 22 },
    { id: 'x3', author: 'YC Alumni', handle: '@ycalumni', timeAgo: '2h', text: 'Adding to our weekly AI tools thread. Strong metrics for early stage.', likes: 445, replies: 8 },
    { id: 'x4', author: 'Maya R.', handle: '@mayar_pm', timeAgo: '2h', text: 'Is there a waitlist? Our support volume doubled after our last launch and we\'re drowning.', likes: 201, replies: 5 },
    { id: 'x5', author: 'Dev Skeptic', handle: '@notanotheraisaas', timeAgo: '3h', text: 'Another "80%" AI product. I\'ll believe it when I see a live demo with a real ticket.', likes: 34, replies: 41 },
    { id: 'x6', author: 'FlowDesk', handle: '@flowdesk_ai', timeAgo: '2h', text: '@notanotheraisaas DM us. We\'ll run your last 50 tickets live. No prep, no cherry picking.', likes: 892, replies: 67, isFounder: true },
  ],
  linkedin: [
    { id: 'l1', author: 'Rahul Mehta', title: 'VP Engineering · Notion', timeAgo: '2h', text: 'The cost-per-ticket economics are genuinely disruptive. We\'ve been evaluating similar tools and nothing comes close on resolution rate.', likes: 847 },
    { id: 'l2', author: 'Sarah Chen', title: 'Head of Support · Figma', timeAgo: '2h', text: 'The thing that doesn\'t get said enough: the escalation handoff. Context summary alone saves my team 20 minutes per ticket.', likes: 612 },
    { id: 'l3', author: 'Tom Wallace', title: 'Partner · Sequoia', timeAgo: '3h', text: 'The NRR is the signal. 118% means customers are discovering value they didn\'t expect. That\'s the product doing the selling.', likes: 1204 },
    { id: 'l4', author: 'Priya Nair', title: 'CEO · FlowDesk', timeAgo: '1h', text: 'Thank you all — special thanks to the team at Linear who gave us brutal early feedback that made the product 10x better.', likes: 2100, isFounder: true },
  ],
  hn: [
    { id: 'h1', author: 'jmathai', timeAgo: '4h', points: 312, text: 'The retrieval architecture is the interesting part. Per-customer indexes or a shared embedding space? Former is more accurate but operationally painful at scale.' },
    { id: 'h2', author: 'throwaway_cto', timeAgo: '4h', points: 201, text: 'We evaluated 6 AI support tools over 3 months. FlowDesk was the only one that could handle multi-turn conversations where the user\'s question changed mid-thread.' },
    { id: 'h3', author: 'skepticaluser99', timeAgo: '5h', points: 88, text: '"80% resolution rate" — methodology please. What counts as resolved? Does the user confirm or does timeout = resolved?' },
    { id: 'h4', author: 'priya_nair', timeAgo: '4h', points: 445, text: 'Founder here. Per-customer indexes. Resolved = user closes ticket or doesn\'t reopen within 48h. ~73% confirmed by user. Happy to share the full writeup.', isFounder: true },
    { id: 'h5', author: 'vc_lurker', timeAgo: '5h', points: 67, text: 'This is either the next Zendesk or dead in 18 months when Anthropic ships a native support agent. No middle ground.' },
    { id: 'h6', author: 'distributed_sys', timeAgo: '3h', points: 178, text: 'The GitHub integration is the killer feature nobody\'s talking about. Knowing the error is from a deploy 3h ago changes the entire resolution path.' },
  ],
  ph: [
    { id: 'p1', author: 'James L.', badge: 'Top Hunter', timeAgo: '3h', text: 'Hunted this after seeing the Stripe reference. Priya\'s background is perfect founder-market fit. Congrats! 🎉', likes: 234 },
    { id: 'p2', author: 'Ana V.', badge: null, timeAgo: '3h', text: 'How does custom model fine-tuning work at the $2,499 tier? Trained on our tickets or just docs?', likes: 89 },
    { id: 'p3', author: 'FlowDesk Team', badge: 'Maker', timeAgo: '2h', text: 'At the top tier we fine-tune on your anonymized resolved tickets + full documentation corpus. It learns patterns specific to your product, not generic FAQ.', likes: 312, isFounder: true },
    { id: 'p4', author: 'Ben K.', badge: null, timeAgo: '4h', text: 'Been using this 2 months. The ROI calculator told me we\'d save $180k/year. Then it actually delivered. Wild.', likes: 567 },
    { id: 'p5', author: 'Sam R.', badge: null, timeAgo: '2h', text: 'Does it work with Discord-based support? A lot of dev-focused companies run support there.', likes: 45 },
  ],
  instagram: [
    { id: 'i1', author: 'techfounder_vc', timeAgo: '1h', text: '🔥 this is exactly what we\'ve been looking for', likes: 847 },
    { id: 'i2', author: 'saas_operators', timeAgo: '2h', text: 'shipping this to our portfolio immediately 📦', likes: 423 },
    { id: 'i3', author: 'build_in_public', timeAgo: '2h', text: 'love seeing real MRR numbers, so refreshing 🙌', likes: 312 },
    { id: 'i4', author: 'ycombinator', timeAgo: '3h', text: '118% NRR says everything.', likes: 2100 },
  ],
}

const MANAGER_TIPS = [
  {
    category: 'Niches to target', icon: '🎯', color: '#FF6100',
    tips: [
      'Series A SaaS with 2–15 person support teams — feel the pain, have the budget',
      'Developer tool companies: high ticket complexity, zero tolerance for slow support',
      'Vertical SaaS (fintech, legal tech) where AI context is a compliance advantage',
    ]
  },
  {
    category: 'Content that converts', icon: '📣', color: '#00B4D8',
    tips: [
      '"4.2 hours → 9 seconds" as a standalone graphic — stats like this go viral on X',
      'HN Show HN with methodology transparency: publish your resolution rate data openly',
      'LinkedIn long-form from the founder\'s POV performs 3× better than brand posts',
    ]
  },
  {
    category: 'Engagement tactics', icon: '🔁', color: '#06D6A0',
    tips: [
      'Reply to every negative comment publicly — turns skeptics into live proof points',
      '"Run your last 50 tickets free" converts skeptical threads to demo calls instantly',
      'Share 1 anonymized resolved ticket/week showing the AI reasoning chain',
    ]
  },
  {
    category: 'Platform priority', icon: '📊', color: '#A855F7',
    tips: [
      'X/Twitter: highest founder-to-VC reach, post 3×/week minimum for algorithm',
      'HN: one well-timed Show HN can drive 500+ signups — invest in the writeup',
      'LinkedIn: founder\'s personal brand > company page, push all content through them',
    ]
  },
]

function SocialTab({ sessionId }: { sessionId?: string }) {
  const [active, setActive] = useState<Platform>('x')
  const [posts, setPosts] = useState<SocialPosts | null>(null)
  const [loading, setLoading] = useState(false)
  const [postIndex, setPostIndex] = useState<Record<Platform, number>>({ x: 0, linkedin: 0, hn: 0, ph: 0 })

  useEffect(() => {
    if (!sessionId) return
    setLoading(true)
    fetch(`${API_BASE}/api/sessions/${sessionId}/social-posts`, { method: 'POST' })
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [sessionId])

  const platformKey = active === 'hn' ? 'hackerNews' : active === 'ph' ? 'productHunt' : active
  const currentPosts: SocialPost[] = (posts as any)?.[platformKey] ?? []
  const idx = postIndex[active]
  function setIdx(n: number) { setPostIndex(prev => ({ ...prev, [active]: n })) }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-1 px-6 py-3 border-b border-border shrink-0 overflow-x-auto">
        {(Object.keys(PLATFORM_LABELS) as Platform[]).map(p => (
          <button key={p} onClick={() => setActive(p)}
            className="font-mono text-xs px-3 py-1.5 rounded border transition-all shrink-0"
            style={{ borderColor: active === p ? '#FF6100' : '#1E1E2E', color: active === p ? '#FF6100' : '#6E6E84', background: active === p ? 'rgba(255,97,0,0.05)' : 'transparent' }}>
            {PLATFORM_LABELS[p]}
          </button>
        ))}
        <div className="ml-auto font-mono text-xs text-dim shrink-0 pl-4">
          {loading ? 'generating with gemini...' : posts ? 'generated · not posted' : 'gemini · not posted'}
        </div>
      </div>
      {/* Two-column body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: post + comments */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-amber border-t-transparent animate-spin" />
              <div className="font-mono text-xs text-dim">Generating posts...</div>
            </div>
          ) : (
            <div className="max-w-lg mx-auto" key={`${active}-${idx}`} style={{ animation: 'fade-in 0.3s ease-out' }}>
              {currentPosts.length > 1 && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1.5">
                    {currentPosts.map((_, i) => (
                      <button key={i} onClick={() => setIdx(i)} className="rounded-full transition-all duration-200"
                        style={{ width: i === idx ? 20 : 8, height: 8, background: i === idx ? '#FF6100' : '#3E3E52' }} />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}
                      className="font-mono text-xs px-2 py-1 rounded border border-border text-muted disabled:opacity-30 hover:border-amber transition-colors">←</button>
                    <button onClick={() => setIdx(Math.min(currentPosts.length - 1, idx + 1))} disabled={idx >= currentPosts.length - 1}
                      className="font-mono text-xs px-2 py-1 rounded border border-border text-muted disabled:opacity-30 hover:border-amber transition-colors">→</button>
                  </div>
                </div>
              )}
              {currentPosts[idx]?.imageData && (
                <img src={currentPosts[idx].imageData!} alt="Generated post visual"
                  className="w-full rounded-xl object-cover mb-3" style={{ maxHeight: 220 }} />
              )}
              {active === 'x' && <XCard post={currentPosts[idx] ?? null} />}
              {active === 'linkedin' && <LinkedInCard post={currentPosts[idx] ?? null} />}
              {active === 'hn' && <HNCard post={currentPosts[idx] ?? null} />}
              {active === 'ph' && <PHCard post={currentPosts[idx] ?? null} />}
            </div>
          )}
        </div>

        {/* Right: social media manager */}
        <div className="w-72 shrink-0 border-l border-border overflow-y-auto bg-stage">
          <SocialManager platform={active} />
        </div>
      </div>
    </div>
  )
}

// ─── X / Twitter Card ────────────────────────────────────────────────────────

function XCard({ post }: { post: SocialPost | null }) {
  const p = SOCIAL_POSTS.x
  const text = post?.text ?? p.text
  const [open, setOpen] = useState(false)
  const S = { fontFamily: '-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif' }
  return (
    <div style={{ ...S, borderRadius: 16, overflow: 'hidden', border: '1px solid #2f3336' }}>
      {/* Tweet */}
      <div style={{ background: '#000', padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FF6100', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>F</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{p.name}</span>
              <span style={{ color: '#71767b', fontSize: 15 }}>{p.handle}</span>
              <span style={{ color: '#71767b', fontSize: 15 }}>·</span>
              <span style={{ color: '#71767b', fontSize: 15 }}>{p.time}</span>
            </div>
            <p style={{ color: '#e7e9ea', fontSize: 15, lineHeight: '20px', margin: '4px 0 12px', whiteSpace: 'pre-line' }}>{text}</p>
            {/* Stats bar */}
            <div style={{ display: 'flex', color: '#71767b', fontSize: 13, padding: '4px 0', borderTop: '1px solid #2f3336', marginTop: 4 }}>
              <button onClick={() => setOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#71767b', cursor: 'pointer', flex: 1, padding: '8px 0' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01z" stroke="currentColor" strokeWidth="2"/></svg>
                {p.replies.toLocaleString()}
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#71767b', cursor: 'pointer', flex: 1, padding: '8px 0' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"/></svg>
                {p.retweets.toLocaleString()}
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#71767b', cursor: 'pointer', flex: 1, padding: '8px 0' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>
                {p.likes.toLocaleString()}
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#71767b', cursor: 'pointer', flex: 1, padding: '8px 0' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/></svg>
                14.2K
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Replies */}
      {open && SIMULATED_COMMENTS.x.map(c => (
        <div key={c.id} style={{ background: c.isFounder ? '#0a0500' : '#000', borderTop: '1px solid #2f3336', padding: '12px 16px', display: 'flex', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.isFounder ? '#FF6100' : '#2f3336', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.isFounder ? '#000' : '#71767b', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{c.author[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: '#e7e9ea', fontWeight: 700, fontSize: 14 }}>{c.author}</span>
              <span style={{ color: '#71767b', fontSize: 14 }}>{c.handle}</span>
              <span style={{ color: '#71767b', fontSize: 14 }}>· {c.timeAgo}</span>
            </div>
            <p style={{ color: '#e7e9ea', fontSize: 14, lineHeight: '20px', margin: '2px 0 8px' }}>{c.text}</p>
            <div style={{ display: 'flex', gap: 20, color: '#71767b', fontSize: 12 }}>
              <span>💬 {c.replies}</span><span>🔁</span><span>❤️ {c.likes?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── LinkedIn Card ────────────────────────────────────────────────────────────

function LinkedInCard({ post }: { post: SocialPost | null }) {
  const p = SOCIAL_POSTS.linkedin
  const text = post?.text ?? p.text
  const [open, setOpen] = useState(false)
  const S = { fontFamily: '-apple-system,"Segoe UI",Roboto,"Noto Sans",sans-serif' }
  return (
    <div style={{ ...S, borderRadius: 8, overflow: 'hidden', boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.12)' }}>
      {/* Post */}
      <div style={{ background: '#fff' }}>
        <div style={{ padding: '12px 16px 0' }}>
          {/* Profile row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#0A66C2', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 700 }}>P</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#000000de', fontWeight: 600, fontSize: 14, lineHeight: '20px' }}>
                {p.name} <span style={{ color: '#00000099', fontWeight: 400, fontSize: 12 }}>• 2nd</span>
              </div>
              <div style={{ color: '#00000099', fontSize: 12, lineHeight: '16px' }}>{p.headline}</div>
              <div style={{ color: '#00000099', fontSize: 12 }}>{p.time} · <span style={{ fontSize: 13 }}>🌐</span></div>
            </div>
            <button style={{ alignSelf: 'flex-start', color: '#0A66C2', fontWeight: 600, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>+ Follow</button>
          </div>
          <p style={{ color: '#000000de', fontSize: 14, lineHeight: '20px', marginBottom: 12, whiteSpace: 'pre-line' }}>{text}</p>
          {/* Reactions summary */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#00000099', fontSize: 12 }}>
              <span style={{ fontSize: 14 }}>👍</span><span style={{ fontSize: 14 }}>💡</span><span style={{ fontSize: 14 }}>❤️</span>
              <span style={{ marginLeft: 2 }}>{p.likes.toLocaleString()}</span>
            </div>
            <button onClick={() => setOpen(v => !v)} style={{ color: '#00000099', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}>
              {p.comments} comments {open ? '▲' : '▼'}
            </button>
          </div>
          {/* Action bar */}
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[['👍', 'Like'], ['💬', 'Comment'], ['↺', 'Repost'], ['➤', 'Send']].map(([icon, label]) => (
              <button key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 8px', borderRadius: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#00000099', fontSize: 13, fontWeight: 600 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>{label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Comments */}
      {open && (
        <div style={{ background: '#f3f2ef' }}>
          {SIMULATED_COMMENTS.linkedin.map(c => (
            <div key={c.id} style={{ padding: '12px 16px', display: 'flex', gap: 8, background: c.isFounder ? '#e8f0fb' : 'transparent', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.isFounder ? '#0A66C2' : '#8f5849', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{c.author[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ background: '#fff', borderRadius: 8, padding: '8px 12px', boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }}>
                  <div style={{ color: '#000000de', fontWeight: 600, fontSize: 13 }}>{c.author}{c.isFounder ? ' • Author' : ''}</div>
                  <div style={{ color: '#00000099', fontSize: 12 }}>{c.title}</div>
                  <p style={{ color: '#000000cc', fontSize: 13, lineHeight: '18px', marginTop: 6 }}>{c.text}</p>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, color: '#00000099', fontSize: 12 }}>
                  <span>👍 {c.likes?.toLocaleString()}</span><span style={{ cursor: 'pointer' }}>Like</span><span style={{ cursor: 'pointer' }}>Reply</span><span>{c.timeAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Hacker News Card ─────────────────────────────────────────────────────────

function HNCard({ post }: { post: SocialPost | null }) {
  const p = SOCIAL_POSTS.hn
  const [open, setOpen] = useState(false)
  const S = { fontFamily: 'Verdana,Geneva,sans-serif' }
  return (
    <div style={{ ...S, borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
      {/* Orange header bar */}
      <div style={{ background: '#ff6600', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ background: '#fff', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: '#ff6600', borderRadius: 2 }}>Y</div>
        <span style={{ color: '#000', fontWeight: 700, fontSize: 13 }}>Hacker News</span>
        <span style={{ color: '#000', opacity: 0.6, fontSize: 13 }}>|</span>
        {['new', 'past', 'ask', 'show', 'submit'].map(l => (
          <span key={l} style={{ color: '#000', fontSize: 12, cursor: 'pointer', opacity: 0.85 }}>{l}</span>
        ))}
      </div>
      {/* Body */}
      <div style={{ background: '#f6f6ef', padding: '8px 4px' }}>
        <div style={{ display: 'flex', gap: 4, padding: '4px 8px' }}>
          <div style={{ color: '#999', fontSize: 16, lineHeight: 1, paddingTop: 2 }}>▲</div>
          <div>
            <div style={{ fontSize: 14, color: '#000', lineHeight: '20px' }}>
              {p.title}{' '}
              <span style={{ color: '#828282', fontSize: 12 }}>(flowdesk.ai)</span>
            </div>
            <div style={{ fontSize: 12, color: '#828282', marginTop: 3 }}>
              {p.points} points by{' '}
              <span style={{ color: '#000', cursor: 'pointer' }}>{p.submitter}</span>{' '}
              {p.time} | hide |{' '}
              <button onClick={() => setOpen(v => !v)} style={{ background: 'none', border: 'none', color: '#828282', cursor: 'pointer', fontSize: 12, padding: 0 }}>
                {p.comments} comments {open ? '▲' : '▼'}
              </button>
            </div>
            <p style={{ fontSize: 13, color: '#000', marginTop: 6, lineHeight: '18px' }}>{post?.text ?? p.text}</p>
          </div>
        </div>
      </div>
      {/* Comments */}
      {open && (
        <div style={{ background: '#f6f6ef', borderTop: '1px solid #e6e6da' }}>
          {SIMULATED_COMMENTS.hn.map((c, i) => (
            <div key={c.id} style={{ padding: '10px 12px', borderBottom: '1px solid #e6e6da', background: c.isFounder ? '#fff9e6' : i % 2 === 0 ? '#f6f6ef' : '#fafaf4' }}>
              <div style={{ fontSize: 11, color: '#828282', marginBottom: 4 }}>
                <span style={{ cursor: 'pointer', color: '#aaa', marginRight: 4 }}>▲</span>
                <span style={{ fontWeight: 700, color: c.isFounder ? '#ff6600' : '#000', cursor: 'pointer' }}>{c.author}</span>
                {c.isFounder && <span style={{ color: '#ff6600' }}> (author)</span>}
                {' '}{c.points} points{' '}{c.timeAgo}
                {' | '}<span style={{ cursor: 'pointer' }}>hide</span>
                {' | '}<span style={{ cursor: 'pointer' }}>reply</span>
              </div>
              <p style={{ fontSize: 13, color: '#000', lineHeight: '18px', margin: 0 }}>{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Product Hunt Card ────────────────────────────────────────────────────────

function PHCard({ post }: { post: SocialPost | null }) {
  const p = SOCIAL_POSTS.ph
  const [open, setOpen] = useState(false)
  const S = { fontFamily: '-apple-system,"Segoe UI",Roboto,sans-serif' }
  return (
    <div style={{ ...S, borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)' }}>
      {/* Card */}
      <div style={{ background: '#fff', padding: '20px' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          {/* Upvote */}
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', background: '#fff', minWidth: 56, gap: 2 }}>
            <span style={{ color: '#da552f', fontSize: 16 }}>▲</span>
            <span style={{ color: '#da552f', fontWeight: 700, fontSize: 15 }}>{p.upvotes}</span>
          </button>
          {/* Content */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: '#FF6154', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 700, flexShrink: 0 }}>F</div>
              <div>
                <div style={{ color: '#1a1a1a', fontWeight: 700, fontSize: 16 }}>{p.name}</div>
                <div style={{ color: '#4b4b4b', fontSize: 14 }}>{p.tagline}</div>
              </div>
            </div>
            <p style={{ color: '#4b4b4b', fontSize: 14, lineHeight: '20px', whiteSpace: 'pre-line', marginBottom: 12 }}>{post?.text ?? p.description}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {['B2B SaaS', 'Artificial Intelligence', 'Customer Support', 'Productivity'].map(tag => (
                <span key={tag} style={{ background: '#f2f2f2', color: '#555', fontSize: 12, padding: '3px 10px', borderRadius: 999 }}>{tag}</span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff8f0', border: '1px solid #ffd0a0', borderRadius: 999, padding: '4px 12px' }}>
                <span style={{ fontSize: 13 }}>🏆</span>
                <span style={{ color: '#da552f', fontSize: 12, fontWeight: 600 }}>{p.badge}</span>
              </div>
              <button onClick={() => setOpen(v => !v)} style={{ background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer' }}>
                💬 {SIMULATED_COMMENTS.ph.length} comments {open ? '▲' : '▼'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Comments */}
      {open && (
        <div style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
          {SIMULATED_COMMENTS.ph.map(c => (
            <div key={c.id} style={{ padding: '14px 20px', display: 'flex', gap: 12, borderBottom: '1px solid #f0f0f0', background: c.isFounder ? '#fff9f6' : '#fff' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.isFounder ? '#FF6154' : '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{c.author[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ color: '#1a1a1a', fontWeight: 600, fontSize: 14 }}>{c.author}</span>
                  {c.badge && (
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, fontWeight: 600, background: c.badge === 'Maker' ? '#e8f4fd' : '#fff0e8', color: c.badge === 'Maker' ? '#0A66C2' : '#da552f' }}>{c.badge}</span>
                  )}
                  <span style={{ color: '#aaa', fontSize: 12, marginLeft: 'auto' }}>{c.timeAgo}</span>
                </div>
                <p style={{ color: '#4b4b4b', fontSize: 14, lineHeight: '20px' }}>{c.text}</p>
                <div style={{ marginTop: 6 }}>
                  <span style={{ color: '#da552f', fontSize: 13 }}>▲ {c.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SocialManager({ platform }: { platform: Platform }) {
  return (
    <div className="p-4 space-y-5">
      <div className="pt-2">
        <div className="font-display text-amber tracking-widest text-xs">SOCIAL MANAGER</div>
        <div className="font-mono text-xs text-dim mt-0.5 leading-relaxed">AI strategy for your product launch</div>
      </div>

      {MANAGER_TIPS.map(section => (
        <div key={section.category} className="space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{section.icon}</span>
            <span className="font-mono text-xs font-bold uppercase tracking-wide" style={{ color: section.color, fontSize: '9px' }}>
              {section.category}
            </span>
          </div>
          <ul className="space-y-2">
            {section.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="shrink-0 mt-1.5 rounded-full" style={{ width: 4, height: 4, background: section.color, display: 'inline-block' }} />
                <span className="text-snow/65 leading-snug" style={{ fontSize: '11px' }}>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="rounded-xl p-3 space-y-2.5" style={{ background: 'rgba(255,97,0,0.07)', border: '1px solid rgba(255,97,0,0.18)' }}>
        <div className="font-mono text-xs text-amber font-bold">Quick wins this week</div>
        {[
          'Post the 4.2h → 9s stat as an image card',
          'Reply to every @mention within 1 hour',
          'Ship a Show HN with your full methodology',
        ].map((tip, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-amber shrink-0 font-mono text-xs">→</span>
            <span className="text-snow/80 leading-snug" style={{ fontSize: '11px' }}>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Demo Day Tab ─────────────────────────────────────────────────────────────

function DemoDayTab() {
  const [stars, setStars] = useState<Star[]>([])
  const params = useParams()
  const sessionId = params?.id as string | undefined
  const [investors, setInvestors] = useState<Investor[]>(DEFAULT_INVESTORS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [stats, setStats] = useState<Record<string, InvestorStats>>(() => initStats(DEFAULT_INVESTORS))
  const [chats, setChats] = useState<Record<string, ChatEntry[]>>({})
  const tickRef = useRef(0)

  useEffect(() => {
    setStars(Array.from({ length: 110 }, () => ({
      x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.4, opacity: Math.random() * 0.3 + 0.05,
      dur: Math.random() * 4 + 2, delay: Math.random() * 6,
    })))
  }, [])

  useEffect(() => {
    fetch(`${API_BASE}/api/agent-personalities`)
      .then(r => r.json())
      .then(data => {
        const loaded = (data.personalities ?? [])
          .filter((p: AgentPersonality) => ['investor', 'media', 'critic', 'judge'].includes(p.category))
          .slice(0, 6)
          .map(personalityToInvestor)

        if (loaded.length > 0) {
          setInvestors(loaded)
          setStats(initStats(loaded))
          setSelectedId(null)
        }
      })
      .catch(() => {})
  }, [])

  // Parallel fast simulation — all investors update simultaneously
  useEffect(() => {
    const interval = setInterval(() => {
      const investor = investors[tickRef.current % investors.length]
      tickRef.current++

      setStats(prev => {
        const c = prev[investor.id]
        if (!c) return prev
        const speed = { hostile: 1.8, analytical: 3.5, thoughtful: 3, chaotic: 5, probing: 2.8, friendly: 4.5 }[investor.trait]
        const jitter = (Math.random() - 0.3) * speed
        return {
          ...prev,
          [investor.id]: {
            ...c,
            interest: Math.max(investor.baseInterest, Math.min(investor.targetInterest, c.interest + speed + jitter)),
            conviction: Math.min(investor.targetConviction, c.conviction + speed * 0.65 + jitter * 0.5),
            feasibility: Math.min(95, c.feasibility + (Math.random() > 0.7 ? 1 : 0)),
            viability: Math.min(90, c.viability + (Math.random() > 0.6 ? 1 : 0)),
            mood: c.interest > investor.targetInterest * 0.7
              ? (investor.trait === 'hostile' ? 'neutral' : 'curious')
              : c.mood,
            thought: investor.thoughts[Math.min(
              Math.floor((c.interest - investor.baseInterest) / ((investor.targetInterest - investor.baseInterest) / investor.thoughts.length)),
              investor.thoughts.length - 1
            )],
          }
        }
      })

      setSpeakingId(investor.id)
      setTimeout(() => setSpeakingId(null), 2200)
    }, 2800)

    return () => clearInterval(interval)
  }, [investors])

  function handleChat(investorId: string, message: string) {
    const investor = investors.find(i => i.id === investorId)!
    const userEntry: ChatEntry = { id: `u-${Date.now()}`, type: 'user', text: message }
    setChats(prev => ({ ...prev, [investorId]: [...(prev[investorId] ?? []), userEntry] }))

    const fallbackText = getResponse(investor, stats[investorId], message)

    fetch(`${API_BASE}/api/investor-response`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        investor,
        message,
        fallbackText,
      }),
    })
      .then(r => r.json())
      .then(data => {
        const reply = data.text || fallbackText
        const botEntry: ChatEntry = { id: `b-${Date.now()}`, type: 'investor', text: reply }
        setChats(prev => ({ ...prev, [investorId]: [...(prev[investorId] ?? []), botEntry] }))
      })
      .catch(() => {
        const reply = fallbackText
        const botEntry: ChatEntry = { id: `b-${Date.now()}`, type: 'investor', text: reply }
        setChats(prev => ({ ...prev, [investorId]: [...(prev[investorId] ?? []), botEntry] }))
      })
  }

  const selectedInvestor = investors.find(i => i.id === selectedId) ?? null

  return (
    <div className="h-full flex overflow-hidden">
      {/* Space scene */}
      <div className="flex-1 relative overflow-hidden" style={{ background: '#060608' }}>
        <div className="absolute inset-0 pointer-events-none">
          {stars.map((s, i) => (
            <div key={i} className="absolute rounded-full bg-snow"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}px`, height: `${s.size}px`, opacity: s.opacity, animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite` }} />
          ))}
        </div>

        {/* Center founder bubble */}
        <div className="absolute z-10" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <FounderBubble />
        </div>

        {/* Investor bobbleheads */}
        {investors.map(inv => (
          <InvestorBubble
            key={inv.id}
            investor={inv}
            stats={stats[inv.id] ?? initStats([inv])[inv.id]}
            isSpeaking={speakingId === inv.id}
            isSelected={selectedId === inv.id}
            onClick={() => setSelectedId(prev => prev === inv.id ? null : inv.id)}
          />
        ))}

        <div className="absolute bottom-4 left-4 space-y-1">
          <div className="font-mono text-xs text-dim flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber inline-block" /><span>FlowDesk (you)</span></div>
          <div className="font-mono text-xs text-dim flex items-center gap-2"><span className="w-2 h-2 rounded-full border border-dim inline-block" /><span>Click to open analysis</span></div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-96 flex flex-col border-l border-border shrink-0 bg-stage">
        {selectedInvestor ? (
          <InvestorPanel
            investor={selectedInvestor}
            stats={stats[selectedInvestor.id]}
            chatHistory={chats[selectedInvestor.id] ?? []}
            onChat={(msg) => handleChat(selectedInvestor.id, msg)}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <IdlePanel />
        )}
      </div>
    </div>
  )
}

// ─── Investor Bobblehead ──────────────────────────────────────────────────────

function InvestorBubble({ investor, stats, isSpeaking, isSelected, onClick }: {
  investor: Investor; stats: InvestorStats; isSpeaking: boolean; isSelected: boolean; onClick: () => void
}) {
  const headSize = Math.round(investor.size * 0.46)
  const bodyW    = Math.round(investor.size * 0.48)
  const bodyH    = Math.round(investor.size * 0.68)
  const handSize = Math.round(investor.size * 0.17)
  const totalH   = headSize + bodyH

  return (
    <div
      className="absolute z-20 cursor-pointer select-none flex flex-col items-center"
      style={{
        left: investor.pos.left, top: investor.pos.top,
        animation: `${investor.floatAnim} ${investor.floatDur} ease-in-out ${investor.floatDelay} infinite`,
      }}
      onClick={onClick}
    >
      {/* Speech bubble */}
      {isSpeaking && (
        <div
          className="absolute font-mono leading-snug rounded-xl px-2.5 py-1.5 max-w-[140px] whitespace-normal"
          style={{
            bottom: totalH + 12, left: '50%', transform: 'translateX(-50%)',
            background: `${investor.color}18`, border: `1px solid ${investor.color}40`,
            color: investor.color, animation: 'slide-up 0.3s ease-out',
            fontSize: '9px',
          }}
        >
          "{stats.thought.slice(0, 55)}{stats.thought.length > 55 ? '...' : ''}"
          <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `5px solid ${investor.color}40` }} />
        </div>
      )}

      {/* Head + fire together — everything inside bobbles as one unit */}
      <div
        style={{ animation: `bobble ${investor.bobbleDur} ease-in-out ${investor.bobbleDelay} infinite`, zIndex: 2, marginBottom: -5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {stats.mood === 'skeptical' && (
          <div style={{ marginBottom: -Math.round(headSize * 0.12), zIndex: 3 }}>
            <FireSVG size={headSize} investorId={investor.id} />
          </div>
        )}
        <div
          className="relative rounded-full flex items-center justify-center"
          style={{
            width: headSize, height: headSize,
            background: `radial-gradient(circle at 32% 28%, ${investor.color}50, ${investor.color}15)`,
            border: `2px solid ${investor.color}${isSelected ? 'DD' : isSpeaking ? 'BB' : '80'}`,
            backdropFilter: 'blur(8px)',
            boxShadow: isSelected ? `0 0 18px ${investor.color}70` : isSpeaking ? `0 0 12px ${investor.color}50` : `0 0 6px ${investor.color}25`,
          }}
        >
          <BobbleFace mood={stats.mood} color={investor.color} size={headSize - 4} />
          {isSpeaking && (
            <div className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: `2px solid ${investor.color}`, animation: 'speaking-ring 1.2s ease-in-out infinite', color: investor.color }} />
          )}
        </div>
      </div>

      {/* Body row: left hand + slim oval body + right hand */}
      <div className="relative flex items-center justify-center" style={{ width: bodyW + (handSize + 5) * 2, height: bodyH }}>
        {/* Left hand */}
        <div className="absolute rounded-full" style={{
          width: handSize, height: handSize,
          left: 0, top: '36%',
          background: `radial-gradient(circle at 30% 30%, ${investor.color}45, ${investor.color}12)`,
          border: `1.5px solid ${investor.color}65`,
        }} />

        {/* Slim oval body */}
        <div
          className="rounded-full transition-all duration-400"
          style={{
            width: bodyW, height: bodyH,
            background: `radial-gradient(circle at 35% 25%, ${investor.color}28, ${investor.color}07)`,
            border: `2px solid ${investor.color}${isSelected ? 'BB' : isSpeaking ? '88' : '45'}`,
            backdropFilter: 'blur(10px)',
            transform: isSelected ? 'scale(1.08)' : 'scale(1)',
            boxShadow: isSelected ? `0 0 28px ${investor.color}45` : isSpeaking ? `0 0 18px ${investor.color}28` : `0 0 8px ${investor.color}12`,
          }}
        />

        {/* Right hand */}
        <div className="absolute rounded-full" style={{
          width: handSize, height: handSize,
          right: 0, top: '36%',
          background: `radial-gradient(circle at 30% 30%, ${investor.color}45, ${investor.color}12)`,
          border: `1.5px solid ${investor.color}65`,
        }} />
      </div>

      {/* Name tag */}
      <div className="text-center mt-1.5">
        <div className="font-mono font-bold" style={{ color: investor.color, fontSize: '9px', lineHeight: 1 }}>{investor.name}</div>
        <div className="font-mono mt-0.5" style={{ color: `${investor.color}65`, fontSize: '7px', lineHeight: 1 }}>{investor.role}</div>
      </div>
    </div>
  )
}

// ─── SVG Fire ─────────────────────────────────────────────────────────────────

function FireSVG({ size, investorId }: { size: number; investorId: string }) {
  const o = `fire-${investorId}`
  const w = Math.round(size * 0.58)
  const h = Math.round(size * 0.82)
  return (
    <svg viewBox="0 0 36 50" width={w} height={h} style={{ display: 'block', animation: 'fire-flicker 0.52s ease-in-out infinite' }}>
      <defs>
        <radialGradient id={`${o}-a`} cx="50%" cy="78%" r="62%" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="50">
          <stop offset="0%" stopColor="#FF4400" />
          <stop offset="100%" stopColor="#AA1100" stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id={`${o}-b`} cx="50%" cy="82%" r="58%" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF7A00" />
          <stop offset="100%" stopColor="#FF2200" stopOpacity="0.8" />
        </radialGradient>
        <radialGradient id={`${o}-c`} cx="50%" cy="88%" r="52%" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD000" />
          <stop offset="100%" stopColor="#FF8800" />
        </radialGradient>
      </defs>

      {/* Outer flame — wide, deep red-orange */}
      <path
        d="M18,48 C6,45 0,30 2,17 C4,8 8,2 12,4 C11,1 15,0 18,1 C21,0 25,1 24,4 C28,2 32,8 34,17 C36,30 30,45 18,48 Z"
        fill={`url(#${o}-a)`}
        opacity="0.92"
      />
      {/* Left side tongue */}
      <path
        d="M10,42 C4,36 3,24 6,14 C7,9 10,5 12,7 C10,4 12,1 14,4 C12,10 11,20 14,30 C15,36 14,42 10,42 Z"
        fill="#FF3300"
        opacity="0.6"
      />
      {/* Right side tongue */}
      <path
        d="M26,42 C32,36 33,24 30,14 C29,9 26,5 24,7 C26,4 24,1 22,4 C24,10 25,20 22,30 C21,36 22,42 26,42 Z"
        fill="#FF3300"
        opacity="0.6"
      />
      {/* Middle flame — orange */}
      <path
        d="M18,44 C10,40 7,27 9,16 C11,7 14,3 18,5 C22,3 25,7 27,16 C29,27 26,40 18,44 Z"
        fill={`url(#${o}-b)`}
      />
      {/* Inner flame — yellow-orange */}
      <path
        d="M18,38 C13,34 11,23 13,14 C14,8 16,5 18,7 C20,5 22,8 23,14 C25,23 23,34 18,38 Z"
        fill={`url(#${o}-c)`}
      />
      {/* Hot core */}
      <ellipse cx="18" cy="30" rx="3.5" ry="6" fill="#FFEE66" opacity="0.85" />
      <ellipse cx="18" cy="33" rx="1.8" ry="3" fill="#FFFFFF" opacity="0.45" />
    </svg>
  )
}

// ─── SVG Face ─────────────────────────────────────────────────────────────────

function BobbleFace({ mood, color, size }: { mood: Mood; color: string; size: number }) {
  const mouths: Record<Mood, string> = { neutral: 'M 18 37 Q 30 41 42 37', curious: 'M 17 36 Q 30 43 43 36', excited: 'M 14 33 Q 30 48 46 33', skeptical: 'M 18 42 Q 30 36 42 42', bored: 'M 20 40 L 40 40' }
  const eyeRY: Record<Mood, number> = { neutral: 6.5, curious: 7, excited: 7.5, skeptical: 5, bored: 3 }
  const eyeY = 21
  return (
    <svg viewBox="0 0 60 60" width={size} height={size}>
      <circle cx="30" cy="30" r="27" fill={`${color}08`} />
      <ellipse cx="22" cy="17" rx="10" ry="7" fill="rgba(255,255,255,0.07)" />
      {[19, 41].map((cx, i) => (
        <g key={i}>
          <ellipse cx={cx} cy={eyeY} rx="5.5" ry={eyeRY[mood]} fill="rgba(255,255,255,0.9)" />
          <ellipse cx={cx} cy={eyeY} rx="4" ry={Math.max(eyeRY[mood] - 1, 2)} fill={color} opacity="0.85" />
          <circle cx={cx + 1} cy={eyeY + 1} r="2.2" fill="rgba(0,0,0,0.6)" />
          <circle cx={cx + 2} cy={eyeY - 1} r="1.1" fill="rgba(255,255,255,0.9)" />
        </g>
      ))}
      {mood === 'skeptical' && <><path d="M 12 12 Q 18 8 26 12" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" /><path d="M 34 12 Q 42 8 48 12" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" /></>}
      {(mood === 'excited' || mood === 'curious') && <><path d="M 12 13 Q 18 10 26 13" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" /><path d="M 34 13 Q 42 10 48 13" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" /></>}
      <circle cx="30" cy="31" r="1.2" fill={`${color}50`} />
      <path d={mouths[mood]} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

// ─── Founder Center Bubble ────────────────────────────────────────────────────

function FounderBubble() {
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-full flex flex-col items-center justify-center"
        style={{ width: 118, height: 118, background: 'radial-gradient(circle at 32% 32%, rgba(255,97,0,0.28), rgba(255,97,0,0.06))', border: '2px solid rgba(255,97,0,0.65)', backdropFilter: 'blur(14px)', animation: 'center-pulse 3s ease-in-out infinite' }}>
        <span className="font-display text-amber text-lg leading-none">Flow</span>
        <span className="font-display text-amber text-lg leading-none">Desk</span>
        <span className="font-mono text-amber/40 mt-1" style={{ fontSize: '8px' }}>{COMPANY.mrr}</span>
      </div>
      <div className="mt-2 font-mono text-xs text-amber/50">you</div>
    </div>
  )
}

// ─── Investor Analysis Panel ──────────────────────────────────────────────────

function InvestorPanel({ investor, stats, chatHistory, onChat, onClose }: {
  investor: Investor; stats: InvestorStats; chatHistory: ChatEntry[]
  onChat: (msg: string) => void; onClose: () => void
}) {
  const [activeSection, setActiveSection] = useState<'analysis' | 'chat'>('analysis')
  const moodEmoji: Record<Mood, string> = { neutral: '😐', curious: '🤔', excited: '😄', skeptical: '😒', bored: '😑' }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ animation: 'slide-up 0.3s ease-out' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-snow text-sm">{investor.name}</span>
              <span className="font-mono text-xs" style={{ color: investor.color }}>· {investor.role}</span>
              <span className="text-sm">{moodEmoji[stats.mood]}</span>
            </div>
            <div className="font-mono text-xs capitalize mt-0.5" style={{ color: `${investor.color}80` }}>{investor.trait} personality</div>
          </div>
          <button onClick={onClose} className="text-dim hover:text-muted transition-colors text-lg">×</button>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 mt-3">
          {(['analysis', 'chat'] as const).map(s => (
            <button key={s} onClick={() => setActiveSection(s)}
              className="font-mono text-xs px-3 py-1 rounded border transition-all capitalize"
              style={{ borderColor: activeSection === s ? investor.color : '#1E1E2E', color: activeSection === s ? investor.color : '#6E6E84', background: activeSection === s ? `${investor.color}10` : 'transparent' }}>
              {s === 'chat' ? `Chat with ${investor.name.split(' ')[0]}` : 'Analysis'}
            </button>
          ))}
        </div>
      </div>

      {activeSection === 'analysis' ? (
        <AnalysisSection investor={investor} stats={stats} />
      ) : (
        <ChatSection investor={investor} stats={stats} chatHistory={chatHistory} onChat={onChat} />
      )}
    </div>
  )
}

function AnalysisSection({ investor, stats }: { investor: Investor; stats: InvestorStats }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
      {/* Thought */}
      <div>
        <div className="font-mono text-xs text-muted uppercase tracking-widest mb-2">Right now they're thinking</div>
        <div className="rounded-xl p-3 text-sm leading-relaxed italic"
          style={{ background: `${investor.color}08`, border: `1px solid ${investor.color}20`, color: 'rgba(232,232,240,0.85)' }}>
          💭 "{stats.thought}"
        </div>
      </div>

      {/* Sentiment meters */}
      <div className="space-y-3">
        <div className="font-mono text-xs text-muted uppercase tracking-widest">Sentiment</div>
        <Meter label="Interest in idea" value={stats.interest} color={investor.color} />
        <Meter label="Conviction it works" value={stats.conviction} color={investor.color} />
        <Meter label="Technical feasibility" value={stats.feasibility} color={investor.color} />
        <Meter label="Business viability" value={stats.viability} color={investor.color} />
      </div>

      {/* Pros */}
      <div>
        <div className="font-mono text-xs text-muted uppercase tracking-widest mb-2">What they like</div>
        <ul className="space-y-2">
          {investor.pros.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-xs leading-snug">
              <span className="text-emerald mt-0.5 shrink-0">✓</span>
              <span className="text-snow/80">{p}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cons */}
      <div>
        <div className="font-mono text-xs text-muted uppercase tracking-widest mb-2">Their concerns</div>
        <ul className="space-y-2">
          {investor.cons.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-xs leading-snug">
              <span className="text-live mt-0.5 shrink-0">✗</span>
              <span className="text-snow/80">{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Notes */}
      <div className="space-y-3">
        {[
          { label: 'On feasibility', note: investor.feasibilityNote },
          { label: 'On viability', note: investor.viabilityNote },
          { label: 'Overall take', note: investor.overallNote },
        ].map(({ label, note }) => (
          <div key={label}>
            <div className="font-mono text-xs mb-1" style={{ color: `${investor.color}90` }}>{label}</div>
            <div className="text-snow/70 text-xs leading-relaxed">{note}</div>
          </div>
        ))}
      </div>

      {/* Hypothetical check size */}
      <div className="rounded-xl p-3 flex items-center justify-between"
        style={{ background: `${investor.color}08`, border: `1px solid ${investor.color}20` }}>
        <span className="font-mono text-xs text-muted">Hypothetical check size</span>
        <span className="font-mono text-sm font-bold" style={{ color: investor.color }}>
          {stats.conviction < 15 ? '—' : stats.conviction < 35 ? '$10k–$50k' : stats.conviction < 55 ? '$50k–$150k' : stats.conviction < 75 ? '$150k–$500k' : '$500k+'}
        </span>
      </div>
    </div>
  )
}

function ChatSection({ investor, stats, chatHistory, onChat }: {
  investor: Investor; stats: InvestorStats; chatHistory: ChatEntry[]
  onChat: (msg: string) => void
}) {
  const [input, setInput] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [chatHistory])

  function handleSend() {
    if (!input.trim()) return
    onChat(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-4 py-2 border-b border-border shrink-0">
        <div className="font-mono text-xs text-dim">Ask {investor.name} anything about your product — they'll respond as themselves.</div>
      </div>

      {/* Messages */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {chatHistory.length === 0 && (
          <div className="text-center space-y-3 pt-4">
            <div className="font-mono text-xs text-dim">No conversation yet. Try asking:</div>
            {["What's your biggest concern about FlowDesk?", "Would you invest at this stage?", "What would change your mind?"].map(q => (
              <button key={q} onClick={() => onChat(q)}
                className="block w-full text-left font-mono text-xs px-3 py-2 rounded border border-border text-muted hover:border-amber hover:text-snow transition-all">
                "{q}"
              </button>
            ))}
          </div>
        )}
        {chatHistory.map(entry => (
          <div key={entry.id} className={`flex ${entry.type === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{ animation: 'slide-up 0.25s ease-out' }}>
            {entry.type === 'investor' && (
              <div className="flex items-start gap-2 max-w-[90%]">
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-mono text-xs font-bold mt-0.5"
                  style={{ background: `${investor.color}20`, color: investor.color, fontSize: '9px' }}>
                  {investor.name[0]}
                </div>
                <div className="rounded-xl rounded-tl-sm px-3 py-2.5 text-xs leading-relaxed"
                  style={{ background: `${investor.color}12`, border: `1px solid ${investor.color}25`, color: 'rgba(232,232,240,0.88)' }}>
                  {entry.text}
                </div>
              </div>
            )}
            {entry.type === 'user' && (
              <div className="rounded-xl rounded-tr-sm px-3 py-2.5 text-xs leading-relaxed text-void bg-amber max-w-[85%]">
                {entry.text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 shrink-0 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={`Ask ${investor.name.split(' ')[0]} something...`}
          className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-xs text-snow placeholder:text-dim font-mono outline-none focus:border-amber transition-colors"
        />
        <button onClick={handleSend} disabled={!input.trim()}
          className="px-3 py-2 rounded-lg font-mono text-xs transition-all disabled:opacity-30"
          style={{ background: input.trim() ? investor.color : '#111', color: input.trim() ? '#060608' : '#3E3E52' }}>
          Send
        </button>
      </div>
    </div>
  )
}

// ─── Meter ────────────────────────────────────────────────────────────────────

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="font-mono text-xs text-muted">{label}</span>
        <span className="font-mono text-xs text-snow">{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 bg-surface rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color, transition: 'width 1.2s ease-out' }} />
      </div>
    </div>
  )
}

// ─── Idle Panel ───────────────────────────────────────────────────────────────

function IdlePanel() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center space-y-4">
      <div className="text-4xl">🧠</div>
      <div className="font-mono text-xs text-muted uppercase tracking-widest">Investor Minds</div>
      <div className="text-dim text-xs font-mono leading-relaxed max-w-[200px]">
        Investors are already analyzing your product. Click any bubble to read their internal thoughts and chat with them directly.
      </div>
    </div>
  )
}
