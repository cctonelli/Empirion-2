import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Generates market analysis using gemini-3-flash-preview for general insights.
 */
export const generateMarketAnalysis = async (championshipName: string, round: number, branch: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a high-level executive strategic summary for Round ${round} of the "${championshipName}" ${branch} simulation. 
      Analyze potential volatility and provide one key strategic pillar for teams to focus on. Keep it under 100 words.`,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Market stable. Proceed with standard operations.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Intelligence feed interrupted. Maintain defensive posture.";
  }
};

/**
 * Performs a search-grounded query using Google Search.
 * Extracts URLs from groundingChunks as required.
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

    const text = response.text || "No grounded intelligence found.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract unique sources
    const sources = chunks
      .filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        uri: chunk.web.uri,
        title: chunk.web.title || "External Intelligence Source"
      }));

    return { text, sources };
  } catch (error) {
    console.error("Search Grounding Error:", error);
    return { text: "Search grounding module failure.", sources: [] };
  }
};

/**
 * Creates a high-reasoning chat session using gemini-3-pro-preview.
 */
export const createChatSession = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `You are "Empirion Strategos", the supreme AI consultant of the Empirion Business Intelligence Platform.
      Your goal is to provide elite-level business advice based on simulation data. 
      You explain complex concepts like EBITDA, ROI, NPV, and DRE (Demonstração do Resultado do Exercício).
      You are professional, analytical, and prioritize shareholder value.
      Language: Respond in the language the user addresses you in (primarily Portuguese or English).`,
    },
  });
};
