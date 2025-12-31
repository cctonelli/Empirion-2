
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Generates market analysis using gemini-3-flash-preview for general insights.
 */
export const generateMarketAnalysis = async (championshipName: string, round: number, branch: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a concise 1-paragraph market analysis for Round ${round} of the "${championshipName}" ${branch} business simulation. 
      Focus on current economic trends, potential risks, and strategic advice for competing teams. Keep it professional and immersive.`,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The market is currently unstable. Strategic analysis failed.";
  }
};

/**
 * Performs a search-grounded query using Google Search.
 * Extracts URLs as required by the guidelines.
 */
export const performGroundedSearch = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No information found.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return { text, sources };
  } catch (error) {
    console.error("Search Grounding Error:", error);
    return { text: "Error fetching real-time data.", sources: [] };
  }
};

/**
 * Creates a chat session for the global assistant.
 */
export const createChatSession = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'You are "Empirion AI", a world-class business consultant assistant for an elite business simulation platform. You provide data-driven advice, explain financial concepts (DRE, Balanço, Fluxo de Caixa), and help users strategize their moves. Be professional, concise, and insightful.',
    },
  });
};
