import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createAdminClient, createClient } from "@insforge/sdk";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const projectConfigPath = join(root, "..", ".insforge", "project.json");

let clientPromise;

async function readProjectConfig() {
  try {
    return JSON.parse(await readFile(projectConfigPath, "utf8"));
  } catch {
    return {};
  }
}

export async function isInsForgeConfigured() {
  const config = await readProjectConfig();
  return Boolean(
    process.env.INSFORGE_URL ||
      config.oss_host ||
      process.env.INSFORGE_API_KEY ||
      process.env.INSFORGE_ANON_KEY ||
      config.api_key
  );
}

async function getClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const config = await readProjectConfig();
      const baseUrl = process.env.INSFORGE_URL || config.oss_host;
      const apiKey = process.env.INSFORGE_API_KEY || config.api_key;
      const anonKey = process.env.INSFORGE_ANON_KEY;

      if (!baseUrl) {
        throw new Error("Missing INSFORGE_URL and .insforge/project.json oss_host");
      }

      if (apiKey) {
        return createAdminClient({ baseUrl, apiKey });
      }

      if (anonKey) {
        return createClient({ baseUrl, anonKey });
      }

      throw new Error("Missing INSFORGE_API_KEY or INSFORGE_ANON_KEY");
    })();
  }

  return clientPromise;
}

function unwrap(result, label) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message || JSON.stringify(result.error)}`);
  }
  return result.data;
}

function fromStartupRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    companyName: row.company_name,
    description: row.description,
    targetCustomer: row.target_customer || "",
    problem: row.problem || "",
    solution: row.solution || "",
    whyNow: row.why_now || "",
    traction: row.traction || "",
    businessModel: row.business_model || "",
    competitors: row.competitors || "",
    productUrl: row.product_url || "",
    repoUrl: row.repo_url || "",
    founderVoiceSample: row.founder_voice_sample || "",
    createdAt: row.created_at
  };
}

function toStartupRow(startup) {
  return {
    id: startup.id,
    company_name: startup.companyName,
    description: startup.description,
    target_customer: startup.targetCustomer,
    problem: startup.problem,
    solution: startup.solution,
    why_now: startup.whyNow,
    traction: startup.traction,
    business_model: startup.businessModel,
    competitors: startup.competitors,
    product_url: startup.productUrl,
    repo_url: startup.repoUrl,
    founder_voice_sample: startup.founderVoiceSample,
    created_at: startup.createdAt
  };
}

function fromSessionRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    startupId: row.startup_id,
    status: row.status,
    generatedPitch: row.generated_pitch || "",
    oneLiner: row.one_liner || "",
    positioning: row.positioning || "",
    readinessScore: row.readiness_score,
    scoreBreakdown: row.score_breakdown,
    rewrittenPitch: row.rewritten_pitch || "",
    createdAt: row.created_at,
    completedAt: row.completed_at
  };
}

function toSessionRow(session) {
  return {
    id: session.id,
    startup_id: session.startupId,
    status: session.status,
    generated_pitch: session.generatedPitch,
    one_liner: session.oneLiner,
    positioning: session.positioning,
    readiness_score: session.readinessScore,
    score_breakdown: session.scoreBreakdown,
    rewritten_pitch: session.rewrittenPitch,
    created_at: session.createdAt,
    completed_at: session.completedAt
  };
}

function toSessionPatch(patch) {
  const row = {};
  if ("status" in patch) row.status = patch.status;
  if ("generatedPitch" in patch) row.generated_pitch = patch.generatedPitch;
  if ("oneLiner" in patch) row.one_liner = patch.oneLiner;
  if ("positioning" in patch) row.positioning = patch.positioning;
  if ("readinessScore" in patch) row.readiness_score = patch.readinessScore;
  if ("scoreBreakdown" in patch) row.score_breakdown = patch.scoreBreakdown;
  if ("rewrittenPitch" in patch) row.rewritten_pitch = patch.rewrittenPitch;
  if ("completedAt" in patch) row.completed_at = patch.completedAt;
  return row;
}

function fromQuestionRow(row) {
  return {
    id: row.id,
    sessionId: row.session_id,
    investorType: row.investor_type,
    question: row.question,
    answer: row.answer || "",
    feedback: row.feedback || "",
    score: row.score,
    strongerAnswer: row.stronger_answer || "",
    createdAt: row.created_at
  };
}

function toQuestionRow(question) {
  return {
    id: question.id,
    session_id: question.sessionId,
    investor_type: question.investorType,
    question: question.question,
    answer: question.answer,
    feedback: question.feedback,
    score: question.score,
    stronger_answer: question.strongerAnswer,
    created_at: question.createdAt
  };
}

function toQuestionPatch(patch) {
  const row = {};
  if ("answer" in patch) row.answer = patch.answer;
  if ("feedback" in patch) row.feedback = patch.feedback;
  if ("score" in patch) row.score = patch.score;
  if ("strongerAnswer" in patch) row.stronger_answer = patch.strongerAnswer;
  return row;
}

function fromAssetRow(row) {
  return {
    id: row.id,
    sessionId: row.session_id,
    assetType: row.asset_type,
    content: row.content,
    createdAt: row.created_at
  };
}

function toAssetRow(asset) {
  return {
    id: asset.id,
    session_id: asset.sessionId,
    asset_type: asset.assetType,
    content: asset.content,
    created_at: asset.createdAt
  };
}

function fromAvatarRow(row) {
  return {
    id: row.id,
    sessionId: row.session_id,
    role: row.role,
    providerAvatarId: row.provider_avatar_id,
    displayName: row.display_name,
    persona: row.persona,
    createdAt: row.created_at
  };
}

function toAvatarRow(avatar) {
  return {
    id: avatar.id,
    session_id: avatar.sessionId,
    role: avatar.role,
    provider_avatar_id: avatar.providerAvatarId,
    display_name: avatar.displayName,
    persona: avatar.persona,
    created_at: avatar.createdAt
  };
}

function fromPersonalityRow(row) {
  return {
    id: row.id,
    role: row.role,
    displayName: row.display_name,
    category: row.category,
    persona: row.persona,
    questionStyle: row.question_style,
    systemPrompt: row.system_prompt,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at
  };
}

export async function createStartup(startup) {
  const client = await getClient();
  const rows = unwrap(
    await client.database.from("startups").insert([toStartupRow(startup)]).select(),
    "create startup"
  );
  return fromStartupRow(rows[0]);
}

export async function getStartup(id) {
  const client = await getClient();
  const row = unwrap(
    await client.database.from("startups").select("*").eq("id", id).maybeSingle(),
    "get startup"
  );
  return fromStartupRow(row);
}

export async function createSession(session) {
  const client = await getClient();
  const rows = unwrap(
    await client.database.from("pitch_sessions").insert([toSessionRow(session)]).select(),
    "create session"
  );
  return fromSessionRow(rows[0]);
}

export async function updateSession(id, patch) {
  const client = await getClient();
  const rows = unwrap(
    await client.database
      .from("pitch_sessions")
      .update(toSessionPatch(patch))
      .eq("id", id)
      .select(),
    "update session"
  );
  return fromSessionRow(rows[0]);
}

export async function getSession(id) {
  const client = await getClient();
  const session = fromSessionRow(
    unwrap(
      await client.database.from("pitch_sessions").select("*").eq("id", id).maybeSingle(),
      "get session"
    )
  );
  if (!session) return null;

  const [startup, questions, launchAssets, avatars] = await Promise.all([
    getStartup(session.startupId),
    client.database.from("investor_questions").select("*").eq("session_id", id),
    client.database.from("launch_assets").select("*").eq("session_id", id),
    client.database.from("avatars").select("*").eq("session_id", id)
  ]);

  return {
    ...session,
    startup,
    questions: unwrap(questions, "get investor questions").map(fromQuestionRow),
    launchAssets: unwrap(launchAssets, "get launch assets").map(fromAssetRow),
    avatars: unwrap(avatars, "get avatars").map(fromAvatarRow)
  };
}

export async function addQuestions(questions) {
  const client = await getClient();
  const rows = unwrap(
    await client.database
      .from("investor_questions")
      .insert(questions.map(toQuestionRow))
      .select(),
    "add questions"
  );
  return rows.map(fromQuestionRow);
}

export async function updateQuestionAnswer(questionId, patch) {
  const client = await getClient();
  const rows = unwrap(
    await client.database
      .from("investor_questions")
      .update(toQuestionPatch(patch))
      .eq("id", questionId)
      .select(),
    "update question answer"
  );
  return fromQuestionRow(rows[0]);
}

export async function addLaunchAssets(assets) {
  const client = await getClient();
  const rows = unwrap(
    await client.database.from("launch_assets").insert(assets.map(toAssetRow)).select(),
    "add launch assets"
  );
  return rows.map(fromAssetRow);
}

export async function addAvatars(avatars) {
  const client = await getClient();
  const rows = unwrap(
    await client.database.from("avatars").insert(avatars.map(toAvatarRow)).select(),
    "add avatars"
  );
  return rows.map(fromAvatarRow);
}

export async function getAgentPersonalities() {
  const client = await getClient();
  const rows = unwrap(
    await client.database
      .from("agent_personalities")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    "get agent personalities"
  );
  return rows.map(fromPersonalityRow);
}
