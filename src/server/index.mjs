import http from "node:http";
import { readFileSync } from "node:fs";
import {
  addAvatars,
  addLaunchAssets,
  addQuestions,
  createSession,
  createStartup,
  getAgentPersonalities,
  getSession,
  getStartup,
  updateQuestionAnswer,
  updateSession
} from "./store/index.mjs";
import { createDefaultAvatars } from "./services/avatars.mjs";
import {
  evaluateAnswer,
  generateFinalReport,
  generateInvestorResponse,
  generatePitchPackage,
  generateSocialPostText
} from "./services/memoirAdapter.mjs";
import { createAvatar, speak } from "./services/replicasAdapter.mjs";
import {
  collectAnalysis,
  createReplica,
  deleteReplica,
  extractFindings,
  getReplica,
  openEventStream,
  replicasConfigured,
  sendMessage,
  startTechnicalDueDiligence
} from "./services/replicasAgent.mjs";
import {
  assertRequired,
  id,
  normalizeText,
  notFound,
  now,
  readJson,
  sendJson
} from "./utils.mjs";

function loadLocalEnv() {
  try {
    const raw = readFileSync(".env", "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [key, ...valueParts] = trimmed.split("=");
      if (!process.env[key]) {
        process.env[key] = valueParts.join("=").replace(/^['"]|['"]$/g, "");
      }
    }
  } catch {
    // Local .env is optional. Production should use real environment variables.
  }
}

loadLocalEnv();

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "127.0.0.1";

function toStartupContext(startup) {
  return {
    companyName: startup.companyName,
    description: startup.description,
    targetCustomer: startup.targetCustomer,
    problem: startup.problem,
    solution: startup.solution,
    whyNow: startup.whyNow,
    traction: startup.traction,
    businessModel: startup.businessModel,
    competitors: startup.competitors,
    productUrl: startup.productUrl,
    repoUrl: startup.repoUrl,
    founderVoiceSample: startup.founderVoiceSample
  };
}

function buildPersonaContext(personalities) {
  const founderHelpers = personalities
    .filter((persona) =>
      ["story_coach", "pitch_coach", "yc_partner"].includes(persona.role)
    )
    .map(
      (persona) =>
        `${persona.displayName}: ${persona.persona} ${persona.questionStyle}`
    );

  return founderHelpers.length > 0
    ? `InsForge persona guidance for founder voice: ${founderHelpers.join(" ")}`
    : "";
}

function withPersonaContext(context, personalities) {
  const personaContext = buildPersonaContext(personalities);
  return {
    ...context,
    founderVoiceSample: [context.founderVoiceSample, personaContext]
      .filter(Boolean)
      .join("\n")
  };
}

function serializeSession(session) {
  if (!session) return null;
  return {
    id: session.id,
    startupId: session.startupId,
    status: session.status,
    pitch: session.generatedPitch,
    oneLiner: session.oneLiner,
    positioning: session.positioning,
    readinessScore: session.readinessScore,
    scoreBreakdown: session.scoreBreakdown,
    rewrittenPitch: session.rewrittenPitch,
    startup: session.startup,
    questions: session.questions,
    launchAssets: session.launchAssets,
    avatars: session.avatars,
    createdAt: session.createdAt,
    completedAt: session.completedAt
  };
}

async function createStartupHandler(req, res) {
  const body = await readJson(req);
  assertRequired(body, ["companyName", "description"]);

  const startup = {
    id: id("startup"),
    companyName: normalizeText(body.companyName),
    description: normalizeText(body.description),
    targetCustomer: normalizeText(body.targetCustomer),
    problem: normalizeText(body.problem),
    solution: normalizeText(body.solution),
    whyNow: normalizeText(body.whyNow),
    traction: normalizeText(body.traction),
    businessModel: normalizeText(body.businessModel),
    competitors: normalizeText(body.competitors),
    productUrl: normalizeText(body.productUrl),
    repoUrl: normalizeText(body.repoUrl),
    founderVoiceSample: normalizeText(body.founderVoiceSample),
    createdAt: now()
  };

  await createStartup(startup);
  sendJson(res, 201, startup);
}

async function createSessionHandler(req, res) {
  const body = await readJson(req);
  assertRequired(body, ["startupId"]);

  const startup = await getStartup(body.startupId);
  if (!startup) return sendJson(res, 404, { error: "Startup not found" });

  // TODO (Advaita): enrich startup.founderVoiceSample from InsForge agent_personalities before
  // calling generatePitchPackage so the pitch reflects the stored founder persona. Example:
  //   const personalities = await getAgentPersonalities();
  //   const founderPersona = personalities.find(p => p.role === "founder");
  //   if (founderPersona && !startup.founderVoiceSample) startup.founderVoiceSample = founderPersona.persona;

  const sessionId = id("session");
  const session = await createSession({
    id: sessionId,
    startupId: startup.id,
    status: "generating",
    generatedPitch: "",
    oneLiner: "",
    positioning: "",
    readinessScore: null,
    scoreBreakdown: null,
    rewrittenPitch: "",
    createdAt: now(),
    completedAt: null
  });

  const personalities = await getAgentPersonalities();
  const pitchPackage = await generatePitchPackage(
    withPersonaContext(toStartupContext(startup), personalities)
  );
  const questionRows = pitchPackage.investorQuestions.map((question) => ({
    id: id("question"),
    sessionId,
    investorType: question.investorType,
    question: question.question,
    answer: "",
    feedback: "",
    score: null,
    strongerAnswer: "",
    createdAt: now()
  }));
  const assetRows = pitchPackage.launchAssets.map((asset) => ({
    id: id("asset"),
    sessionId,
    assetType: asset.assetType,
    content: asset.content,
    createdAt: now()
  }));

  await addQuestions(questionRows);
  await addLaunchAssets(assetRows);
  await addAvatars(createDefaultAvatars(sessionId));
  await updateSession(sessionId, {
    status: "ready",
    generatedPitch: pitchPackage.pitch,
    oneLiner: pitchPackage.oneLiner,
    positioning: pitchPackage.positioning
  });

  const hydrated = await getSession(session.id);
  sendJson(res, 201, serializeSession(hydrated));
}

async function answerHandler(req, res, sessionId) {
  const body = await readJson(req);
  assertRequired(body, ["questionId", "answer"]);

  const session = await getSession(sessionId);
  if (!session) return sendJson(res, 404, { error: "Session not found" });

  const question = session.questions.find((item) => item.id === body.questionId);
  if (!question) return sendJson(res, 404, { error: "Question not found" });

  const personalities = await getAgentPersonalities().catch(() => []);
  const personality = personalities.find((p) => p.role === question.investorType);

  const evaluation = await evaluateAnswer({
    context: toStartupContext(session.startup),
    pitch: session.generatedPitch,
    investorType: question.investorType,
    question: question.question,
    answer: normalizeText(body.answer),
    investorPersona: personality
      ? { systemPrompt: personality.systemPrompt, persona: personality.persona, questionStyle: personality.questionStyle }
      : null
  });

  const updated = await updateQuestionAnswer(question.id, {
    answer: normalizeText(body.answer),
    feedback: evaluation.feedback,
    score: evaluation.score,
    strongerAnswer: evaluation.strongerAnswer
  });

  sendJson(res, 200, {
    question: updated,
    nextQuestionId:
      session.questions.find((item) => !item.answer && item.id !== question.id)?.id ?? null
  });
}

async function finalizeHandler(_req, res, sessionId) {
  const session = await getSession(sessionId);
  if (!session) return sendJson(res, 404, { error: "Session not found" });

  const report = await generateFinalReport({
    context: toStartupContext(session.startup),
    originalPitch: session.generatedPitch,
    answers: session.questions.map((question) => ({
      investorType: question.investorType,
      question: question.question,
      answer: question.answer,
      feedback: question.feedback
    }))
  });

  const extraAssets = (report.launchAssets || []).map((asset) => ({
    id: id("asset"),
    sessionId,
    assetType: asset.assetType,
    content: asset.content,
    createdAt: now()
  }));

  if (extraAssets.length > 0) await addLaunchAssets(extraAssets);

  await updateSession(sessionId, {
    status: "complete",
    readinessScore: report.readinessScore,
    scoreBreakdown: report.scoreBreakdown,
    rewrittenPitch: report.rewrittenPitch,
    completedAt: now()
  });

  const hydrated = await getSession(sessionId);
  sendJson(res, 200, {
    ...report,
    session: serializeSession(hydrated)
  });
}

const DEMO_CONTEXT = {
  companyName: "FlowDesk",
  description: "AI-powered support that resolves 80% of tickets before a human sees them.",
  targetCustomer: "Heads of Support Engineering at Series A SaaS companies",
  problem: "Support teams drown in repetitive tickets and lose context across tools.",
  solution: "An AI agent that reads your codebase, docs, and integrations to resolve tickets with full context.",
  whyNow: "Retrieval-augmented LLMs are finally accurate enough for production support."
};

<<<<<<< HEAD
async function socialPostsHandler(_req, res, sessionId) {
  // Resilient: if the session is not persisted (e.g. the demo/sample id),
  // fall back to the FlowDesk sample context so the social tab always renders.
  const session = await getSession(sessionId);
  const context = session?.startup ? toStartupContext(session.startup) : DEMO_CONTEXT;
  const pitch = session?.generatedPitch || "";

  const posts = await generateSocialPostText(context, pitch);
=======
  const posts = await generateSocialPostText(
    toStartupContext(session.startup),
    session.generatedPitch
  );

  // TODO (doniv): for each platform's posts, generate 3-5 simulated user comments using Gemini.
  // Each post already has { text, hook, imageData }. Add a `comments` array to each post:
  //   PostComment { personaType, displayName, text, sentiment: "positive"|"neutral"|"skeptical", likes }
  // Persona types: early_adopter, industry_skeptic, competitor_user, technical_user, casual_observer
  // Use GEMINI_API_KEY (already in .env) — no extra setup needed.

>>>>>>> 030eb1c202d8c24c7dc8b00a1e0ca7933e4e487b
  sendJson(res, 200, posts);
}

async function investorResponseHandler(req, res) {
  const body = await readJson(req);
  assertRequired(body, ["message"]);

  let context = null;
  if (body.sessionId) {
    const session = await getSession(body.sessionId).catch(() => null);
    if (session?.startup) context = toStartupContext(session.startup);
  }
  if (!context && body.context && Object.keys(body.context).length > 0) {
    context = body.context;
  }
  // Fall back to the FlowDesk sample so Gemini always answers in-context.
  if (!context) context = DEMO_CONTEXT;

  console.log(`[investor-response] investor=${body.investor?.name} message="${body.message?.slice(0, 60)}"`);

  const response = await generateInvestorResponse({
    context,
    investor: body.investor || {},
    message: normalizeText(body.message),
    fallbackText: normalizeText(body.fallbackText)
  });

  console.log(`[investor-response] reply="${response.text?.slice(0, 80)}"`);
  sendJson(res, 200, response);
}

async function createAvatarHandler(req, res) {
  const body = await readJson(req);
  assertRequired(body, ["role", "displayName", "persona"]);

  try {
    const avatarSession = await createAvatar({
      role: body.role,
      displayName: body.displayName,
      persona: body.persona,
      script: body.script
    });
    sendJson(res, 201, avatarSession);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Failed to create avatar" });
  }
}

async function speakHandler(req, res, avatarId) {
  const body = await readJson(req);
  assertRequired(body, ["text"]);

  try {
    const updatedSession = await speak(avatarId, body.text);
    sendJson(res, 200, updatedSession);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Failed to make avatar speak" });
  }
}

<<<<<<< HEAD
// ─── Replicas (real coding-agent) handlers ────────────────────────────────────

async function replicaAnalyzeHandler(req, res) {
  if (!replicasConfigured()) {
    return sendJson(res, 200, { configured: false, replicaId: null });
  }
  const body = await readJson(req).catch(() => ({}));
  const label = (body.label || "tech-dd").toString().slice(0, 40).replace(/[^a-z0-9-]/gi, "-");
  const created = await startTechnicalDueDiligence(label);
  const replica = created.replica || created;
  sendJson(res, 200, {
    configured: true,
    replicaId: replica.id,
    status: replica.status,
    repositories: replica.repositories || []
  });
}

async function replicaStatusHandler(_req, res, replicaId) {
  if (!replicasConfigured()) return sendJson(res, 200, { configured: false });
  const data = await getReplica(replicaId, { include: "diffs" });
  const replica = data.replica || data;
  const repoStatus = replica.repository_statuses?.[0] || null;
  sendJson(res, 200, {
    configured: true,
    id: replica.id,
    status: replica.status,
    chats: (replica.chats || []).map((c) => ({ provider: c.provider, processing: c.processing })),
    repoStatus,
    lastActivityAt: replica.last_activity_at || null
  });
}

async function replicaFindingsHandler(_req, res, replicaId) {
  if (!replicasConfigured()) return sendJson(res, 200, { configured: false, findings: null });
  const result = await collectAnalysis(replicaId, { timeoutMs: 90000 });
  const findings = result.text ? extractFindings({ output: result.text }) : null;
  sendJson(res, 200, {
    configured: true,
    findings,
    rawText: result.text || "",
    completed: result.completed,
    errored: result.errored,
    telemetry: result.telemetry
  });
}

async function replicaMessageHandler(req, res, replicaId) {
  if (!replicasConfigured()) return sendJson(res, 200, { configured: false });
  const body = await readJson(req);
  assertRequired(body, ["message"]);
  const result = await sendMessage(replicaId, normalizeText(body.message));
  sendJson(res, 200, { configured: true, ...result });
}

async function replicaDeleteHandler(_req, res, replicaId) {
  if (!replicasConfigured()) return sendJson(res, 200, { configured: false });
  const result = await deleteReplica(replicaId);
  sendJson(res, 200, result);
}

// Proxy the upstream Replicas SSE stream to the browser (keeps API key server-side).
async function replicaStreamHandler(_req, res, replicaId) {
  if (!replicasConfigured()) {
    return sendJson(res, 200, { configured: false });
  }
  const ctrl = new AbortController();
  res.on("close", () => ctrl.abort());
  const upstream = await openEventStream(replicaId, ctrl.signal);
  if (!upstream.ok || !upstream.body) {
    return sendJson(res, 502, { error: "Failed to open event stream" });
  }
  res.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
    connection: "keep-alive",
    "access-control-allow-origin": "*"
  });
  const reader = upstream.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
  } catch {
    // client disconnected or upstream ended
  } finally {
    res.end();
  }
=======
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
>>>>>>> 030eb1c202d8c24c7dc8b00a1e0ca7933e4e487b
}

async function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  setCors(res);

  if (req.method === "OPTIONS") return sendJson(res, 204, {});
  if (req.method === "GET" && url.pathname === "/health") {
    return sendJson(res, 200, { ok: true, service: "yc-demo-day-api" });
  }
  if (req.method === "GET" && url.pathname === "/api/agent-personalities") {
    return sendJson(res, 200, { personalities: await getAgentPersonalities() });
  }
  if (req.method === "POST" && url.pathname === "/api/startups") {
    return createStartupHandler(req, res);
  }
  if (req.method === "POST" && url.pathname === "/api/investor-response") {
    return investorResponseHandler(req, res);
  }
  if (req.method === "POST" && url.pathname === "/api/sessions") {
    return createSessionHandler(req, res);
  }

  const sessionMatch = url.pathname.match(/^\/api\/sessions\/([^/]+)$/);
  if (req.method === "GET" && sessionMatch) {
    const session = await getSession(sessionMatch[1]);
    if (!session) return sendJson(res, 404, { error: "Session not found" });
    return sendJson(res, 200, serializeSession(session));
  }

  const answerMatch = url.pathname.match(/^\/api\/sessions\/([^/]+)\/answer$/);
  if (req.method === "POST" && answerMatch) {
    return answerHandler(req, res, answerMatch[1]);
  }

  const finalizeMatch = url.pathname.match(/^\/api\/sessions\/([^/]+)\/finalize$/);
  if (req.method === "POST" && finalizeMatch) {
    return finalizeHandler(req, res, finalizeMatch[1]);
  }

  const socialPostsMatch = url.pathname.match(/^\/api\/sessions\/([^/]+)\/social-posts$/);
  if (req.method === "POST" && socialPostsMatch) {
    return socialPostsHandler(req, res, socialPostsMatch[1]);
  }

  // ── Replicas (real coding-agent) routes ──
  if (req.method === "POST" && url.pathname === "/api/replica/analyze") {
    return replicaAnalyzeHandler(req, res);
  }
  const replicaStreamMatch = url.pathname.match(/^\/api\/replica\/([^/]+)\/stream$/);
  if (req.method === "GET" && replicaStreamMatch) {
    return replicaStreamHandler(req, res, replicaStreamMatch[1]);
  }
  const replicaFindingsMatch = url.pathname.match(/^\/api\/replica\/([^/]+)\/findings$/);
  if (req.method === "GET" && replicaFindingsMatch) {
    return replicaFindingsHandler(req, res, replicaFindingsMatch[1]);
  }
  const replicaMessageMatch = url.pathname.match(/^\/api\/replica\/([^/]+)\/messages$/);
  if (req.method === "POST" && replicaMessageMatch) {
    return replicaMessageHandler(req, res, replicaMessageMatch[1]);
  }
  const replicaIdMatch = url.pathname.match(/^\/api\/replica\/([^/]+)$/);
  if (req.method === "GET" && replicaIdMatch) {
    return replicaStatusHandler(req, res, replicaIdMatch[1]);
  }
  if (req.method === "DELETE" && replicaIdMatch) {
    return replicaDeleteHandler(req, res, replicaIdMatch[1]);
  }

  if (req.method === "POST" && url.pathname === "/api/avatars/create") {
    return createAvatarHandler(req, res);
  }

  const speakMatch = url.pathname.match(/^\/api\/avatars\/([^/]+)\/speak$/);
  if (req.method === "POST" && speakMatch) {
    return speakHandler(req, res, speakMatch[1]);
  }

  return notFound(res);
}

const server = http.createServer(async (req, res) => {
  try {
    await route(req, res);
  } catch (error) {
    console.error(error);
    sendJson(res, error.status || 500, { error: error.message || "Server error" });
  }
});

server.listen(port, host, () => {
  console.log(`YC Demo Day API running at http://${host}:${port}`);
});
