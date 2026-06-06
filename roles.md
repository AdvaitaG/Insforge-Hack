# YC Demo Day Simulator: 4-Hour Team Roles

## Goal

Build a working YC Demo Day Simulator in 4 hours.

The final demo should show a founder entering startup context, generating a pitch, entering a live investor simulation, answering investor questions, and receiving a polished promotion package.

We are splitting by sponsor/tool so each person owns one clean vertical slice:

- Advaita: InsForge backend, database, storage, and app wiring.
- doniv: Replicas simulation, agentic investor roles, and live room experience.
- eshwar: trymemoir.ai promotion engine, pitch generation, launch content, and rewritten pitch.

Frontend can be vibecoded at the end, but each person should expose simple data/functions that make frontend assembly easy.

## Current Backend Status

Advaita's InsForge slice is now live enough for the team to build against.

Working:

- InsForge project is linked: `YC Sim`.
- API base for local server: `http://127.0.0.1:8787`.
- InsForge database tables exist:
  - `startups`
  - `pitch_sessions`
  - `investor_questions`
  - `launch_assets`
  - `avatars`
- Backend API server exists in `src/server`.
- Backend uses InsForge automatically when `.insforge/project.json` exists.
- Backend falls back to local JSON if `USE_LOCAL_STORE=true`.
- Mock trymemoir.ai output already works.
- Mock avatar metadata already works.

Run backend:

```bash
npm run dev:api
```

Expected server log:

```text
[store] Using InsForge database
YC Demo Day API running at http://127.0.0.1:8787
```

## Immediate Handoff

### doniv Needs To Build

Use the existing session response instead of inventing a new data shape.

Call:

```text
GET /api/sessions/:id
```

Use:

- `pitch`: founder avatar script.
- `questions`: investor question scripts.
- `avatars`: role names, display names, and personas.
- `startup.companyName`: room/company label.

doniv should add a Replicas integration that can consume these fields and drive the live room.

Minimum shippable version:

- Founder avatar speaks `session.pitch`.
- Investor cards show the three `session.questions`.
- Active speaker state advances through founder, skeptical partner, technical partner, growth partner.
- If Replicas API fails, keep static avatar cards and transcript mode.

### eshwar Needs To Build

Wire trymemoir.ai into:

```text
src/server/services/memoirAdapter.mjs
```

Replace the mock functions with real trymemoir.ai calls while preserving the exact returned JSON shape.

Functions to implement:

- `generatePitchPackage(context)`
- `evaluateAnswer(input)`
- `generateFinalReport(input)`

Do not change route contracts unless everyone agrees.

Minimum shippable version:

- Generate a real 60-second pitch.
- Generate exactly three investor questions.
- Generate launch assets.
- Score one founder answer.
- Rewrite the pitch during finalization.

### Frontend Needs To Build

Use the existing backend routes.

Routes:

```text
POST /api/startups
POST /api/sessions
GET /api/sessions/:id
POST /api/sessions/:id/answer
POST /api/sessions/:id/finalize
```

Minimum pages:

- Intake form.
- Pitch preview.
- Demo room.
- Final report.

## Final Demo Flow

1. User fills startup intake form.
2. InsForge stores the startup profile.
3. trymemoir.ai generates:
   - 60-second Demo Day pitch.
   - Product positioning.
   - Investor questions.
   - Launch/promotional assets.
4. Replicas creates the live simulation:
   - Founder role presents pitch.
   - Investor roles ask questions.
   - User answers by text.
5. App scores the pitch session.
6. trymemoir.ai rewrites the pitch and generates a final promotion package.
7. User sees the Demo Day Readiness Report.

## Hard Scope For 4 Hours

### Must Ship

- One intake form.
- One generated pitch.
- Three investor personas.
- Three investor questions.
- Text answers from user.
- Final readiness report.
- Launch content output.
- Working fallback data if any API fails.

### Do Not Build

- Full auth.
- Full slide editor.
- Complex dashboards.
- Multi-user collaboration.
- Full video export.
- Deep repo analysis.
- Perfect UI polish before integrations work.

## Owner 1: Advaita

### Sponsor Focus

InsForge: database, storage, API routes, session state, deployment.

### Core Responsibility

Make the app actually run end to end. Advaita owns the spine of the product.

### Build Tasks

Done:

- App project is set up.
- InsForge CLI is linked.
- InsForge schema migration is applied.
- API routes exist.
- Generated pitch packages and answers persist to InsForge.
- Mock fallback exists.
- Local demo API runs.

Remaining:

1. Keep backend running during frontend work.
2. Help doniv and eshwar debug API shape issues.
3. Commit and push backend files.
4. Avoid changing route contracts unless the whole team agrees.
5. Optional: help deploy if time allows.

### Tables

Create these tables first. Keep fields simple.

#### `startups`

- `id`
- `company_name`
- `description`
- `target_customer`
- `problem`
- `solution`
- `why_now`
- `traction`
- `business_model`
- `competitors`
- `product_url`
- `repo_url`
- `founder_voice_sample`
- `created_at`

#### `pitch_sessions`

- `id`
- `startup_id`
- `status`
- `generated_pitch`
- `positioning`
- `readiness_score`
- `score_breakdown`
- `rewritten_pitch`
- `created_at`
- `completed_at`

#### `investor_questions`

- `id`
- `session_id`
- `investor_type`
- `question`
- `answer`
- `feedback`
- `score`
- `created_at`

#### `launch_assets`

- `id`
- `session_id`
- `asset_type`
- `content`
- `created_at`

### API Routes To Expose

#### `POST /api/startups`

Creates startup profile.

#### `POST /api/sessions`

Creates pitch session and calls eshwar's trymemoir.ai generation function.

#### `GET /api/sessions/:id`

Returns session, pitch, questions, answers, and assets.

#### `POST /api/sessions/:id/answer`

Stores user answer and calls scoring logic.

#### `POST /api/sessions/:id/finalize`

Calls eshwar's rewrite function and returns final report.

### Fallback Responsibility

Already implemented. If APIs fail, the app still works with mock data.

Mock session behavior includes:

- A sample startup.
- A sample generated pitch.
- Three investor questions.
- A sample score report.
- A sample launch package.

### Advaita Done Criteria

- App can create a startup.
- App can create a pitch session.
- App can save answers.
- App can show final report.
- Data survives refresh.
- Demo works even if external APIs fail.

## Owner 2: doniv

### Sponsor Focus

Replicas: live simulation, avatars, agentic roles, investor panel.

### Core Responsibility

Make the demo feel mind-blowing. doniv owns the simulation layer and the "live room" experience.

### Build Tasks

1. Create Replicas adapter.
2. Use existing `session.avatars` from `GET /api/sessions/:id`.
3. Use existing `session.pitch` as the founder script.
4. Use existing `session.questions` as investor scripts.
5. Create or configure avatar sessions.
6. Make founder avatar present the generated pitch.
7. Make investor roles ask questions.
8. Connect simulation state to frontend.
9. Add fallback static avatars if Replicas is slow or unavailable.

### Backend Data Available To doniv

Call:

```text
GET /api/sessions/:id
```

Use this shape:

```json
{
  "pitch": "60-second founder pitch",
  "questions": [
    {
      "id": "question_123",
      "investorType": "skeptical_partner",
      "question": "Why is this venture scale?"
    }
  ],
  "avatars": [
    {
      "role": "founder",
      "displayName": "Founder",
      "persona": "Confident technical founder presenting a crisp 60-second Demo Day pitch."
    }
  ]
}
```

Recommended implementation:

- Add `src/server/services/replicasAdapter.mjs` if server-side calls are needed.
- Or keep Replicas client logic in the frontend if their SDK requires browser runtime.
- Do not create a separate backend session model; use `pitch_sessions`, `investor_questions`, and `avatars`.

### Agentic Roles

#### Founder

Purpose:

- Presents generated pitch.
- Sounds confident, concise, and founder-like.

Input:

- `generated_pitch`
- `company_name`
- `founder_voice_sample`

#### Skeptical Partner

Purpose:

- Challenges market size, competition, and urgency.

Question style:

- "Why is this a venture-scale company?"
- "Why will users need this now?"
- "What prevents incumbents from copying this?"

#### Technical Partner

Purpose:

- Challenges technical depth, product quality, and defensibility.

Question style:

- "What is technically hard here?"
- "What gets better as more people use it?"
- "Is this more than a wrapper?"

#### Growth Partner

Purpose:

- Challenges distribution, pricing, retention, and customer acquisition.

Question style:

- "Who is your first paying customer?"
- "How do you get your first 100 users?"
- "Why does this become a weekly workflow?"

### Replicas Adapter Interface

Build the rest of the app around this interface:

```ts
type AvatarRole =
  | "founder"
  | "skeptical_partner"
  | "technical_partner"
  | "growth_partner";

type AvatarConfig = {
  role: AvatarRole;
  displayName: string;
  persona: string;
  script?: string;
};

type AvatarSession = {
  providerAvatarId?: string;
  embedUrl?: string;
  streamUrl?: string;
  status: "mock" | "created" | "ready" | "speaking" | "complete";
};

async function createAvatar(config: AvatarConfig): Promise<AvatarSession>;

async function speak(
  avatarId: string,
  text: string
): Promise<AvatarSession>;
```

### Live Room UI Requirements

Frontend can be simple, but the room should show:

- Main active speaker area.
- Founder avatar.
- Three investor avatar cards.
- Current question.
- Transcript.
- Answer input.
- Progress indicator.

### Fallback Responsibility

If Replicas fails:

- Show static avatar cards.
- Animate active speaker with simple UI state.
- Render the pitch and questions in transcript form.
- Keep the same flow so the demo still works.

Required fallback for judging:

- The room must still advance through all four speakers without Replicas.
- The transcript should show the founder pitch and three investor questions.
- The answer box should still call `POST /api/sessions/:id/answer`.

### doniv Done Criteria

- Founder role can present pitch.
- Three investor roles exist.
- Each investor can ask one question.
- Live room can advance through pitch and Q&A.
- Fallback visual mode works.

## Owner 3: eshwar

### Sponsor Focus

trymemoir.ai: promotion, marketing narrative, pitch generation, founder voice, launch assets.

### Core Responsibility

Make the generated content strong. eshwar owns the marketing brain of the product.

### Build Tasks

1. Replace mock logic inside `src/server/services/memoirAdapter.mjs`.
2. Preserve the existing function names and return shapes.
3. Generate 60-second YC-style pitch.
4. Generate product positioning.
5. Generate exactly three investor questions.
6. Generate answer feedback.
7. Generate rewritten pitch after Q&A.
8. Generate final promotion package.

### Backend Files For eshwar

Edit:

```text
src/server/services/memoirAdapter.mjs
```

Reference mock output:

```text
src/server/services/mockMemoir.mjs
```

Do not edit these unless necessary:

```text
src/server/index.mjs
src/server/store/
```

The backend already calls the adapter at the right moments:

- `POST /api/sessions` calls `generatePitchPackage(context)`.
- `POST /api/sessions/:id/answer` calls `evaluateAnswer(input)`.
- `POST /api/sessions/:id/finalize` calls `generateFinalReport(input)`.

### Outputs To Generate

#### Pitch Package

- `pitch`: 60-second spoken pitch.
- `one_liner`: crisp company description.
- `positioning`: why this product matters.
- `proof_points`: 3 concrete proof points.
- `risks`: 3 investor concerns.
- `investor_questions`: 3 questions, one per investor type.

#### Promotion Package

- `x_thread`
- `linkedin_post`
- `hacker_news_post`
- `product_hunt_tagline`
- `product_hunt_description`
- `demo_video_script`

#### Final Report

- `readiness_score`
- `score_breakdown`
- `strengths`
- `weaknesses`
- `rewritten_pitch`
- `best_answers`
- `launch_assets`

### trymemoir.ai Adapter Interface

Build the rest of the app around this interface:

```ts
type StartupContext = {
  companyName: string;
  description: string;
  targetCustomer: string;
  problem: string;
  solution: string;
  whyNow: string;
  traction?: string;
  businessModel?: string;
  competitors?: string;
  productUrl?: string;
  repoUrl?: string;
  founderVoiceSample?: string;
};

type PitchPackage = {
  pitch: string;
  oneLiner: string;
  positioning: string;
  proofPoints: string[];
  risks: string[];
  investorQuestions: {
    investorType: "skeptical_partner" | "technical_partner" | "growth_partner";
    question: string;
  }[];
  launchAssets: {
    assetType: string;
    content: string;
  }[];
};

async function generatePitchPackage(
  context: StartupContext
): Promise<PitchPackage>;

async function evaluateAnswer(input: {
  context: StartupContext;
  pitch: string;
  investorType: string;
  question: string;
  answer: string;
}): Promise<{
  score: number;
  feedback: string;
  strongerAnswer: string;
}>;

async function generateFinalReport(input: {
  context: StartupContext;
  originalPitch: string;
  answers: {
    investorType: string;
    question: string;
    answer: string;
    feedback?: string;
  }[];
}): Promise<{
  readinessScore: number;
  scoreBreakdown: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  rewrittenPitch: string;
  launchAssets: {
    assetType: string;
    content: string;
  }[];
}>;
```

### Content Rules

Generated content must:

- Sound like a real founder, not a generic AI assistant.
- Avoid fake traction.
- Avoid fake customers.
- Be specific about user pain.
- Be optimized for spoken delivery.
- Be punchy enough for a hackathon demo.
- Include promotional assets that show trymemoir.ai's value clearly.

### Fallback Responsibility

If trymemoir.ai is unavailable:

- Use a local LLM or static mock response.
- Keep output structure identical.
- Make sure Advaita's backend receives the same JSON shape.

### eshwar Done Criteria

- Pitch generation works.
- Investor question generation works.
- Answer feedback works.
- Final rewritten pitch works.
- Promotion package works.
- Mock fallback works.

## Shared Frontend Plan

Vibecode this after the three sponsor slices are working.

### Pages

1. `/`
   - Startup intake form.
   - "Generate Demo Day Room" button.

2. `/session/:id`
   - Pitch preview.
   - Start simulation button.

3. `/session/:id/room`
   - Avatar stage.
   - Investor panel.
   - Transcript.
   - Answer box.

4. `/session/:id/report`
   - Score.
   - Rewritten pitch.
   - Launch package.

### Visual Priority

Make the room page look best. Judges will remember that screen.

Use:

- Big active speaker area.
- Three investor cards.
- Transcript feed.
- Clear score/report at the end.

## 4-Hour Timeline

### 0:00-0:30

Everyone:

- Align on data shapes in this file.
- Create project skeleton.
- Decide frontend stack.

Advaita:

- Set up InsForge/database/API skeleton.

doniv:

- Start Replicas adapter and persona definitions.

eshwar:

- Start trymemoir.ai adapter and prompt outputs.

### 0:30-1:30

Advaita:

- Build tables.
- Implement `/api/startups`.
- Implement `/api/sessions`.
- Add mock data fallback.

doniv:

- Get founder avatar or fallback avatar stage working.
- Create investor role cards.

eshwar:

- Generate pitch package.
- Generate investor questions.
- Generate launch assets.

### 1:30-2:30

Advaita:

- Wire API routes to eshwar's adapter.
- Store generated pitch and questions.
- Store user answers.

doniv:

- Connect generated pitch/questions to live room flow.
- Add active speaker transitions.

eshwar:

- Build answer evaluation.
- Build final report and rewritten pitch generation.

### 2:30-3:15

Everyone:

- Vibecode frontend.
- Connect intake to session creation.
- Connect session to room.
- Connect room to report.

### 3:15-3:45

Everyone:

- Add fallback demo button.
- Add sample startup.
- Polish the room page.
- Fix broken state transitions.

### 3:45-4:00

Everyone:

- Rehearse demo.
- Prepare backup generated session.
- Do not add new features.

## Integration Contract

Everyone should preserve these JSON shapes so the frontend can be assembled quickly.

### Startup

```json
{
  "id": "startup_123",
  "companyName": "Example AI",
  "description": "AI pitch simulator for founders",
  "targetCustomer": "Early-stage founders",
  "problem": "Founders do not get enough high-quality pitch practice",
  "solution": "AI investor replicas simulate Demo Day",
  "whyNow": "AI avatars and marketing generation are now good enough",
  "traction": "Hackathon prototype",
  "businessModel": "SaaS",
  "competitors": "Pitch deck tools and generic AI chatbots",
  "productUrl": "",
  "repoUrl": "",
  "founderVoiceSample": ""
}
```

### Session

```json
{
  "id": "session_123",
  "startupId": "startup_123",
  "status": "ready",
  "pitch": "Example 60-second pitch...",
  "oneLiner": "Demo Day practice with AI investor replicas.",
  "positioning": "The fastest way for founders to pressure-test a pitch.",
  "questions": [
    {
      "id": "q1",
      "investorType": "skeptical_partner",
      "question": "Why is this a venture-scale company?"
    }
  ],
  "launchAssets": [
    {
      "assetType": "x_thread",
      "content": "..."
    }
  ]
}
```

### Final Report

```json
{
  "readinessScore": 82,
  "scoreBreakdown": {
    "clarity": 9,
    "urgency": 8,
    "market": 7,
    "differentiation": 8,
    "gtm": 7,
    "fundability": 8
  },
  "strengths": [
    "Clear customer pain",
    "Strong demo format"
  ],
  "weaknesses": [
    "Needs sharper market sizing",
    "Needs clearer defensibility"
  ],
  "rewrittenPitch": "Improved pitch...",
  "launchAssets": [
    {
      "assetType": "linkedin_post",
      "content": "..."
    }
  ]
}
```

## Demo Backup Plan

If live APIs fail, use a preloaded sample startup:

Company:

PitchMirror

Description:

AI Demo Day simulator that lets founders practice with investor avatars and get a rewritten pitch.

Target customer:

Early-stage technical founders.

Demo line:

"Every founder practices in front of a mirror. We built the mirror that talks back like a YC partner."

Fallback flow:

- Show mock pitch.
- Show mock founder avatar stage.
- Show three investor questions.
- Type one answer.
- Show final score and rewritten pitch.

This still tells the complete story.

## Final Rule

By hour 3, stop building infrastructure and make the demo coherent.

The winning demo is not a perfect product. The winning demo is a believable AI Demo Day room that uses:

- InsForge to run the app.
- Replicas to create the simulation.
- trymemoir.ai to generate the promotion and pitch intelligence.
