# PitchMirror — YC Demo Day Simulator

> "Every founder has practiced their pitch in front of a mirror. We built the mirror that talks back like a YC partner."

---

## What It Is

PitchMirror is an AI-powered Demo Day rehearsal room. A founder drops in a GitHub repo URL, and within seconds they have a polished 60-second YC-style pitch, three investor personas grilling them with hard questions, and a final readiness report that rewrites their pitch based on how they answered.

It's not a slide tool. It's not a generic chatbot. It creates a live room.

---

## The Problem

Founders waste real investor meetings because they've never been grilled the right way. Mock pitches with friends are too soft. Pitch coaches are expensive and scarce. Most AI tools generate static text — they don't simulate pressure.

---

## The Product

**One URL → Full rehearsal room in ~10 seconds.**

1. User enters a GitHub repo URL on the home page
2. The app fetches the README and repo metadata from the GitHub API
3. Gemini generates a 60-second YC-style pitch, positioning statement, and investor questions tailored to that specific startup
4. The user enters a live Demo Day room with three investor personas
5. Each investor asks hard, startup-specific questions (not generic ones)
6. The user answers; Gemini scores each answer, gives critique, and suggests a stronger version
7. After all questions, the app generates a final Readiness Report (score 0–100, strengths, weaknesses, rewritten pitch)
8. The report page includes a full launch kit: X posts, LinkedIn, Hacker News, Product Hunt copy

---

## The Three Investors

Each investor pulls their personality from InsForge's `agent_personalities` table (29 real personas), which is passed as the system prompt to Gemini:

| Persona | Focus |
|---|---|
| **Skeptical Partner** | Market size, urgency, "is this a feature or a company?" |
| **Technical Partner** | Product moat, architecture, what's hard about this |
| **Growth Partner** | Distribution, pricing, retention, first customer |

Investors also have a free-form chat panel — founders can ask them follow-up questions mid-session and get in-character Gemini responses.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Backend | Node.js HTTP server (`src/server/index.mjs`) on port 8787 |
| AI | Gemini 2.5 Flash (`@google/generative-ai`) |
| Database / Backend Platform | InsForge SDK (`@insforge/sdk`) — Postgres tables for startups, sessions, questions, assets, personalities |
| Proxy | Next.js rewrites `/backend/*` → `localhost:8787` so one tunnel URL serves everything |
| Dev tunnel | `npx localtunnel --port 3000` |

---

## Pages

| Route | What It Does |
|---|---|
| `/` | Home — enter GitHub repo URL to start |
| `/loading?repo=owner/name` | Animated loading screen — runs the full GitHub → InsForge → Gemini pipeline |
| `/session/[id]` | Generated pitch preview with one-liner, positioning, and investor questions |
| `/session/[id]/room` | Live Demo Day room — investor Q&A, answer input, chat |
| `/session/[id]/report` | Final readiness score, rewritten pitch, launch assets |
| `/dashboard/[id]` | Debug/admin view of a session |

---

## Key Files

```
app/                         Next.js pages
  loading/page.tsx           GitHub fetch + startup/session creation flow
  session/[id]/page.tsx      Pitch preview
  session/[id]/room/page.tsx Live investor room
  session/[id]/report/       Final report + launch kit

src/server/
  index.mjs                  Node.js backend — all API routes
  services/
    memoirAdapter.mjs        All Gemini calls (pitch, answer eval, investor chat, report)
    mockMemoir.mjs           Fallback mock data when no API key
  store/
    insforgeStore.mjs        InsForge DB reads/writes
    jsonStore.mjs            Local JSON fallback store
    index.mjs                Routes to InsForge or JSON depending on env

app/api/                     Next.js API routes (thin proxies to backend)
```

---

## Running Locally

```bash
# Install dependencies
npm install

# Start the backend (port 8787)
npm run dev:api

# Start the frontend (port 3000)
npm run dev

# Optional: expose a public URL
npx localtunnel --port 3000
```

Requires a `.env` file:
```
GEMINI_API_KEY=your_key_here
INSFORGE_API_KEY=your_key_here   # optional — falls back to local JSON store
```

---

## How InsForge Is Used

InsForge is the backbone of the product, not a decorator:

- **`startups` table** — stores every startup profile created from a repo URL
- **`pitch_sessions` table** — tracks session state (generating → ready → complete)
- **`investor_questions` table** — stores generated questions, founder answers, scores, and stronger rewrites
- **`launch_assets` table** — stores all generated content (X posts, LinkedIn, etc.)
- **`agent_personalities` table** — 29 rich investor/coach personas with `systemPrompt`, `persona`, and `questionStyle` fields injected into every Gemini call

---

## Demo Script (for judges)

1. Go to the home page and paste a GitHub repo URL
2. Watch the loading screen — it's doing real work (GitHub API, InsForge, Gemini)
3. Enter the pitch room — read the generated 60-second pitch
4. Hit "Start Simulation" — answer the investor questions
5. Give a weak answer to one question — watch the AI critique it
6. Finalize — see the readiness score and rewritten pitch
7. Check the launch kit — real social posts generated from the startup context

Close: *"Gemini generates the pitch and evaluates the answers. InsForge runs the data layer and provides the investor personalities. The whole thing works from a single GitHub URL."*
