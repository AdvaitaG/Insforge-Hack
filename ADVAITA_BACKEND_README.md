# Advaita Backend Slice

This is the backend spine for the YC Demo Day Simulator.

It uses InsForge for database persistence when the project is linked. It falls back to local JSON if InsForge is not configured or if `USE_LOCAL_STORE=true`.

## Run

```bash
npm run dev:api
```

Default URL:

```text
http://127.0.0.1:8787
```

Health check:

```bash
curl http://localhost:8787/health
```

## What This Owns

- Startup creation.
- Pitch session creation.
- InsForge database persistence.
- Local JSON fallback persistence.
- Mock fallback generation.
- Stable API contracts for the frontend.
- Adapter boundaries for eshwar's trymemoir.ai work.
- Avatar metadata for doniv's Replicas work.
- InsForge schema in `insforge.schema.sql`.

## API Flow

### 1. Create Startup

```bash
curl -X POST http://localhost:8787/api/startups \
  -H "content-type: application/json" \
  -d '{
    "companyName": "PitchMirror",
    "description": "AI Demo Day simulator for founders",
    "targetCustomer": "Early-stage technical founders",
    "problem": "Founders do not get enough high-quality pitch practice",
    "solution": "AI investor replicas simulate Demo Day",
    "whyNow": "AI avatars and founder marketing generation are now good enough"
  }'
```

### 2. Create Session

```bash
curl -X POST http://localhost:8787/api/sessions \
  -H "content-type: application/json" \
  -d '{"startupId":"startup_xxxxxxxx"}'
```

### 3. Get Session

```bash
curl http://localhost:8787/api/sessions/session_xxxxxxxx
```

### 4. Submit Answer

```bash
curl -X POST http://localhost:8787/api/sessions/session_xxxxxxxx/answer \
  -H "content-type: application/json" \
  -d '{
    "questionId": "question_xxxxxxxx",
    "answer": "We start with technical founders preparing for accelerators and fundraising because they need repeated pitch iterations."
  }'
```

### 5. Finalize Report

```bash
curl -X POST http://localhost:8787/api/sessions/session_xxxxxxxx/finalize
```

## Data Storage

Primary storage is the linked InsForge project:

```text
YC Sim
https://mcqnsis9.us-east.insforge.app
```

The server reads local project credentials from:

```text
.insforge/project.json
```

That directory is ignored by Git and must not be committed.

To force local-only fallback storage:

```bash
USE_LOCAL_STORE=true npm run dev:api
```

Local fallback data is saved at:

```text
.data/demo-day-store.json
```

This file is ignored by Git.

## InsForge Setup

The project is linked with:

```bash
npx @insforge/cli link --project-id d0f375b8-a059-426e-9989-45b3afe61817
```

The schema migration has been applied from:

```text
migrations/20260606180406_create-yc-sim-schema.sql
```

The static schema reference is:

```text
insforge.schema.sql
```

Frontend route contracts do not change between InsForge and local fallback storage.

## Integration Points

### eshwar

Replace or point these functions at trymemoir.ai:

```text
src/server/services/memoirAdapter.mjs
```

Supported optional env vars:

```text
MEMOIR_API_URL=
MEMOIR_API_KEY=
```

If `MEMOIR_API_URL` is set, the adapter tries:

- `POST /pitch-package`
- `POST /evaluate-answer`
- `POST /final-report`

If those calls fail, the app falls back to mock content.

### doniv

Use avatar metadata from each session response:

```json
{
  "avatars": [
    {
      "role": "founder",
      "displayName": "Founder",
      "persona": "Confident technical founder presenting a crisp 60-second Demo Day pitch."
    }
  ]
}
```

The Replicas adapter should preserve the same role names:

- `founder`
- `skeptical_partner`
- `technical_partner`
- `growth_partner`
