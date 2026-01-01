
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Generates market analysis using gemini-3-flash-preview.
 */
export const generateMarketAnalysis = async (championshipName: string, round: number, branch: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the Empirion Market AI. Provide a quantitative strategic brief for Round ${round} of the "${championshipName}" ${branch} championship. 
      Focus on:
      1. Economic volatility impacts on unit margin.
      2. Competitive survival price points.
      3. A specific 'Black Swan' warning.
      Keep it strictly under 100 words, executive tone.`,
      config: {
        temperature: 0.6,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "Market stable. Unit costs projected to hold within +/- 2% margin.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Intelligence feed interrupted. Maintain defensive posture.";
  }
};

/**
 * Generates narrative headlines for Gazeta Industrial.
 */
export const generateGazetaNews = async (marketStatus: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 high-impact news headlines for a business newspaper named "Gazeta Industrial". 
      Context: Business simulation round complete. 
      Company 8 is leading, Inflation is 1.0%, Interest is 2.0%. 
      Include one headline about "CVM analysis" and one about "Supply Chain reajuste".
      Keep it in Portuguese (Brazil). Professional journalism style.`,
      config: { temperature: 0.8 }
    });

    return response.text || "Mercado estável: Empresas aguardam nova rodada de investimentos.";
  } catch (error) {
    return "Gazeta em manutenção: Aguardando boletim oficial da CVM.";
  }
};

/**
 * Performs a search-grounded query.
 */
export const performGroundedSearch = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for real-world business trends relevant to: ${query}. Synthesize for a strategist.`,
      config: { tools: [{ googleSearch: {} }] },
    });

    const text = response.text || "No grounded intelligence found.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks.filter((chunk: any) => chunk.web?.uri).map((chunk: any) => ({
      uri: chunk.web.uri,
      title: chunk.web.title || "Source"
    }));

    return { text, sources };
  } catch (error) {
    return { text: "Search grounding module failure.", sources: [] };
  }
};

/**
 * Creates a high-reasoning chat session.
 */
export const createChatSession = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `You are "Empirion Strategos". You specialize in mathematical business modeling and accounting strategy. Adhere to Bernard Sistemas principles.`,
      thinkingConfig: { thinkingBudget: 32768 }
    },
  });
};
