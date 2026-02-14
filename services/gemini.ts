
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ScenarioType, DecisionData, MacroIndicators, AnalysisSource, Branch, RegionType, BlackSwanEvent, TransparencyLevel, GazetaMode } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const auditBusinessPlan = async (section: string, contextJson: string, history: any[]) => {
  try {
    const ai = getClient();
    const context = JSON.parse(contextJson);
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Você é o Auditor Master do Empirion, especialista em Business Model Generation (metodologia Osterwalder).
      
      Seção Atual: ${section}
      Epicentro Declarado: ${context.epicenter}
      Canvas Completo: ${JSON.stringify(context.canvas)}
      Histórico de KPIs: ${JSON.stringify(history.map(h => ({ round: h.round, kpis: h.kpis })))}
      
      Sua Tarefa (Fidelidade v18.0):
      1. Verifique se existe COERÊNCIA entre a Proposta de Valor e os Segmentos de Clientes no Canvas.
      2. Critique se as Atividades Chave justificam a Estrutura de Custos.
      3. Analise se o KPI histórico (ex: ROI, Liquidez) reflete a eficiência do modelo desenhado.
      4. Identifique contradições lógicas (ex: Modelo de baixo custo com marketing agressivo ou parceiros de luxo).
      
      Idioma: Português (Brasil). Máximo 150 palavras. Tom: Direto, Construtivo e Altamente Técnico.`,
      config: { 
        thinkingConfig: { thinkingBudget: 8192 },
        temperature: 0.4
      }
    });

    return response.text || "Auditoria neural interrompida.";
  } catch (error) {
    console.error("Audit error:", error);
    return "Falha no canal de análise estratégica.";
  }
};

export const generateBusinessPlanField = async (
  sectionTitle: string, 
  fieldLabel: string, 
  contextJson: string, 
  prompt: string, 
  branch: string
) => {
  try {
    const ai = getClient();
    const context = JSON.parse(contextJson);
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é o Strategos Business Architect. 
      Estou usando o framework de Business Model Generation.
      Setor: ${branch}. Seção: ${sectionTitle}.
      Prompt: ${prompt}
      Contexto dos Blocos: ${JSON.stringify(context.canvas)}
      Gere um insight estratégico que conecte a Proposta de Valor aos Recursos Chave. Seja técnico.`,
      config: { temperature: 0.7 }
    });
    return response.text || "Insight indisponível.";
  } catch (error) { 
    console.error("Generator error:", error);
    return "Erro no núcleo cognitivo."; 
  }
};

export const generateDynamicMarketNews = async (
  arenaName: string,
  round: number,
  branch: Branch,
  teamsData: any[],
  macro: MacroIndicators,
  transparency: TransparencyLevel,
  gazetaMode: GazetaMode
) => {
  try {
    const ai = getClient();
    const isAnonymous = gazetaMode === 'anonymous';
    
    const contextPrompt = `
      Você é o Editor-Chefe da Oracle Gazette, o jornal financeiro do ecossistema Empirion.
      Arena: ${arenaName} | Ciclo: 0${round} | Setor: ${branch}
      
      DADOS DO MERCADO (CRUZADOS):
      ${JSON.stringify(teamsData.map(t => ({
        alias: t.name,
        marketShare: t.market_share,
        equity: t.equity,
        rating: t.rating,
        profit: t.net_profit,
        roi: t.roi
      })))}
      
      CONJUNTURA ECONÔMICA:
      Inflação: ${macro.inflation_rate}% | Juros: ${macro.interest_rate_tr}% | ICE: ${macro.ice}
      
      DIRETRIZES DE PUBLICAÇÃO:
      1. Anonimato: ${isAnonymous ? "SIM. Use apelidos como 'Líder do Setor', 'Empresa A', 'Player Emergente'. NUNCA revele nomes reais." : "NÃO. Use os nomes reais das equipes."}
      2. Transparência: ${transparency}. (Low: foco apenas em macro; Medium: destaque para top 3 players; High/Full: análise detalhada de gaps).
      3. Tom: Profissional, alarmista se houver crise, e focado em métricas (TSR, Market Share).
      4. Idioma: Português (Brasil).
      5. Estrutura: Uma manchete impactante + 3 parágrafos curtos cobrindo: Ocorrências de Mercado, Desempenho do Líder e Alerta de Conjuntura.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contextPrompt,
      config: { 
        temperature: 0.8,
        maxOutputTokens: 500
      }
    });

    return response.text || "Os nodos de comunicação estão em manutenção.";
  } catch (error) {
    console.error("Gazette AI Error:", error);
    return "Falha na transmissão da Oracle Gazette.";
  }
};

export const generateMarketAnalysis = async (arenaName: string, round: number, branch: string) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere uma análise estratégica curta para a arena ${arenaName}, ciclo 0${round}, ramo ${branch}. Foque em competitividade e saúde financeira das unidades operantes.`,
      config: { temperature: 0.6 }
    });
    return response.text || "Insight indisponível.";
  } catch (err) {
    console.error("Analysis Error:", err);
    return "Falha na análise neural.";
  }
};

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
