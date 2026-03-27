const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simulating LaunchTrack input
const projectUpdate = {
  project: "Acme CRM Implementation",
  update:
    "Client has not shared API access for 5 days. Requirements are still evolving. Integration blocked.",
};

function cleanJSON(raw) {
  return raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/\n/g, "")
    .replace(/\r/g, "")
    .trim();
}

async function analyzeRisk() {
  const prompt = `
You are an experienced SaaS implementation manager.

Analyze the project update and return structured intelligence.

IMPORTANT:
- Return ONLY valid JSON
- Do NOT include explanations
- Do NOT include markdown or backticks
- Output must be directly parseable

Format:
{
  "riskLevel": "LOW | MEDIUM | HIGH",
  "confidence": "LOW | MEDIUM | HIGH",
  "issues": ["..."],
  "impact": {
    "timeline": "LOW | MEDIUM | HIGH",
    "scope": "LOW | MEDIUM | HIGH"
  },
  "recommendedActions": ["..."]
}

Project Update:
${projectUpdate.update}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const rawOutput = response.choices[0].message.content;
  const cleaned = cleanJSON(rawOutput);


try {
  const result = JSON.parse(cleaned);
  
  console.log("\n=== IMPLEMENTATION INTELLIGENCE ENGINE ===\n");
  console.log(JSON.stringify(result, null, 2));

} catch (error) {
  console.log("\n⚠️ JSON PARSE FAILED. Raw output below:\n");
  console.log(rawOutput);
}

await generateSummary(projectUpdate.update);
await detectScopeCreep(projectUpdate.update);
}

async function generateSummary(update) {
  const prompt = `
You are an implementation manager preparing a stakeholder update.

Convert the following raw update into a clean, professional summary.

Format:
- Overall Status
- Key Progress
- Risks / Blockers
- Next Steps

Keep it concise and clear.

Update:
${update}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
  });

  console.log("\n=== STAKEHOLDER SUMMARY ===\n");
  console.log(response.choices[0].message.content);
}

async function detectScopeCreep(update) {
  const prompt = `
You are an implementation manager.

Analyze the update and determine if there is scope creep.

Respond ONLY in JSON.

Format:
{
  "scopeCreep": "YES | NO",
  "confidence": "LOW | MEDIUM | HIGH",
  "reason": "...",
  "recommendedAction": "..."
}

Update:
${update}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.choices[0].message.content;
  const cleaned = cleanJSON(raw);

  try {
    const result = JSON.parse(cleaned);

    console.log("\n=== SCOPE CREEP ANALYSIS ===\n");
    console.log(JSON.stringify(result, null, 2));

  } catch (e) {
    console.log("\n⚠️ Scope detection failed\n", raw);
  }
}

analyzeRisk();

