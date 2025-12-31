
import { GoogleGenAI } from "@google/genai";

/**
 * Generates market analysis using gemini-3-flash-preview for general insights.
 * Follows guidelines for direct process.env.API_KEY usage.
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
        // Removed maxOutputTokens as it's not strictly required and can block output.
      }
    });

    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The market is currently unstable. Strategic analysis failed.";
  }
};

/**
 * Generates an initial scenario report using gemini-3-flash-preview.
 */
export const generateInitialReport = async (branch: string, scenarioName: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate an "Initial Executive Report" for a new business simulation scenario called "${scenarioName}" in the ${branch} sector. 
      Include:
      1. Context of the market entry.
      2. 3 Main challenges specific to ${branch}.
      3. A summary of the starting financial health (stable but competitive).
      Keep it formatted in clean markdown.`,
    });
    return response.text || "Report generation failed.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Report generation failed.";
  }
};

/**
 * Analyzes complex company financials using gemini-3-pro-preview for advanced reasoning.
 */
export const generateExecutiveSummary = async (companyData: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `As a senior business consultant, analyze these financial results for a ${companyData.branch} company: ${JSON.stringify(companyData.financials)}. 
            Provide 3 key bullet points for improvement and 1 strategic highlight.`,
        });
        return response.text || "Analysis unavailable.";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Analysis unavailable.";
    }
};
