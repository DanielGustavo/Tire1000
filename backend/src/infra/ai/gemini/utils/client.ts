import { GoogleGenAI } from "@google/genai";

export function createGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });
}
