import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const dbPath = join(root, "..", ".data", "demo-day-store.json");

const emptyDb = {
  startups: [],
  pitchSessions: [],
  investorQuestions: [],
  launchAssets: [],
  avatars: [],
  agentPersonalities: []
};

async function loadDb() {
  try {
    const raw = await readFile(dbPath, "utf8");
    return { ...emptyDb, ...JSON.parse(raw) };
  } catch (error) {
    if (error.code === "ENOENT") return { ...emptyDb };
    throw error;
  }
}

async function saveDb(db) {
  await mkdir(dirname(dbPath), { recursive: true });
  await writeFile(dbPath, JSON.stringify(db, null, 2));
}

export async function createStartup(startup) {
  const db = await loadDb();
  db.startups.push(startup);
  await saveDb(db);
  return startup;
}

export async function getStartup(id) {
  const db = await loadDb();
  return db.startups.find((startup) => startup.id === id) ?? null;
}

export async function createSession(session) {
  const db = await loadDb();
  db.pitchSessions.push(session);
  await saveDb(db);
  return session;
}

export async function updateSession(id, patch) {
  const db = await loadDb();
  const session = db.pitchSessions.find((item) => item.id === id);
  if (!session) return null;
  Object.assign(session, patch);
  await saveDb(db);
  return session;
}

export async function getSession(id) {
  const db = await loadDb();
  const session = db.pitchSessions.find((item) => item.id === id);
  if (!session) return null;

  return {
    ...session,
    startup: db.startups.find((startup) => startup.id === session.startupId) ?? null,
    questions: db.investorQuestions.filter((question) => question.sessionId === id),
    launchAssets: db.launchAssets.filter((asset) => asset.sessionId === id),
    avatars: db.avatars.filter((avatar) => avatar.sessionId === id)
  };
}

export async function addQuestions(questions) {
  const db = await loadDb();
  db.investorQuestions.push(...questions);
  await saveDb(db);
  return questions;
}

export async function updateQuestionAnswer(questionId, patch) {
  const db = await loadDb();
  const question = db.investorQuestions.find((item) => item.id === questionId);
  if (!question) return null;
  Object.assign(question, patch);
  await saveDb(db);
  return question;
}

export async function addLaunchAssets(assets) {
  const db = await loadDb();
  db.launchAssets.push(...assets);
  await saveDb(db);
  return assets;
}

export async function addAvatars(avatars) {
  const db = await loadDb();
  db.avatars.push(...avatars);
  await saveDb(db);
  return avatars;
}

export async function getAgentPersonalities() {
  const db = await loadDb();
  return db.agentPersonalities.length > 0 ? db.agentPersonalities : defaultPersonalities;
}

const defaultPersonalities = [
  {
    id: "persona_angel_investor",
    role: "angel_investor",
    displayName: "Angel Investor",
    category: "investor",
    persona: "Early-stage angel who bets on founder-market fit, speed, and narrative clarity.",
    questionStyle: "Asks about why this founder, why now, first customers, and what unlocks the next milestone.",
    systemPrompt: "You are an angel investor evaluating an early-stage founder. Be warm but precise.",
    sortOrder: 10,
    isActive: true
  },
  {
    id: "persona_skeptical_partner",
    role: "skeptical_partner",
    displayName: "Skeptical Partner",
    category: "investor",
    persona: "Unimpressed venture partner who attacks vague markets, weak moats, and feature-not-company ideas.",
    questionStyle: "Asks blunt questions about market size, urgency, competition, and venture scale.",
    systemPrompt: "You are a skeptical VC partner. Ask one hard question that exposes whether this is venture scale.",
    sortOrder: 20,
    isActive: true
  },
  {
    id: "persona_tech_journalist",
    role: "tech_journalist",
    displayName: "Tech Journalist",
    category: "media",
    persona: "Curious technology reporter looking for a clear story, novelty, stakes, and a headline.",
    questionStyle: "Asks what is new, who is affected, why readers should care, and what the broader trend is.",
    systemPrompt: "You are a tech journalist. Ask one question that decides whether this deserves coverage.",
    sortOrder: 90,
    isActive: true
  }
];
