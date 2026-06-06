# FlowDesk

**AI-powered customer support infrastructure that resolves 80% of tickets before a human ever sees them.**

> "We didn't build a chatbot. We built a support engineer that never sleeps, never forgets, and already knows what broke before the customer finishes typing."
> — Priya Nair, CEO

---

## The One-Liner

FlowDesk is the AI support layer for B2B SaaS companies. It connects to your codebase, docs, and product database, understands your product at an engineering level, and resolves 80% of support tickets automatically in under 10 seconds.

---

## The Problem

Customer support is quietly destroying B2B SaaS companies.

A Series A company ships a product used by 10,000 users. When something breaks, a ticket arrives. That ticket sits in a queue. A support agent who has never read the codebase copy-pastes a docs link. The user waits 4.2 hours for a response that doesn't solve their problem. They churn.

The numbers are brutal:
- The average SaaS company spends **$28 per resolved ticket**
- Support headcount grows **3x faster** than engineering headcount between Series A and Series B
- **67% of churned customers** cite poor support experience as a primary reason
- CSAT scores for responses slower than 60 seconds have dropped **40% in two years**
- Support agents correctly resolve tickets on the first attempt only **34% of the time**

The root cause is not that support is slow. It's that support agents don't understand the product deeply enough to resolve issues quickly. They're generalists answering questions about specialized software they didn't build and don't fully understand.

Zendesk and Intercom have tried to bolt AI onto this problem. It hasn't worked. Their AI tools are trained on generic customer service language, not your codebase, not your error logs, not your changelog. They give users the same docs link a human would, just faster.

---

## The Solution

FlowDesk integrates at the infrastructure level, not the chat widget level.

When you connect FlowDesk, it reads:
- Your **GitHub repository** — every file, every recent commit, every open issue
- Your **Notion workspace** — all docs, runbooks, and internal knowledge base pages
- Your **Stripe account** — customer billing history, subscription status, payment failures
- Your **product database** — user account state, feature flags, recent activity logs
- Your **error tracking** — Sentry, Datadog, or Honeybadger incident history
- Your **Linear or Jira board** — known bugs, upcoming fixes, shipped features

FlowDesk builds a **live knowledge graph** over all of this. When a ticket arrives, it doesn't search docs. It reasons across your entire product context to understand exactly what broke, why it broke, and whether it has happened before.

For **80% of tickets** — billing questions, how-to questions, known bugs, configuration errors — FlowDesk resolves automatically with a personalized, accurate response in under 10 seconds.

For the other **20%** — edge cases, escalations, relationship-sensitive issues — FlowDesk hands off to a human agent with a full summary, the likely root cause, the customer's relevant history, and a suggested response draft.

The human agent never starts from zero.

---

## How It Works

### Ticket Ingestion
FlowDesk connects to Zendesk, Intercom, Front, or your custom support inbox via API. Every incoming ticket is processed in real time.

### Context Assembly
For each ticket, FlowDesk assembles a context window that includes:
1. The customer's account state (plan, usage, recent activity)
2. Recent error logs for that customer's environment
3. Relevant docs, runbooks, and changelog entries
4. Similar past tickets and how they were resolved
5. Known open bugs that match the reported symptoms

### Resolution Engine
FlowDesk uses a fine-tuned Claude-based model with a custom retrieval pipeline over the customer's product context. It generates a resolution, verifies it against known product behavior, and checks confidence before sending.

If confidence is above the threshold: auto-send.
If below: route to human with full context.

### Continuous Learning
Every resolved ticket — human or AI — feeds back into the knowledge graph. The model gets better with every ticket. NRR improves as resolution rate improves.

---

## Target Customer

**Primary ICP:** Head of Support Engineering or VP of Customer Success at a Series A or Series B B2B SaaS company.

Characteristics:
- 500 to 10,000 customers
- Support team of 2 to 15 agents
- Product changes frequently (weekly or biweekly deploys)
- Support volume is growing faster than headcount
- Engineering team is tired of being pinged on Slack to answer tickets
- CSAT is declining despite adding headcount

**Secondary ICP:** Engineering-led companies where the CTO owns support quality and is embarrassed by the ticket queue.

**Not a fit:** Consumer apps, companies with fewer than 200 customers, companies where support is purely relationship-based with no technical component.

---

## Why Now

Three things became true in 2024 that make FlowDesk possible:

**1. LLMs can now read a codebase.**
Claude Sonnet can ingest 200k tokens of context. For the first time, an AI can hold an entire product's codebase, docs, and error history in a single context window and reason across all of it to diagnose a bug.

**2. Users expect instant answers.**
CSAT scores for responses slower than 60 seconds have dropped 40% in two years. The benchmark has shifted from "same day" to "under a minute." Human-first support can't meet this bar at scale.

**3. The incumbent tools haven't kept up.**
Zendesk launched "Zendesk AI" in 2023. It answers 22% of tickets automatically, mostly FAQ-style questions. Intercom Fin resolves 35%. FlowDesk resolves 80% because it understands the product, not just the language of customer service.

The window is 18 to 24 months before Zendesk hires the right team or acquires a competitor. We're moving now.

---

## Traction

- **12 paying customers**, $18,000 MRR
- Average ticket resolution time: **8 seconds** (industry average: 4.2 hours)
- Automated resolution rate: **80%** (industry average: 22–35%)
- **Net Revenue Retention: 118%** — customers expand as ticket volume grows
- **83% 90-day retention** across all customers
- Customer CSAT average: **4.7 / 5.0**
- Two YC-backed companies and one publicly traded SaaS in the customer base
- Zero churn in the first 8 months of operation
- Pipeline: 34 qualified leads, 8 in active trials

### Case Study: Meridian Analytics (YC W22)

Before FlowDesk: 3 support agents, 4.5 hours average response time, 61% CSAT, $34,000/month in support labor.

After FlowDesk (3 months): 1 support agent, 11 seconds average response time, 4.8 CSAT, $11,000/month in support labor (including FlowDesk subscription).

Meridian reduced support costs by 68% and improved CSAT by 28 points in one quarter.

---

## Business Model

**Pricing is per ticket volume, billed monthly.**

| Plan | Price | Tickets/Month | Integrations | Model |
|------|-------|---------------|--------------|-------|
| Starter | $299/mo | 500 | 2 (GitHub + one other) | Shared model |
| Growth | $899/mo | 2,500 | Unlimited | Shared model |
| Scale | $2,499/mo | Unlimited | Unlimited | Fine-tuned on your product |
| Enterprise | Custom | Unlimited | Unlimited | Dedicated fine-tuned model + SLA |

**Economics:**
- Gross margin: 72% at current scale
- Blended CAC: $1,200 (primarily founder-led sales)
- Average ACV: $8,400 (mix of Starter and Growth)
- Payback period: ~2 months
- Average contract length: month-to-month, but 90% auto-renew

**Expansion revenue:** Customers naturally expand as their product and ticket volume grows. Meridian started on Starter, moved to Growth in month 2, is now piloting Scale.

---

## Competitive Landscape

| | FlowDesk | Zendesk AI | Intercom Fin | In-house GPT |
|---|---|---|---|---|
| Auto-resolution rate | **80%** | 22% | 35% | 15–40% |
| Product context depth | **Deep** (codebase) | None | Docs only | Variable |
| Setup time | **15 min** | Weeks | Days | Months |
| Improves over time | **Yes** (flywheel) | Limited | Limited | Requires eng |
| Codebase integration | **Yes** | No | No | Sometimes |
| Changelog awareness | **Yes** | No | No | Rarely |

**Why we win:**
- Zendesk and Intercom are workflow tools that added AI. We are an AI system that has workflow as a side effect.
- Our integration depth (codebase + Stripe + error logs) is a genuine moat. It takes 15 minutes to set up and 6 months to replicate.
- The knowledge graph gets better with every ticket. Incumbents don't have this flywheel.

---

## Tech Stack

**Backend:** Python 3.12, FastAPI, PostgreSQL 16, Redis (queue + cache)

**AI/ML:**
- Primary model: Claude claude-sonnet-4-6 with 200k context window
- Retrieval: Custom vector search over product knowledge graph (pgvector)
- Fine-tuning: Scale AI data pipeline for Scale/Enterprise tier customers
- Confidence scoring: Internal classifier trained on 18 months of human-resolved tickets

**Integrations:**
- Source control: GitHub, GitLab (beta)
- Docs: Notion, Confluence, GitBook
- Support inbox: Zendesk, Intercom, Front, email (IMAP)
- Billing: Stripe
- Error tracking: Sentry, Datadog
- Project management: Linear, Jira
- Communication: Slack (notifications + escalation)

**Infrastructure:**
- Hosted on AWS (us-east-1, eu-west-1)
- Deployed via Terraform + GitHub Actions
- SOC 2 Type II in progress (expected Q2 2025)
- GDPR compliant, data processing agreements available

---

## Team

**Priya Nair — CEO**
Previously: 6 years at Stripe, last role as Lead Support Engineering Manager. Managed the team that handled 40,000 support tickets per month. Has a first-hand understanding of every failure mode in enterprise support at scale. Stanford CS, class of 2017.

**James Okafor — CTO**
Previously: 8 years at Google, built large-scale NLP pipelines for Google Translate and Google Assistant. Led a team of 12 engineers on semantic understanding. Published 4 ML papers. MS in Machine Learning from Stanford, BS from MIT.

**Sofia Reyes — Head of Product**
Previously: 4 years as Senior PM at Intercom, owned the AI features roadmap from 2021 to 2023. Knows the competitor's product ceiling better than most people who work there. Left to build something that actually solves the problem. MBA from Wharton.

**Hiring:** Senior ML Engineer, Enterprise Account Executive, Head of Customer Success.

---

## Roadmap

**Q1 2025 (Now)**
- GitLab integration
- Confluence integration
- SOC 2 Type II audit begins
- First enterprise pilot ($24k ACV)

**Q2 2025**
- Dedicated fine-tuned models for all Scale customers
- Proactive support (flag issues before users report them)
- Slack-native resolution (answer in Slack threads, not just tickets)
- Series A fundraise ($4–6M target)

**Q3 2025**
- International expansion (EU data residency)
- Voice support (resolve tickets via phone AI)
- Multi-product support (one FlowDesk instance across multiple products)

**Q4 2025**
- API for embedding FlowDesk resolution in-product
- Competitive displacement playbook targeting Zendesk mid-market accounts

---

## Fundraising

**Current round:** Seed — $1.2M raised on a $6M post-money SAFE
**Investors:** Two YC partners (personal checks), one Stripe alumni fund, three angels from the support tooling space
**Use of funds:** 60% engineering (ML + infrastructure), 25% go-to-market, 15% operations

**Series A target:** $4–6M at ~$20M valuation, expected Q2 2025
**Series A milestones:** $50k MRR, one enterprise contract, SOC 2 Type II complete, 3 months of consistent 115%+ NRR

---

## Why FlowDesk Wins

The insight that matters: **support is a knowledge problem, not a workflow problem.**

Every tool built in the last 20 years has tried to make the ticket workflow faster. Better routing, better SLAs, better dashboards. None of them made agents smarter.

FlowDesk makes agents — human and AI — smarter by giving them the same understanding of the product that the engineering team has. When you know what you're talking about, resolution is easy. FlowDesk knows what it's talking about.

The 80% resolution rate is not a feature. It's a consequence of actually understanding the product.

---

## Links

- Product: https://flowdesk.ai
- Docs: https://docs.flowdesk.ai
- Status: https://status.flowdesk.ai
- GitHub (public SDK): https://github.com/flowdesk/flowdesk-sdk
- Demo: https://demo.flowdesk.ai
- Pitch deck: Available on request
- Contact: priya@flowdesk.ai
