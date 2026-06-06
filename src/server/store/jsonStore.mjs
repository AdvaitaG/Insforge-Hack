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
  avatars: []
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
