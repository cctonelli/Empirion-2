import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Generates market analysis using gemini-3-flash-preview for general insights.
 * Upgraded to focus on competitive dynamics and financial logic.
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
    return "Intelligence feed interrupted. Maintain defensive posture and monitor cash flow reserves.";
  }
};

/**
 * Performs a search-grounded query using Google Search.
 */
export const performGroundedSearch = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for real-world business trends, commodity pricing, or economic reports relevant to: ${query}. 
      Synthesize the data into a strategic insight for a business simulation player.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No grounded intelligence found.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = chunks
      .filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        uri: chunk.web.uri,
        title: chunk.web.title || "External Intelligence Source"
      }));

    return { text, sources };
  } catch (error) {
    console.error("Search Grounding Error:", error);
    return { text: "Search grounding module failure. External data context unavailable.", sources: [] };
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
      systemInstruction: `You are "Empirion Strategos", a hyper-advanced corporate advisor.
      You specialize in competitive equilibrium, mathematical business modeling (Bonopoly systems), and accounting strategy.
      When asked about decisions:
      - Analyze the trade-offs between Marketing GRP and Unit Price.
      - Explain the 'Learning Curve' impact on production costs.
      - Advise on debt-to-equity ratios and CapEx timing.
      Always maintain a cold, analytical, yet encouraging executive tone.`,
      thinkingConfig: { thinkingBudget: 32768 }
    },
  });
};
