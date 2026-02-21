import { GoogleGenerativeAI } from "@google/generative-ai";
import type { DatapackSpec } from "@lib/datapackPrompt";
import { buildDatapackPrompt } from "@lib/datapackPrompt";

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

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = buildDatapackPrompt({ idea: params.idea, version: params.version });

  // Force JSON-only output.
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json",
    },
  });

  const text = result.response.text();
  const jsonText = extractFirstJsonObject(text);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(`Failed to parse JSON from model: ${(err as Error).message}`);
  }

  return parsed as DatapackSpec;
}
