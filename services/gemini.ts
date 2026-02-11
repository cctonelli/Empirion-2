
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ScenarioType, DecisionData, MacroIndicators, AnalysisSource, Branch, RegionType, BlackSwanEvent } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const auditBusinessPlan = async (section: string, text: string, history: any[]) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Você é o Auditor Temporal do Empirion. Analise a coerência desta seção do Business Plan.
      
      Seção: ${section}
      Conteúdo Atual: "${text}"
      Histórico da Empresa (P00 até Round Anterior): ${JSON.stringify(history.map(h => h.kpis))}
      
      Sua Tarefa (Fidelidade v17.0):
      1. Verifique se a estratégia declarada condiz com a tendência dos KPIs históricos (ex: se o usuário diz que vai crescer, mas a Liquidez está caindo, aponte a falha).
      2. Detecte especificamente o "Efeito Tesoura" (NLCDG crescendo acima do Working Capital).
      3. Analise o Giro de Estoque e a Imobilização do PL.
      4. Dê um parecer tático de "Go" ou "No-Go" para investidores.
      
      Idioma: Português (Brasil). Máximo 180 palavras. Tom: Analítico e Crítico.`,
      config: { 
        thinkingConfig: { thinkingBudget: 8192 },
        temperature: 0.4
      }
    });

    // Fix: Access .text property directly
    return response.text || "Auditoria neural interrompida.";
  } catch (error) {
    console.error("Audit error:", error);
    return "Falha no canal de análise histórica.";
  }
};

export const generateBusinessPlanField = async (
  sectionTitle: string, 
  fieldLabel: string, 
  userContext: string, 
  prompt: string, 
  branch: string
) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é o Strategos Business Architect. 
      Estou no setor ${branch}. Seção: ${sectionTitle}.
      Prompt: ${prompt}
      Contexto Usuário: "${userContext}"
      Gere uma análise baseada em dados, usando termos como EBITDA, NLCDG, ROI e Market Fit. Seja direto.`,
      config: { temperature: 0.7 }
    });
    // Fix: Access .text property directly
    return response.text || "Insight indisponível.";
  } catch (error) { 
    console.error("Generator error:", error);
    return "Erro no núcleo cognitivo."; 
  }
};

// Added missing export generateMarketAnalysis
export const generateMarketAnalysis = async (arenaName: string, round: number, branch: string) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere uma análise estratégica curta para a arena ${arenaName}, ciclo 0${round}, ramo ${branch}. Foque em competitividade e saúde financeira das unidades operantes.`,
      config: { temperature: 0.6 }
    });
    // Fix: Access .text property directly
    return response.text || "Insight indisponível.";
  } catch (err) {
    console.error("Analysis Error:", err);
    return "Falha na análise neural.";
  }
};

// Added missing export performGroundedSearch
export const performGroundedSearch = async (query: string) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Pesquise e analise a seguinte consulta de mercado para uma simulação empresarial: "${query}". Forneça dados atualizados e tendências reais.`,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3
      },
    });

    // Fix: Access .text property directly and extract grounding sources
    const text = response.text || "Nenhum resultado processado.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Fonte de Inteligência",
      uri: chunk.web?.uri || "#"
    })) || [];

    return { text, sources };
  } catch (err) {
    console.error("Grounded Search Error:", err);
    return { text: "Falha no canal de busca groundada.", sources: [] };
  }
};

export const getLiveDecisionAdvice = async (decisions: DecisionData, branch: string) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise estas decisões de simulação empresarial (${branch}): ${JSON.stringify(decisions)}. Identifique erros fatais.`,
      config: { temperature: 0.5 }
    });
    // Fix: Access .text property directly
    return response.text;
  } catch (err) { return null; }
};

export const generateBotDecision = async (branch: Branch, round: number, regionCount: number, macro: MacroIndicators): Promise<DecisionData> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere decisões competitivas para round ${round} em ${branch}. Considere o cenário macro: ${JSON.stringify(macro)}. Retorne apenas JSON puro.`,
      config: { responseMimeType: "application/json" }
    });
    // Fix: Access .text property directly
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { judicial_recovery: false, regions: {}, hr: {}, production: {}, machinery: {}, finance: {}, estimates: {} } as any;
  }
};

export const generateBlackSwanEvent = async (branch: Branch): Promise<BlackSwanEvent> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere um Cisne Negro para ${branch}. Deve ser um evento econômico inesperado com modificadores para inflação, demanda, juros e produtividade. Retorne apenas JSON puro.`,
      config: { responseMimeType: "application/json" }
    });
    // Fix: Access .text property directly
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { title: "Crise", description: "...", impact: "...", modifiers: { inflation: 1, demand: -10, interest: 1, productivity: -0.1 } };
  }
};

export const createChatSession = () => {
  const ai = getClient();
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: 'Você é o Empirion Strategos, mentor tático assistido por IA. Analise as dúvidas do usuário com foco em TSR, EBITDA e Solvência.',
      thinkingConfig: { thinkingBudget: 8192 }
    },
  });
};
