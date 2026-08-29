import { GoogleGenAI } from "@google/genai";

export class LLMService {
  private client: GoogleGenAI | null = null;
  private modelName: string;

  constructor() {
    this.modelName = process.env.LLM_MODEL_NAME || "gemini-2.5-flash";
  }

  private getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY (or LLM_API_KEY) environment variable is not configured."
      );
    }
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey });
    }
    return this.client;
  }

  private cleanJsonString(rawText: string): string {
    let clean = rawText.trim();
    if (clean.startsWith("```json")) {
      clean = clean.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (clean.startsWith("```")) {
      clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    return clean.trim();
  }

  async complete<T>(
    systemPrompt: string,
    userPrompt: string,
    fallbackValidator?: (data: any) => T
  ): Promise<T> {
    const ai = this.getClient();
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: this.modelName,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.0,
            responseMimeType: "application/json",
          },
        });

        const rawText = response.text;
        if (!rawText) {
          throw new Error("Gemini returned an empty response.");
        }

        const cleanedJson = this.cleanJsonString(rawText);
        const parsed = JSON.parse(cleanedJson);

        if (fallbackValidator) {
          return fallbackValidator(parsed);
        }
        return parsed as T;
      } catch (err: any) {
        lastError = err;
        const errStr = String(err?.message || err);

        const isTemporary =
          errStr.includes("503") ||
          errStr.includes("429") ||
          errStr.includes("UNAVAILABLE") ||
          errStr.includes("high demand") ||
          errStr.toLowerCase().includes("temporarily unavailable") ||
          errStr.toLowerCase().includes("resource exhausted");

        if (isTemporary && attempt < maxRetries - 1) {
          const waitMs = Math.pow(2, attempt) * 1000;
          console.warn(
            `[Gemini LLM] Temporary error encountered. Retrying in ${waitMs}ms (attempt ${
              attempt + 1
            }/${maxRetries})...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          continue;
        }

        break;
      }
    }

    throw new Error(`Gemini LLM invocation failed: ${lastError?.message || lastError}`);
  }
}
