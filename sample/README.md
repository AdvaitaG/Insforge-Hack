# FlowDesk

**AI-powered customer support desk that resolves 80% of tickets before a human ever sees them.**

## Company

FlowDesk is a B2B SaaS company building the next generation of customer support infrastructure. We replace slow, expensive human-first support queues with an AI system that understands your product deeply, resolves common issues instantly, and escalates the rest with full context.

## Problem

Customer support is broken for growing SaaS companies. A team of 10 engineers ships a product used by 50,000 users. When something breaks or a user gets confused, they open a ticket. That ticket sits in a queue. A support agent who doesn't know the codebase copy-pastes a docs link. The user churns.

The average SaaS company spends $28 per resolved ticket. At scale, support becomes the largest variable cost in the business — and the biggest driver of churn when it fails.

## Solution

FlowDesk connects to your GitHub, Notion, Stripe, and product database. It reads your docs, your changelogs, your error logs, and your user's account history. When a ticket arrives, it already knows what's wrong.

For 80% of tickets — billing questions, how-to questions, known bugs — FlowDesk resolves automatically with a personalized, accurate response in under 10 seconds. For the other 20%, it hands off to a human agent with a full summary, the likely root cause, and a suggested response.

## Target Customer

B2B SaaS companies with 500 to 10,000 customers, a support team of 2 to 15 agents, and a product that changes frequently. Our ideal customer is a Series A or Series B company where support volume is growing faster than headcount.

## Why Now

Three things became true in 2024:

1. LLMs can now read a codebase and understand error messages well enough to diagnose product bugs.
2. Users expect instant answers — CSAT scores for responses slower than 60 seconds have dropped 40% in two years.
3. Support tooling has not kept up. Zendesk and Intercom are workflow tools, not intelligence layers.

## Traction

- 12 paying customers, $18,000 MRR
- Average ticket resolution time: 8 seconds (vs. 4.2 hours industry average)
- Net Revenue Retention: 118%
- Customers include two YC companies and one publicly traded SaaS

## Business Model

- $299/month: up to 500 tickets/month, 2 integrations
- $899/month: up to 2,500 tickets/month, unlimited integrations
- $2,499/month: unlimited tickets, dedicated model fine-tuned on your product

## Competitors

- **Zendesk AI**: bolted-on AI to a legacy ticketing system. No product context, no codebase awareness.
- **Intercom Fin**: good for FAQ resolution, poor at anything requiring product-specific knowledge.
- **In-house GPT wrappers**: founders build these in a weekend, abandon them in a month.

FlowDesk wins on depth of product context and resolution rate. We integrate at the infrastructure level, not the chat widget level.

## Team

- **Priya Nair** (CEO) — previously led support engineering at Stripe. Saw this problem from the inside.
- **James Okafor** (CTO) — 8 years at Google, built large-scale NLP pipelines. MS in ML from Stanford.
- **Sofia Reyes** (Head of Product) — former PM at Intercom. Knows the competitor's ceiling better than they do.

## Tech Stack

- Backend: Python, FastAPI, PostgreSQL
- AI: Claude API with custom retrieval pipeline over customer codebases
- Integrations: GitHub, Notion, Linear, Stripe, Zendesk, Intercom, Slack
- Infrastructure: AWS, deployed via Terraform

## Links

- Product: https://flowdesk.ai
- Docs: https://docs.flowdesk.ai
- GitHub: https://github.com/flowdesk/flowdesk
