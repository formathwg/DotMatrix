import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, Language } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey });

/**
 * Analyzes an image to provide an artistic title and description.
 * @param base64Image The image data in base64 format (without data:image/png;base64 prefix)
 * @param mimeType The mime type of the image
 * @param lang The language for the response ('en' or 'zh')
 */
export const analyzeImageArt = async (
  base64Image: string,
  mimeType: string = "image/png",
  lang: Language = 'en'
): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure process.env.API_KEY.");
  }

  try {
    const langInstruction = lang === 'zh' 
      ? "Respond in Simplified Chinese (简体中文)." 
      : "Respond in English.";

    const prompt = `
      You are an art critic at a modern art gallery. 
      Analyze the provided image. It is about to be converted into a halftone dot-matrix style piece.
      ${langInstruction}
      
      1. Provide a creative, abstract, or short punchy Title for this piece.
      2. Write a brief, 2-sentence artistic description of the subject matter and composition.
      3. Provide 3-5 relevant keywords/tags.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "description", "tags"]
        }
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini.");
    }

    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};