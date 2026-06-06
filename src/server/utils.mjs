import { randomUUID } from "node:crypto";

export function id(prefix) {
  return `${prefix}_${randomUUID().slice(0, 8)}`;
}

export function now() {
  return new Date().toISOString();
}

export async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("Invalid JSON body");
    error.status = 400;
    throw error;
  }
}

export function sendJson(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization"
  });
  res.end(JSON.stringify(body, null, 2));
}

export function notFound(res) {
  sendJson(res, 404, { error: "Not found" });
}

export function assertRequired(body, fields) {
  const missing = fields.filter((field) => !body[field]);
  if (missing.length > 0) {
    const error = new Error(`Missing required field(s): ${missing.join(", ")}`);
    error.status = 400;
    throw error;
  }
}

export function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}
