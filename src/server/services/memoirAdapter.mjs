import {
  evaluateMockAnswer,
  generateMockFinalReport,
  generateMockPitchPackage
} from "./mockMemoir.mjs";

async function postToMemoir(path, payload) {
  const baseUrl = process.env.MEMOIR_API_URL;
  if (!baseUrl) return null;

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(process.env.MEMOIR_API_KEY
        ? { authorization: `Bearer ${process.env.MEMOIR_API_KEY}` }
        : {})
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Memoir request failed: ${response.status}`);
  }

  return response.json();
}

export async function generatePitchPackage(context) {
  try {
    const remote = await postToMemoir("/pitch-package", { context });
    return remote ?? generateMockPitchPackage(context);
  } catch (error) {
    console.warn("[memoirAdapter] Falling back to mock pitch package:", error.message);
    return generateMockPitchPackage(context);
  }
}

export async function evaluateAnswer(input) {
  try {
    const remote = await postToMemoir("/evaluate-answer", input);
    return remote ?? evaluateMockAnswer(input);
  } catch (error) {
    console.warn("[memoirAdapter] Falling back to mock answer evaluation:", error.message);
    return evaluateMockAnswer(input);
  }
}

export async function generateFinalReport(input) {
  try {
    const remote = await postToMemoir("/final-report", input);
    return remote ?? generateMockFinalReport(input);
  } catch (error) {
    console.warn("[memoirAdapter] Falling back to mock final report:", error.message);
    return generateMockFinalReport(input);
  }
}
