import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  evaluateMockAnswer,
  generateMockFinalReport,
  generateMockPitchPackage,
  generateMockSocialPosts,
} from "./mockMemoir.mjs";

function getTextModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: "gemini-2.5-flash" });
}

function getImageModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key).getGenerativeModel({
    model: "gemini-2.5-flash-image",
    generationConfig: { responseModalities: ["IMAGE"] },
  });
}

function stripJSON(text) {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

// ─── Pitch Package ────────────────────────────────────────────────────────────

export async function generatePitchPackage(context) {
  const model = getTextModel();
  if (!model) {
    console.warn("[memoirAdapter] No GEMINI_API_KEY, using mock pitch package");
    return generateMockPitchPackage(context);
  }

  const prompt = `You are a YC partner helping a founder prepare for Demo Day.

Given this startup context, generate a pitch package. Return ONLY valid JSON with no markdown or code fences.

Startup context:
- Company: ${context.companyName}
- Description: ${context.description}
- Target customer: ${context.targetCustomer}
- Problem: ${context.problem}
- Solution: ${context.solution}
- Why now: ${context.whyNow}
${context.traction ? `- Traction: ${context.traction}` : ""}
${context.businessModel ? `- Business model: ${context.businessModel}` : ""}
${context.competitors ? `- Competitors: ${context.competitors}` : ""}
${context.founderVoiceSample ? `- Founder voice (match this tone): ${context.founderVoiceSample}` : ""}

Return this exact JSON shape:
{
  "pitch": "60-second spoken Demo Day pitch — confident, specific, no fluff, optimized for spoken delivery",
  "oneLiner": "one crisp sentence describing what the company does and for whom",
  "positioning": "one paragraph on why this product matters and what makes it different",
  "proofPoints": ["concrete claim 1", "concrete claim 2", "concrete claim 3"],
  "risks": ["investor concern 1", "investor concern 2", "investor concern 3"],
  "investorQuestions": [
    { "investorType": "skeptical_partner", "question": "hard question about market scale or urgency" },
    { "investorType": "technical_partner", "question": "hard question about product depth or moat" },
    { "investorType": "growth_partner", "question": "hard question about distribution or retention" }
  ]
}

Rules:
- No invented metrics or fake traction unless provided
- Sound like a real founder, not a generic AI assistant
- Keep the pitch under 150 words
- Questions must be specific to this startup, not generic`;

  try {
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(stripJSON(result.response.text()));
    return { ...parsed, launchAssets: generateMockPitchPackage(context).launchAssets };
  } catch (error) {
    console.warn("[memoirAdapter] Gemini pitch package failed, using mock:", error.message);
    return generateMockPitchPackage(context);
  }
}

// ─── Social Posts ─────────────────────────────────────────────────────────────

async function generatePostImage(context, postText, platform) {
  const model = getImageModel();
  if (!model) return null;

  const platformStyle = {
    x: "Twitter/X post card, dark background, clean typography",
    linkedin: "LinkedIn post, professional blue and white, corporate aesthetic",
    hackerNews: "Hacker News submission, minimal orange and white, technical",
    productHunt: "Product Hunt listing card, vibrant gradient, startup energy",
    instagram: "Instagram post, bold colors, modern startup visual",
  };

  const prompt = `Create a professional social media marketing image for a tech startup called ${context.companyName}.
Company description: ${context.description}
Platform style: ${platformStyle[platform] || "clean modern tech startup"}
Post context: ${postText.slice(0, 200)}
Style requirements: modern, high contrast, include company name prominently, no text clutter, suitable for ${platform}`;

  try {
    const result = await model.generateContent(prompt);
    const parts = result.response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData);
    if (!imagePart) return null;
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  } catch (error) {
    console.warn(`[memoirAdapter] Image gen failed for ${platform}:`, error.message);
    return null;
  }
}

export async function generateSocialPostText(context, pitch) {
  const model = getTextModel();
  if (!model) {
    console.warn("[memoirAdapter] No GEMINI_API_KEY, using mock social posts");
    return generateMockSocialPosts(context);
  }

  const prompt = `You are a startup marketing expert. Generate a full social media launch plan for this company.

Company: ${context.companyName}
Description: ${context.description}
Target customer: ${context.targetCustomer}
Problem: ${context.problem}
Solution: ${context.solution}
Why now: ${context.whyNow}
${context.traction ? `Traction: ${context.traction}` : ""}
Pitch: ${pitch}

Generate 3 posts for each platform. Each post must be distinct — different angle, different hook.
Return ONLY valid JSON, no markdown or code fences.

{
  "x": [
    { "text": "post 1 text — punchy, under 280 chars, strong hook, can use line breaks", "hook": "one-word angle e.g. Announcement, Story, Data" },
    { "text": "post 2", "hook": "..." },
    { "text": "post 3", "hook": "..." }
  ],
  "linkedin": [
    { "text": "post 1 — 150-300 words, narrative-driven, professional but human, founder voice", "hook": "..." },
    { "text": "post 2", "hook": "..." },
    { "text": "post 3", "hook": "..." }
  ],
  "hackerNews": [
    { "text": "Show HN title + 2-3 paragraph technical description, honest, no hype", "hook": "..." },
    { "text": "post 2 — Ask HN or discussion angle", "hook": "..." },
    { "text": "post 3 — different framing", "hook": "..." }
  ],
  "productHunt": [
    { "text": "tagline + 100-150 word description, feature-focused, benefit-led", "hook": "..." },
    { "text": "post 2", "hook": "..." },
    { "text": "post 3", "hook": "..." }
  ],
  "instagram": [
    { "text": "post 1 — visual storytelling, 3-5 short punchy lines, 5-8 relevant hashtags at end", "hook": "..." },
    { "text": "post 2", "hook": "..." },
    { "text": "post 3", "hook": "..." }
  ]
}

Rules:
- Each post sounds human and founder-authentic, not AI-generated marketing copy
- No fake metrics unless traction was provided
- Platform voice must match (X = punchy, LinkedIn = narrative, HN = technical, PH = product-focused, IG = visual/emotional)`;

  let posts;
  try {
    const result = await model.generateContent(prompt);
    posts = JSON.parse(stripJSON(result.response.text()));
  } catch (error) {
    console.warn("[memoirAdapter] Social post text generation failed, using mock:", error.message);
    return generateMockSocialPosts(context);
  }

  // Generate images for all posts in parallel
  const platforms = Object.keys(posts);
  const imageJobs = platforms.flatMap((platform) =>
    posts[platform].map((post, i) => ({ platform, i, text: post.text }))
  );

  const images = await Promise.all(
    imageJobs.map(({ platform, text }) => generatePostImage(context, text, platform))
  );

  // Attach images back to posts
  let imageIndex = 0;
  for (const platform of platforms) {
    for (const post of posts[platform]) {
      post.imageData = images[imageIndex++] ?? null;
    }
  }

  return posts;
}

// ─── Answer Evaluation ────────────────────────────────────────────────────────

export async function evaluateAnswer(input) {
  const model = getTextModel();
  if (!model) return evaluateMockAnswer(input);

  const prompt = `You are a YC partner evaluating a founder's answer to an investor question during Demo Day practice.

Company: ${input.context?.companyName ?? "the startup"}
Investor type: ${input.investorType}
Question: ${input.question}
Founder's answer: ${input.answer}

Return ONLY valid JSON, no markdown or code fences:
{
  "score": <integer 1-10>,
  "feedback": "2-3 sentence critique — what worked and what missed",
  "strongerAnswer": "a rewritten version of the answer that directly addresses the question with specificity"
}

Scoring guide: 1-4 = vague or evasive, 5-7 = decent but needs sharpening, 8-10 = specific, credible, confident.`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(stripJSON(result.response.text()));
  } catch (error) {
    console.warn("[memoirAdapter] Gemini answer eval failed, using mock:", error.message);
    return evaluateMockAnswer(input);
  }
}

// ─── Final Report ─────────────────────────────────────────────────────────────

export async function generateFinalReport(input) {
  const model = getTextModel();
  if (!model) return generateMockFinalReport(input);

  const answersBlock = (input.answers ?? [])
    .map((a) => `[${a.investorType}] Q: ${a.question}\nA: ${a.answer}\nFeedback: ${a.feedback ?? "none"}`)
    .join("\n\n");

  const prompt = `You are a YC partner giving a founder their Demo Day readiness assessment.

Company: ${input.context?.companyName}
Original pitch: ${input.originalPitch}

Q&A session:
${answersBlock}

Return ONLY valid JSON, no markdown or code fences:
{
  "readinessScore": <integer 0-100>,
  "scoreBreakdown": {
    "clarity": <1-10>,
    "urgency": <1-10>,
    "market": <1-10>,
    "differentiation": <1-10>,
    "gtm": <1-10>,
    "fundability": <1-10>
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "rewrittenPitch": "improved 60-second pitch that addresses the weaknesses exposed during Q&A",
  "launchAssets": [
    { "assetType": "linkedin_post", "content": "..." },
    { "assetType": "product_hunt_description", "content": "..." }
  ]
}

Be honest. A hackathon prototype should not score above 75 unless traction is real.`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(stripJSON(result.response.text()));
  } catch (error) {
    console.warn("[memoirAdapter] Gemini final report failed, using mock:", error.message);
    return generateMockFinalReport(input);
  }
}
