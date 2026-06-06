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

  const evaluation = await evaluateAnswer({
    context: toStartupContext(session.startup),
    pitch: session.generatedPitch,
    investorType: question.investorType,
    question: question.question,
    answer: normalizeText(body.answer)
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

async function socialPostsHandler(_req, res, sessionId) {
  const session = await getSession(sessionId);
  if (!session) return sendJson(res, 404, { error: "Session not found" });

  const posts = await generateSocialPostText(
    toStartupContext(session.startup),
    session.generatedPitch
  );
  sendJson(res, 200, posts);
}

async function investorResponseHandler(req, res) {
  const body = await readJson(req);
  assertRequired(body, ["message"]);

  let context = {};
  if (body.sessionId) {
    const session = await getSession(body.sessionId);
    if (session?.startup) context = toStartupContext(session.startup);
  } else if (body.context) {
    context = body.context;
  }

  const response = await generateInvestorResponse({
    context,
    investor: body.investor || {},
    message: normalizeText(body.message),
    fallbackText: normalizeText(body.fallbackText)
  });

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

async function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

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
