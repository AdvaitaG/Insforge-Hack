# YC Demo Day Simulator

## One-Line Pitch

YC Demo Day Simulator is an AI pitch room that turns a startup idea, repo, or product URL into a polished Demo Day pitch, then stress-tests it with live investor replicas.

## What We Are Building

The product lets a founder practice and improve a startup pitch in a realistic AI-generated Demo Day environment.

The founder enters basic startup context: company name, product description, target customer, traction, repo URL, product URL, and optional founder voice sample. The app generates a 60-second Demo Day pitch, launches a live founder replica to present it, then brings in investor replicas that ask hard follow-up questions.

After the Q&A, the app scores the pitch and rewrites it based on weaknesses.

The demo should feel like a founder stepped into an AI-powered YC rehearsal room.

## Core Demo Flow

1. User creates a startup profile.
2. User enters startup details or pastes a repo/product URL.
3. Memoir generates the pitch narrative, positioning, and launch copy.
4. Replicas creates or loads a founder avatar.
5. Founder avatar presents the pitch.
6. Three investor avatars ask questions:
   - Skeptical Partner: market size, urgency, competition.
   - Technical Partner: product depth, moat, architecture.
   - Growth Partner: distribution, pricing, retention.
7. User answers questions by text or voice.
8. App scores the session.
9. Memoir rewrites the pitch and generates supporting launch assets.
10. User gets a final "Demo Day Readiness Report."

## Why This Is Impressive

Most AI pitch tools generate text. This creates a live room.

The judges should see:

- A founder avatar presenting a pitch.
- Investor avatars interrupting with realistic questions.
- The app adapting based on answers.
- A before/after pitch improvement.
- A final launch package generated from the same startup context.

## Sponsor and Tool Usage

### Memoir

Memoir is the core marketing and pitch-generation layer.

We use it to:

- Generate founder-style pitch language.
- Turn product context into positioning.
- Create the 60-second Demo Day script.
- Generate launch content for X, LinkedIn, Hacker News, and Product Hunt.
- Rewrite the pitch after investor criticism.
- Produce investor FAQ answers.
- Optionally learn from a founder voice sample.

Memoir should feel central, not decorative. The output of Memoir drives the pitch, Q&A preparation, and final launch assets.

### Replicas

Replicas is the live avatar layer.

We use it to:

- Present the founder pitch as a talking avatar.
- Create investor avatars with distinct personalities.
- Make the experience feel like a real Demo Day panel.
- Optionally create a customer avatar for extra feedback.

Replicas is the visual hook of the demo. It should be on screen during the pitch and Q&A.

### InsForge

InsForge is the application backend and infrastructure.

We use it for:

- Auth, if time allows.
- Postgres database.
- File storage for uploaded founder samples or pitch assets.
- Realtime session state during the pitch room.
- Edge/API functions for AI orchestration.
- Model gateway or server-side LLM calls.
- Deployment.

### Optional Supporting Tools

Use only if they directly improve the demo:

- Speech-to-text for spoken founder answers.
- Text-to-speech if Replicas needs generated spoken responses.
- Browser/scraping tool to inspect product URLs.
- GitHub API to read README files and recent commits.
- Video export API to generate a shareable pitch clip.

## MVP Scope

Build the smallest version that creates the full illusion.

### Must Have

- Startup intake form.
- Pitch generation.
- Founder avatar presenting the pitch.
- Three investor personas.
- Investor questions generated from startup context.
- Text-based founder answers.
- Pitch scoring.
- Improved rewritten pitch.
- Final report page.

### Should Have

- Product URL or repo URL ingestion.
- Voice input for answering investor questions.
- Launch content generation.
- Session history.
- Shareable final report.

### Nice To Have

- Real founder voice cloning.
- Live video export.
- Multi-founder mode.
- Investor difficulty setting.
- Customer persona feedback.
- Competitive analysis.

## Non-Goals

Do not build:

- A full slide editor.
- A general chatbot.
- A complete CRM.
- A full fundraising workflow.
- Deep analytics dashboards.
- Complex team permissioning.

The goal is a tight, theatrical, useful pitch simulator.

## User Experience

### Screen 1: Startup Intake

Fields:

- Company name.
- One-line product description.
- Target customer.
- Problem.
- Solution.
- Why now.
- Traction.
- Business model.
- Competitors.
- Product URL.
- GitHub repo URL.
- Founder voice sample text.

Primary action:

- "Generate Demo Day Room"

### Screen 2: Generated Pitch Preview

Show:

- Generated 60-second pitch.
- One-line positioning.
- Investor FAQ preview.
- Launch post preview.

Primary actions:

- "Start Simulation"
- "Regenerate"
- "Edit Pitch"

### Screen 3: Live Demo Day Room

Layout:

- Main video/avatar area for founder or active investor.
- Side panel with investor avatars.
- Transcript feed.
- Current question.
- Answer input box.
- Timer.

Flow:

- Founder avatar presents pitch.
- Investor 1 asks question.
- User answers.
- Investor 2 asks question.
- User answers.
- Investor 3 asks question.
- User answers.
- App transitions to score report.

### Screen 4: Readiness Report

Show:

- Overall score.
- Category scores.
- Top strengths.
- Top weaknesses.
- Rewritten pitch.
- Best answers to investor questions.
- Launch content package.

Primary actions:

- "Run Again"
- "Export Report"
- "Generate Launch Kit"

## System Architecture

```text
Frontend
  |
  | creates startup profile
  v
InsForge API / Edge Functions
  |
  | stores profile/session data
  v
Postgres

InsForge API / Edge Functions
  |
  | sends startup context
  v
Memoir Adapter
  |
  | returns pitch, positioning, launch assets, rewrite
  v
InsForge API / Edge Functions

InsForge API / Edge Functions
  |
  | sends scripts/personas
  v
Replicas Adapter
  |
  | returns avatar session/video/embed state
  v
Frontend Demo Room
```

## Main Components

### Frontend

Recommended stack:

- Next.js or Vite React.
- Tailwind for speed.
- Component states kept simple.
- Realtime updates through InsForge if available.

Important frontend components:

- `StartupIntakeForm`
- `PitchPreview`
- `DemoRoom`
- `AvatarStage`
- `InvestorPanel`
- `Transcript`
- `AnswerInput`
- `ScoreReport`
- `LaunchKit`

### Backend

Recommended shape:

- Thin API routes or InsForge edge functions.
- Keep orchestration server-side.
- Do not expose API keys in the frontend.

Important backend modules:

- `memoirAdapter`
- `replicasAdapter`
- `pitchGenerator`
- `questionGenerator`
- `answerEvaluator`
- `reportGenerator`
- `sessionStore`

## Data Model

### `startups`

Stores the startup profile.

Fields:

- `id`
- `user_id`
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
- `updated_at`

### `pitch_sessions`

Stores each simulation run.

Fields:

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

### `investor_questions`

Stores generated questions and answers.

Fields:

- `id`
- `session_id`
- `investor_type`
- `question`
- `answer`
- `feedback`
- `score`
- `created_at`

### `launch_assets`

Stores generated content.

Fields:

- `id`
- `session_id`
- `asset_type`
- `content`
- `created_at`

Asset types:

- `x_thread`
- `linkedin_post`
- `hacker_news_post`
- `product_hunt_copy`
- `demo_script`
- `investor_faq`

### `avatars`

Stores avatar metadata.

Fields:

- `id`
- `session_id`
- `role`
- `provider_avatar_id`
- `display_name`
- `persona`
- `created_at`

Roles:

- `founder`
- `skeptical_partner`
- `technical_partner`
- `growth_partner`
- `customer`

## API Routes

### `POST /api/startups`

Creates a startup profile.

Request:

```json
{
  "companyName": "Launch Doppelganger",
  "description": "AI launch team for developer tools",
  "targetCustomer": "Technical founders",
  "problem": "Founders struggle to explain and launch what they build",
  "solution": "Generate launch assets and live pitch practice from product context",
  "whyNow": "AI-native content and avatar infrastructure are good enough",
  "traction": "Hackathon prototype",
  "businessModel": "SaaS",
  "competitors": "Pitch deck tools, generic AI writing tools",
  "productUrl": "",
  "repoUrl": "",
  "founderVoiceSample": ""
}
```

### `POST /api/sessions`

Creates a pitch session and starts generation.

Request:

```json
{
  "startupId": "startup_123"
}
```

Response:

```json
{
  "sessionId": "session_123",
  "status": "generating"
}
```

### `GET /api/sessions/:id`

Gets current session state.

Response:

```json
{
  "id": "session_123",
  "status": "ready",
  "generatedPitch": "...",
  "positioning": "...",
  "questions": [],
  "launchAssets": []
}
```

### `POST /api/sessions/:id/start`

Starts the live simulation.

Response:

```json
{
  "status": "started",
  "currentStep": "founder_pitch"
}
```

### `POST /api/sessions/:id/answer`

Submits a founder answer.

Request:

```json
{
  "questionId": "question_123",
  "answer": "We start with devtool founders because they already need launch content every week."
}
```

Response:

```json
{
  "feedback": "Clear beachhead, but needs stronger evidence of repeated pain.",
  "score": 7,
  "nextQuestionId": "question_456"
}
```

### `POST /api/sessions/:id/finalize`

Scores the full session and generates the rewritten pitch.

Response:

```json
{
  "readinessScore": 82,
  "scoreBreakdown": {
    "clarity": 9,
    "urgency": 7,
    "market": 7,
    "differentiation": 8,
    "gtm": 8,
    "fundability": 8
  },
  "rewrittenPitch": "...",
  "launchAssets": []
}
```

## Memoir Adapter

Create a backend adapter so the rest of the app does not depend on exact Memoir API details.

Interface:

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

type GeneratedPitchPackage = {
  pitch: string;
  positioning: string;
  investorQuestions: InvestorQuestion[];
  launchAssets: LaunchAsset[];
};

async function generatePitchPackage(
  context: StartupContext
): Promise<GeneratedPitchPackage>;

async function rewritePitchAfterFeedback(
  context: StartupContext,
  originalPitch: string,
  answers: InvestorAnswer[]
): Promise<string>;
```

The prompt to Memoir should request:

- Concise YC-style pitch language.
- Specific claims only.
- No fake traction.
- Clear customer and pain.
- Founder voice matching when a sample is provided.
- Investor questions that are sharp but answerable.
- Launch content for developer/startup audiences.

## Replicas Adapter

Create a backend adapter so we can swap implementation details if needed.

Interface:

```ts
type AvatarRole =
  | "founder"
  | "skeptical_partner"
  | "technical_partner"
  | "growth_partner"
  | "customer";

type AvatarConfig = {
  role: AvatarRole;
  displayName: string;
  persona: string;
  script?: string;
};

type AvatarSession = {
  providerAvatarId: string;
  embedUrl?: string;
  streamUrl?: string;
  status: "created" | "ready" | "speaking" | "complete";
};

async function createAvatar(config: AvatarConfig): Promise<AvatarSession>;

async function speak(
  avatarId: string,
  text: string
): Promise<AvatarSession>;
```

For the hackathon, the simplest acceptable version is:

- Use Replicas for the founder pitch.
- Use static investor avatars if live investor generation is too slow.
- Show investor questions in the transcript even if only the founder avatar speaks.

## Investor Personas

### Skeptical Partner

Focus:

- Why is this a venture-scale company?
- Why will anyone care now?
- What stops incumbents from copying this?
- Is this a feature or a company?

Tone:

- Direct.
- Unimpressed by vague claims.
- Pushes for specificity.

### Technical Partner

Focus:

- What is technically hard here?
- What is the product wedge?
- What improves with usage?
- What is the moat?

Tone:

- Precise.
- Architecture-aware.
- Suspicious of hand-wavy AI wrappers.

### Growth Partner

Focus:

- Who is the first user?
- How do we acquire them?
- What is the pricing model?
- What is the repeat usage loop?

Tone:

- Practical.
- Distribution-focused.
- Pushes for concrete channels.

## Scoring Rubric

Score each category from 1 to 10.

### Clarity

Can someone explain the company after hearing the pitch once?

### Urgency

Does the problem sound painful and timely?

### Market

Is there a clear path to a large market?

### Differentiation

Is the product meaningfully different from existing options?

### Product Depth

Does the solution feel like a real product, not a thin prompt wrapper?

### GTM

Is there a believable first customer and distribution channel?

### Fundability

Would this be interesting enough for an early-stage investor conversation?

## Prompting Strategy

### Pitch Generation Prompt

Ask Memoir to generate:

- A 60-second YC-style pitch.
- A 10-second one-liner.
- Three proof points.
- Three investor concerns.
- Five likely investor questions.
- Five launch content snippets.

Constraints:

- No invented metrics.
- Use plain English.
- Keep claims specific.
- Optimize for spoken delivery.
- Preserve founder voice if provided.

### Question Generation Prompt

Ask for questions that:

- Are specific to the startup.
- Expose weak assumptions.
- Cover market, technical, and growth risks.
- Are short enough to ask live.

### Evaluation Prompt

Ask for:

- Numeric score.
- Short critique.
- Best part of the answer.
- Biggest weakness.
- A stronger rewritten answer.

## Build Plan

### Phase 1: Static End-to-End Demo

Goal:

Get the full flow working without relying on every integration.

Tasks:

- Build intake form.
- Save startup profile.
- Generate pitch package with mock Memoir response.
- Render pitch preview.
- Render demo room.
- Show scripted investor questions.
- Accept text answers.
- Render score report.

### Phase 2: Memoir Integration

Goal:

Replace mock generation with real Memoir-powered outputs.

Tasks:

- Implement `memoirAdapter`.
- Generate pitch package from startup context.
- Generate launch assets.
- Rewrite pitch after feedback.
- Add loading and failure states.

### Phase 3: Replicas Integration

Goal:

Make the demo visually memorable.

Tasks:

- Implement `replicasAdapter`.
- Create founder avatar.
- Send generated pitch to founder avatar.
- Add investor avatar cards.
- If possible, make each investor speak their question.
- Add fallback text mode if avatar calls fail.

### Phase 4: Polish and Stage Demo

Goal:

Make it reliable under judging conditions.

Tasks:

- Add one-click sample startup.
- Add "random judge question" input.
- Add visible before/after pitch comparison.
- Add exportable report.
- Add polished loading states.
- Pre-cache or pre-generate a backup demo session.

## Reliability Plan

Hackathon demos fail when integrations are slow. Build fallbacks.

Required fallbacks:

- If Memoir is unavailable, use a local mock pitch package.
- If Replicas is unavailable, show transcript plus static avatar cards.
- If product URL ingestion fails, continue with manual startup fields.
- If scoring fails, show a deterministic local score based on completed answers.

The app must always be demoable.

## Suggested Team Split

### Person 1: Frontend

Owns:

- Intake form.
- Pitch preview.
- Demo room UI.
- Report page.
- Loading/error states.

### Person 2: Backend and Database

Owns:

- InsForge setup.
- Tables.
- API routes.
- Session state.
- Persistence.

### Person 3: Memoir Integration

Owns:

- Prompt design.
- `memoirAdapter`.
- Pitch generation.
- Rewrite generation.
- Launch asset generation.

### Person 4: Replicas Integration and Demo Polish

Owns:

- `replicasAdapter`.
- Avatar stage.
- Founder pitch playback.
- Investor persona visuals.
- Backup demo session.

## Demo Script

Start with:

"Every founder has practiced their pitch in front of a mirror. We built the mirror that talks back like a YC partner."

Live steps:

1. Enter a startup idea.
2. Generate the Demo Day room.
3. Show the generated 60-second pitch.
4. Start the founder avatar.
5. Let investor avatars ask questions.
6. Answer one question badly.
7. Show the score and critique.
8. Generate the improved pitch.
9. Show launch assets.

Close with:

"Memoir creates the founder's market narrative. Replicas turns it into a live rehearsal room. InsForge runs the product end to end."

## Winning Criteria

We win if judges remember:

- The founder avatar pitched live.
- The investor panel asked real questions.
- The pitch got better after criticism.
- The product is useful beyond the hackathon.

## Final MVP Definition

The hackathon build is complete when:

- A teammate can create a startup profile.
- The app generates a pitch.
- A founder avatar or avatar-like stage presents it.
- Three investor questions are asked.
- The user can answer them.
- The app scores the session.
- The app rewrites the pitch.
- The final report is visible and exportable.

