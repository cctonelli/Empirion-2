
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || "";

export const generateMarketAnalysis = async (championshipName: string, round: number, branch: string) => {
  if (!apiKey) return "API Key not configured. Market analysis unavailable.";

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a concise 1-paragraph market analysis for Round ${round} of the "${championshipName}" ${branch} simulation. 
      Focus on current economic trends, potential risks, and strategic advice for teams. Keep it professional and immersive.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 250,
      }
    });

    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The market is currently unstable. Strategic analysis failed.";
  }
};

export const generateExecutiveSummary = async (companyData: any) => {
    if (!apiKey) return "API Key not configured.";
    const ai = new GoogleGenAI({ apiKey });
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `As a senior business consultant, analyze these financial results: ${JSON.stringify(companyData)}. 
            Provide 3 key bullet points for improvement and 1 highlight.`,
        });
        return response.text;
    } catch (error) {
        return "Analysis unavailable.";
    }
};
