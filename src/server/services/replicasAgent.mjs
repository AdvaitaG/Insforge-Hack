// Real Replicas coding-agent client (tryreplicas.com).
//
// Replicas spins up an autonomous coding agent in a workspace bound to a
// connected GitHub repo. We use it as the "Technical Partner" investor: a real
// agent that reads the founder's actual codebase and grounds its critique in
// real files, instead of an LLM guessing from a README.
//
// All calls are server-side so the API key never reaches the browser.

// Read env lazily: the server's loadLocalEnv() runs AFTER static imports, so
// reading process.env at module top-level would capture empty values.
function cfg() {
  return {
    base: process.env.REPLICAS_API_URL || "https://api.tryreplicas.com/v1",
    key: process.env.REPLICAS_API_KEY || "",
    environmentId: process.env.REPLICAS_ENVIRONMENT_ID || "",
    repoId: process.env.REPLICAS_REPO_ID || ""
  };
}

export function replicasConfigured() {
  const { key, environmentId } = cfg();
  return Boolean(key && environmentId);
}

async function call(path, { method = "GET", body } = {}) {
  const { base, key } = cfg();
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(`Replicas ${method} ${path} -> ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function listRepositories() {
  return call("/replica/repositories");
}

// Create a Replica (agent) on the connected repo with a task message.
export function createReplica({
  name,
  message,
  codingAgent = "claude",
  model = "sonnet",
  lifecyclePolicy = "delete_after_inactivity",
  size = "small",
}) {
  return call("/replica", {
    method: "POST",
    body: {
      name,
      environment_id: cfg().environmentId,
      message,
      coding_agent: codingAgent,
      model,
      lifecycle_policy: lifecyclePolicy,
      size,
    },
  });
}

// Fetch a Replica's current state. include can be "environment" or "diffs".
export function getReplica(id, { include } = {}) {
  const q = include ? `?include=${encodeURIComponent(include)}` : "";
  return call(`/replica/${id}${q}`);
}

// Send a follow-up message to a running Replica (the live investor chat channel).
export function sendMessage(id, message) {
  return call(`/replica/${id}/messages`, { method: "POST", body: { message } });
}

export function deleteReplica(id) {
  return call(`/replica/${id}`, { method: "DELETE" });
}

// ─── Technical Due Diligence ──────────────────────────────────────────────────

const DD_PROMPT = `You are a skeptical YC technical partner doing due diligence on this startup's actual codebase. Do NOT modify any files or open a pull request. Read the repository and produce a concise technical assessment.

Return ONLY a JSON object (no prose, no markdown fences) with this exact shape:
{
  "summary": "2-3 sentence assessment of the codebase",
  "stack": ["key technologies you actually found"],
  "strengths": ["specific strengths, cite real files/paths"],
  "risks": ["specific technical risks or red flags, cite real files/paths"],
  "questions": ["3-5 sharp technical due-diligence questions grounded in the real code"],
  "depthScore": <integer 0-10 for product/engineering depth>
}`;

// Kick off a read-only technical DD agent on the repo. Returns the created Replica.
export function startTechnicalDueDiligence(label = "tech-dd") {
  return createReplica({
    name: `${label}-${Date.now().toString(36)}`,
    message: DD_PROMPT,
    lifecyclePolicy: "delete_after_inactivity",
    size: "small",
  });
}

// Best-effort extraction of the agent's structured findings from a Replica
// payload. The agent's textual output location can vary, so we scan common
// fields for a JSON object matching the DD shape.
export function extractFindings(replica) {
  const candidates = [];
  const push = (v) => {
    if (typeof v === "string" && v.trim()) candidates.push(v);
  };

  push(replica?.result);
  push(replica?.output);
  push(replica?.summary);
  push(replica?.last_message);
  if (Array.isArray(replica?.messages)) {
    for (const m of replica.messages) {
      push(typeof m === "string" ? m : m?.content || m?.text || m?.message);
    }
  }

  for (let i = candidates.length - 1; i >= 0; i--) {
    const parsed = tryParseFindings(candidates[i]);
    if (parsed) return parsed;
  }
  return null;
}

function tryParseFindings(text) {
  // Strip markdown fences if present.
  const cleaned = text.replace(/```json|```/gi, "").trim();
  // Find the outermost JSON object.
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const obj = JSON.parse(cleaned.slice(start, end + 1));
    if (obj && (obj.summary || obj.questions || obj.risks)) return obj;
  } catch {
    /* not JSON */
  }
  return null;
}

// ─── SSE Streaming ────────────────────────────────────────────────────────────

// Returns the raw upstream SSE Response so a route can pipe it to the browser.
export function openEventStream(id, signal) {
  const { base, key } = cfg();
  return fetch(`${base}/replica/${id}/events`, {
    headers: { Authorization: `Bearer ${key}`, Accept: "text/event-stream" },
    signal,
  });
}

// Pull any human-readable assistant text out of a parsed SSE event payload.
// Replicas wraps coding-agent output in chat.turn.delta -> payload.event.
function textFromEvent(evt) {
  const out = [];
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    // Common Claude/Codex content shapes.
    if (typeof node.text === "string") out.push(node.text);
    if (typeof node.content === "string") out.push(node.content);
    if (Array.isArray(node.content)) {
      for (const c of node.content) {
        if (typeof c === "string") out.push(c);
        else if (c && typeof c.text === "string") out.push(c.text);
      }
    }
    if (typeof node.message === "string") out.push(node.message);
    for (const k of Object.keys(node)) {
      if (typeof node[k] === "object") visit(node[k]);
    }
  };
  visit(evt);
  return out.join("");
}

// Consume the SSE stream for one analysis run: accumulate assistant text until
// the turn completes (or errors / times out). Returns best-effort findings +
// status so callers can fall back to Gemini when the agent can't execute.
export async function collectAnalysis(id, { timeoutMs = 90000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let text = "";
  let completed = false;
  let errored = false;
  let telemetry = null;

  try {
    const res = await openEventStream(id, ctrl.signal);
    if (!res.ok || !res.body) {
      return { text: "", completed: false, errored: true, telemetry: null };
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const frames = buf.split("\n\n");
      buf = frames.pop() || "";
      for (const frame of frames) {
        const dataLine = frame.split("\n").find((l) => l.startsWith("data:"));
        if (!dataLine) continue;
        let data;
        try {
          data = JSON.parse(dataLine.slice(5).trim());
        } catch {
          continue;
        }
        if (data.type === "engine.status.changed") {
          telemetry = data.payload?.status ?? telemetry;
          continue;
        }
        if (data.type === "chat.turn.delta") {
          const inner = data.payload?.event;
          const innerType = inner?.type || "";
          if (/result|error/i.test(innerType) && /error/i.test(JSON.stringify(inner?.payload || {}))) {
            errored = true;
          }
          const t = textFromEvent(inner);
          if (t) text += t;
        }
        if (data.type === "chat.turn.completed" && data.payload?.isComplete) {
          completed = true;
        }
      }
      if (completed) break;
    }
  } catch {
    // aborted or network end
  } finally {
    clearTimeout(timer);
    ctrl.abort();
  }

  return { text: text.trim(), completed, errored, telemetry };
}

export function getReplicasMeta() {
  const { base, environmentId, repoId } = cfg();
  return { base, environmentId, repoId };
}
