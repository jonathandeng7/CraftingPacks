import { GoogleGenerativeAI } from "@google/generative-ai";
import type { DatapackSpec } from "@lib/datapackPrompt";
import { buildDatapackPrompt, DATAPACK_JSON_SCHEMA } from "@lib/datapackPrompt";

function extractFirstJsonObject(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model did not return a JSON object.");
  }
  return text.slice(start, end + 1);
}

export async function generateDatapackSpec(params: {
  idea: string;
  version: string;
}): Promise<DatapackSpec> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = buildDatapackPrompt({ idea: params.idea, version: params.version });

  // Force JSON-only output.
  const text = await callModel(model, prompt);
  const jsonText = extractFirstJsonObject(text);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(`Failed to parse JSON from model: ${(err as Error).message}`);
  }

  return parsed as DatapackSpec;
}

export async function repairDatapackSpec(params: {
  idea: string;
  version: string;
  spec: DatapackSpec;
  errors: string[];
}): Promise<DatapackSpec> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = [
    "You are fixing a Minecraft datapack JSON that failed validation.",
    "Return JSON ONLY (no markdown, no backticks, no commentary).",
    "The JSON MUST match exactly this schema:",
    DATAPACK_JSON_SCHEMA,
    "Do NOT remove required files or change the overall structure.",
    "Fix the following validation errors:",
    params.errors.join("\n"),
    "Original JSON:",
    JSON.stringify(params.spec),
    "Original idea:",
    params.idea,
    `Minecraft version: ${params.version}`,
  ].join("\n");

  const text = await callModel(model, prompt);
  const jsonText = extractFirstJsonObject(text);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(`Failed to parse JSON from model: ${(err as Error).message}`);
  }

  return parsed as DatapackSpec;
}

async function callModel(
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  prompt: string,
): Promise<string> {
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json",
    },
  });

  return result.response.text();
}
